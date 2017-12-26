'use strict';

// load the post model
var bcrypt = require('bcryptjs');
var express = require('express');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config/config');
var Post = require('../models/Post');
var User = require('../models/User');
var Offer = require('../models/Offer');
var Activity = require('../models/Activity');
var Notification = require('../models/Notification');
var Like = require('../models/Like');
var router = express.Router();
var request = require('request');
var qs = require('querystring');
var crypto = require('crypto');
var async = require('async');
var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var emailParser = require("email-addresses");
var gcm = require('node-gcm');
var sharp = require('sharp');
var request = require('request').defaults({encoding: null});
var redis = require('redis');
var redisWorker = redis.createClient();
redisWorker.select(2);

var sgOptions = {
    auth: {
        api_user: config.SENDGRID_USERNAME,
        api_key: config.SENDGRID_PASSWORD
    }
};


var aws = require('aws-sdk');
var AWS_ACCESS_KEY = config.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = config.AWS_SECRET_KEY;
var S3_BUCKET = config.S3_BUCKET;

var GOOGLE_API_KEY = config.GOOGLE_API_KEY;

var templatesDir = path.resolve(__dirname, '..', 'templates');


/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function isAuthenticated(req, res, next) {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).send({ message: 'You did not provide a JSON Web Token in the Authorization header.' });
  }

  var header = req.headers.authorization.split(' ');
  var token = header[1];
  var payload = jwt.decode(token, config.tokenSecret);
  var now = moment().unix();

  if (now > payload.exp) {
    return res.status(401).send({ message: 'Token has expired.' });
  }

  User.findById(payload.sub, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  })
}

function addActivityToUser(userID, activityObj) {

  User.findOne({
    _id: userID
  }, function(err, user) {
    if (err) {
      return err;
    }

    user.myActivity.unshift(activityObj);

    user.save(function(err, user) {
      if (err)
        return err;

      return true;
    });

  });

}

function sendNotificationToUser2(userProfile, user2_id, notifType, req, activityObj) {

  // find the user2
  User
  .findOne({ _id:user2_id })
  .populate('notifications') 
  .exec(function(err, user2Profile) {

    var socketio = req.app.get('socketio');

    // send a follow toast
    if (notifType == "Follow") {
      // socketio.to(user2Profile.socketID).emit('new.follower.notif', userProfile);
      sendToUser(req, user2Profile._id, 'new.follower.notif', userProfile);

      // create and send a push notification
      var messageObj = createPayload("Stylefnf", createPushNotifMsg(userProfile), userProfile.profilePictures[0], false, "follow", userProfile._id); 
      sendGCM(user2Profile.deviceToken, messageObj);
      
      // begin to send a follow notification
      _sendNotificationToUser2(userProfile, user2Profile, activityObj, req);
    }
  });

  return true;

}

function createPushNotifMsg(profile) {
  return profile.firstName + " started following you.";
}

function _sendNotificationToUser2(userProfile, user2Profile, activityObj, req) {

  // search for a notification
  // modify if already available
  // avoid multiple "X started following you"
  Notification
  .findOne({
    sender: userProfile._id,
    notifModel: activityObj.activityModel,
    user: activityObj.user,
    modelRef: activityObj.modelRef,
    comment: activityObj.comment
  })
  .populate('seen')
  .populate('sender')
  .exec(function(err, notif) {
    if(err)
      return err;

    // if the notification exists
    // change the update date
    if (notif) {
      console.log('found notif');
      notif.updated = Date.now();
    }
    // otherwise create a new notification 
    else {

      var tempParticipants = [];
      tempParticipants.push(user2Profile._id);

      var notif = new Notification(
        { notifModel: activityObj.activityModel, sender: userProfile, participants: tempParticipants}
      );

    }

    notif.notifBody = userProfile.firstName + ' started following you.';

    // if (user2Profile.followers.length == 1) {
    //   notif.notifBody = userProfile.firstName + ' started following you.';
    // }
    // else if (user2Profile.followers.length == 2) {
    //   notif.notifBody = userProfile.firstName + ' and 1 other person started following you.';
    // }
    // else {
    //   notif.notifBody = userProfile.firstName + ' and ' + (user2Profile.followers.length-1) + ' other people started following you.';
    // }

    notif.save(function(err) {
      // console.log('this is before sending' + notif);
      _sendNotification(user2Profile._id, notif, req);
    });

  });

  return true;

}

function _sendNotification(user2_id, notifObj, req) {

  var socketio = req.app.get('socketio');

  // console.log('this is the notiftype');
  // console.log(notifObj);

  // find the user that is being followed
  User.findOne({
    _id: user2_id
  })
  .populate('notifications')
  .exec(function(err, user) {
    if (err)
      return err;

    // remove the current Notification from the user's notifications array (if it exists)
    user.notifications = user.notifications.filter(function (el) {
              return el._id.toHexString() !== notifObj._id.toHexString();
        });
    // console.log(user);
    // console.log(user.unseenNotifications);
    // remove the current Notification from the user's unseen notifications array (if it exists)
    user.unseenNotifications = user.unseenNotifications.filter(function (el) {
              return el.toHexString() !== notifObj._id.toHexString();
        });

    // add the current notification to the user's notification and unseen notification arrays
    user.notifications.unshift(notifObj);
    user.unseenNotifications.unshift(notifObj);

    // save the user and send the updated notifications
    user.save(function(err, user) {
      if (err)
        return err;

      Notification.populate(user, {
        path: 'notifications.post',
        model: 'Post',
        select: 'brand title imageUrls'
      },
      function(err, user2) {
        if(err) return (err);

        Notification.populate(user2, {
          path: 'notifications.sender',
          model: 'User',
          select: 'firstName profilePictures'
        },
        function(err, user3) {

          // socketio.to(user3.socketID).emit('update.notifs', user3.notifications, user3.unseenNotifications);
          sendToUser(req, user3._id, 'update.notifs', user3.notifications, user3.unseenNotifications);
        });
        
      });

    });

  });

  return true;

}

function sendToUser(req, userID, socketEvent, socketObj1, socketObj2) {

  var socketio = req.app.get('socketio');

  if (socketObj2 === undefined) {
    console.log('heelo');
    // find the user's sockets and send each of them the event
    redisWorker.smembers(userID.toString(), function(err, res) {
      if (err) {
        // return new Error;
        console.log(err);
      }
      console.log("res :", res);
      res.forEach(function(socketID) {
        console.log("socket ID: ", socketID);
        socketio.to(socketID).emit(socketEvent, socketObj1);
      });

    }); 
  }
  else {
    // find the user's sockets and send each of them the event
    redisWorker.smembers(userID.toString(), function(err, res) {
      if (err) {
        return new Error;
      }
      res.forEach(function(socketID) {
        socketio.to(socketID).emit(socketEvent, socketObj1, socketObj2);
      });

    });
  }

}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createToken(user) {
  var payload = {
    exp: moment().add(5, 'days').unix(),
    iat: moment().unix(),
    sub: user._id
  };

  return jwt.encode(payload, config.tokenSecret);
}

/*
 |--------------------------------------------------------------------------
 | Signup
 |--------------------------------------------------------------------------
 */
router.route('/signup').post(function(req, res, next) {

  var approvedEmail = isApprovedEmail(req.body.email);

  if (approvedEmail)  {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, existingUser) {
          if (existingUser && req.body.sendAgain == undefined) {
            // console.log('existingUser');
            if (existingUser.signupRequest <= 3) {
              return res.status(409).send({ message: 'Email is already taken.' });
            }
            else {
              return res.status(410).send({ message: 'Please contact support for help: support@stylefnf.com' });
            }
          }
          else if (existingUser && req.body.sendAgain) {

            // console.log(existingUser.signupRequest <= 3);

            if (existingUser.signupRequest <= 3) {
              existingUser.signupToken = token;
              existingUser.signupTokenExpires = Date.now() + 259200000; // 3 days
              existingUser.signupRequest += 1;
              existingUser.save(function() {
                done(err, token, existingUser);
              });
            }
            else {
              // console.log('too many requests');
              return res.status(410).send({ message: 'Please contact support for help: support@stylefnf.com' });
            }
          }
          else {

            var description = req.body.firstName + ' is a student and lives in Toronto, ON.';

            var user = new User({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              about: description,
              status: req.body.status,
              gender: req.body.gender,
              education: approvedEmail,
              email: req.body.email,
              password: req.body.password,
              profilePictures: ['https://s3-us-west-2.amazonaws.com/stylefnf.static/default-user.png']
            });
            
            user.signupToken = token;
            user.signupTokenExpires = Date.now() + 259200000; // 3 days

            // save the use
            // user.save(function() {
            //   done(err, token, user);
            // });

            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(user.password, salt, function(err, hash) {
                user.password = hash;

                user.save(function() {
                  done(err, token, user);
                });
              });
            });
          }

        });
      },
      function(token, user, done) {
        var mailer = nodemailer.createTransport(sgTransport(sgOptions));
        var template = new EmailTemplate(path.join(templatesDir, 'verify'));
        
        // An example users object with formatted email function
        var locals = {
          verifyLink: 'http://www.stylefnf.com/' + '#/verify/' + token,
          verifyToken: token, 
          name: user.firstName
        };
        
        // Send a single email
        template.render(locals, function (err, results) {
          if (err) {
            return console.error(err)
          }

          mailer.sendMail({
            from: 'Stylefnf <support@stylefnf.com>',
            to: user.email,
            subject: 'Activate your Stylefnf account :)',
            html: results.html
          }, function (err, responseStatus) {
            if (err) {
              return console.error(err);
            }
            // console.log(responseStatus.message);
            done(err, 'done');
          });
        });
      }                
    ], function(err) {
      if (err) return next(err);
      res.send('sent an email to the user');
    });
  }
  else {
    return res.status(409).send({ message: 'Email is not valid.' });
  }
});

/*
 |--------------------------------------------------------------------------
 | Verify email
 |--------------------------------------------------------------------------
 */
router.route('/verify/:token').post(function(req, res) {
  // console.log(req.params.token);
  User.findOne({ 
    signupToken: req.params.token, 
    signupTokenExpires: { $gt: Date.now() } 
  }, function(err, user) {
    if (!user) {
      // console.log('error');
      return res.status(401).send({ message: 'Signup token is invalid or has expired.' });
    }

    // user has verified their account
    user.isComplete = true;

    user.save(function(err, user) {
      // console.log(user);
      user = user.toObject();
      delete user.password;

      var token = createToken(user);
      res.send({ token: token, user: user });
    });

  });
});

/*
 |--------------------------------------------------------------------------
 | Complete Profile Creation
 |--------------------------------------------------------------------------
 */
// router.route('/verify/:token').post(function(req, res) {
//   async.waterfall([
//     function(done) {
//       User.findOne({
//         signupToken: req.params.token,
//         signupTokenExpires: { $gt: Date.now() }
//       }, function(err, user) {
//         if (!user) {
//           return res.send('Signup token is invalid or expired.');
//         }

//         user.password = req.body.password;
//         user.signupToken = undefined;
//         user.signupTokenExpires = undefined;

//         user.save(function(err) {
//           var token = createToken(user);
//           res.send({ token: token, user: user });
//           done(err, user);
//         });
//       });
//     },
//     function(user, done) {
//       var smtpTransport = nodemailer.createTransport('SMTP', {
//         service: 'SendGrid',
//         auth: {
//           user: SENDGRID_USERNAME,
//           pass: SENDGRID_PASSWORD
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'support@stylefnf.com',
//         subject: 'Your profile has been updated',
//         text: 'Hello, \n\n' +
//           'This is a confirmation that your profile has been completed and your email: ' +  user.email + ' has been verified.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         done(err);
//       });
//     }
//   ], function(err) {
//     res.send('your email has been verified');
//   });
// });


/*
 |--------------------------------------------------------------------------
 | Verify Token / Login with Email
 |--------------------------------------------------------------------------
 */
router.route('/login').post(function(req, res) {

  if (req.body.token) {
    User.findOne({ 
      signupToken: req.body.token, 
      signupTokenExpires: { $gt: Date.now() } 
    }, function(err, user) {
      if (!user) {
        // console.log('error');
        return res.status(401).send({ message: 'Signup token is invalid or has expired.' });
      }

      // user has verified their account
      user.isComplete = true;

      user.save(function(err, user) {
        // console.log(user);
        user = user.toObject();
        delete user.password;

        var token = createToken(user);
        req.session.user = user._id;
        res.send({ token: token, user: user });
      });

    });
  }
  else {
    User.findOne({ email: req.body.email }, '+password', function(err, user) {
      if (!user) {
        return res.status(401).send({ message: { email: 'Incorrect email' } });
      }
      if (user.isComplete == false) {
        return res.status(401).send({ message: { email: 'Account is not activated.' } });
      }

      bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({ message: { password: 'Incorrect password' } });
        }

        user = user.toObject();
        delete user.password;
        
        var token = createToken(user);
        req.session.user = user._id;
        res.send({ token: token, user: user });
      });
    });
  }
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
// router.route('/register').post(function(req, res) {
//   User.findOne({ email: req.body.email }, function(err, existingUser) {
//     if (existingUser) {
//       return res.status(409).send({ message: 'Email is already taken.' });
//     }

//     var user = new User({
//       email: req.body.email,
//       password: req.body.password
//     });

//     bcrypt.genSalt(10, function(err, salt) {
//       bcrypt.hash(user.password, salt, function(err, hash) {
//         user.password = hash;

//         user.save(function() {
//           var token = createToken(user);
//           res.send({ token: token, user: user });
//         });
//       });
//     });
//   });
// });

/*
 |--------------------------------------------------------------------------
 | Login with Instagram
 |--------------------------------------------------------------------------
 */
// router.route('/instagram').post(function(req, res) {
//   var accessTokenUrl = 'https://api.instagram.com/oauth/access_token';

//   var params = {
//     client_id: req.body.clientId,
//     redirect_uri: req.body.redirectUri,
//     client_secret: config.clientSecret,
//     code: req.body.code,
//     grant_type: 'authorization_code'
//   };

//   // Step 1. Exchange authorization code for access token.
//   request.post({ url: accessTokenUrl, form: params, json: true }, function(error, response, body) {

//     // Step 2a. Link user accounts.
//     if (req.headers.authorization) {

//       User.findOne({ instagramId: body.user.id }, function(err, existingUser) {

//         var token = req.headers.authorization.split(' ')[1];
//         var payload = jwt.decode(token, config.tokenSecret);

//         User.findById(payload.sub, '+password', function(err, localUser) {
//           if (!localUser) {
//             return res.status(400).send({ message: 'User not found.' });
//           }

//           // Merge two accounts. Instagram account takes precedence. Email account is deleted.
//           if (existingUser) {

//             existingUser.email = localUser.email;
//             existingUser.password = localUser.password;

//             //localUser.remove();

//             existingUser.save(function() {
//               var token = createToken(existingUser);
//               return res.send({ token: token, user: existingUser });
//             });

//           } else {
//             // Link current email account with the Instagram profile information.
//             localUser.instagramId = body.user.id;
//             localUser.instagramUsername = body.user.username;
//             localUser.instagramName = body.user.full_name;
//             localUser.instagramPicture = body.user.profile_picture;
//             localUser.instagramAccessToken = body.access_token;

//             localUser.save(function() {
//               var token = createToken(localUser);
//               res.send({ token: token, user: localUser });
//             });

//           }
//         });
//       });
//     } else {
//       // Step 2b. Create a new user account or return an existing one.
//       User.findOne({ instagramId: body.user.id }, function(err, existingUser) {
//         if (existingUser) {
//           var token = createToken(existingUser);
//           return res.send({ token: token, user: existingUser });
//         }

//         var user = new User({
//           instagramId: body.user.id,
//           instagramUsername: body.user.username,
//           instagramName: body.user.full_name,
//           instagramPicture: body.user.profile_picture,
//           instagramAccessToken: body.access_token
//         });

//         user.save(function() {
//           var token = createToken(user);
//           res.send({ token: token, user: user });
//         });
//       });
//     }
//   });
// });

/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
// router.route('/facebook').post(function(req, res) {

//   // var token = req.headers.authorization.split(' ')[1];
//   // var payload = jwt.decode(token, config.tokenSecret);
//   console.log(req);


//   var accessTokenUrl = 'https://graph.facebook.com/oauth/access_token';
//   var graphApiUrl = 'https://graph.facebook.com/me';
  
//   var params = {
//     code: req.body.code,
//     client_id: req.body.clientId,
//     client_secret: config.FACEBOOK_SECRET,
//     redirect_uri: req.body.redirectUri
//   };

//   // Step 1. Exchange authorization code for access token.
//   request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
//     if (response.statusCode !== 200) {
//       return res.status(500).send({ message: accessToken.error.message });
//     }
//     accessToken = qs.parse(accessToken);

//     // Step 2. Retrieve profile information about the current user.
//     request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
//       console.log(req.headers);
//       if (response.statusCode !== 200) {
//         return res.status(500).send({ message: profile.error.message });
//       }

//       console.log(profile);

//       // Step 3. Grab the user's info or register the user
//       User
//       .findOne({ facebook: profile.id })
//       .select('-unseenNotifications')
//       // .populate('viewedPosts unseenNotifications notifications')
//       .exec(function(err, existingUser) {

//         // we found a user
//         // return the user
//         // this means the user has logged on before
//         if (existingUser) {

//           var token = createToken(existingUser);

//           return res.send({ token: token, user: existingUser });
//         }
//         // this means the user is logging on for the first time
//         else {

//           if (!req.body.token) {
//             return res.status(401).send({ message: { email: 'User not found, how on earth did you get this token?' } });
//           }

//           var payload = jwt.decode(req.body.token, config.tokenSecret);
//           // console.log(payload);

//           // find the userID
//           User.findOne({
//             _id: payload.sub
//           })
//           .exec(function(err, existingUser) {
//             if (err) {}

//             if (!existingUser) {
//               return res.status(401).send({ message: { email: 'User not found, how on earth did you get this token?' } });
//             }
//             else {
//               existingUser.facebook = profile.id;
//               existingUser.facebookName = profile.name;
//               existingUser.facebookDisplayName = profile.name.split(' ')[0];
//               existingUser.facebookPicture = 'https://graph.facebook.com/' + profile.id + '/picture?height=400&width=400';
//               existingUser.isComplete = true;

//               existingUser.save(function() {
//                 var token = createToken(existingUser);
//                 return res.send({ token: token, user: existingUser });
//               });

//             }
//           });
//         }
//       });
//     });
//   });
// });

/*
 |--------------------------------------------------------------------------
 | SEND AUTHENTICATED CLIENT'S SOCKET ID
 |--------------------------------------------------------------------------
 */
// router.route('/profile/:profile_id/socket').post(isAuthenticated, function(req, res) {
  
//   User.findOne({
//     _id: req.params.profile_id
//   }, function(err, user) {
//     if (err)
//       res.send(err);
//     if (!user) {
//       res.json('no user exists.');
//     }

//     // return the user
//     if (user) {
//       // console.log(req.body.userSocketID);
//       user.socketID = req.body.userSocketID;
//       user.save(function(err, user) {
//         if (err)
//           res.send(err);

//         // console.log(user);

//         var socketio = req.app.get('socketio');
//         // emit an event for all connected clients
//         socketio.to(user.socketID).emit('socketID.updated', user.socketID);
//         res.send(user.socketID);
//       });
//     }
//   });
// });

/*
 |--------------------------------------------------------------------------
 | DUMP THE UNSEEN NOTIFICATIONS
 |--------------------------------------------------------------------------
 */
router.route('/profile/:profile_id/removeUnseenNotifs').post(isAuthenticated, function(req, res) {
  
  User.findOne({
    _id: req.params.profile_id
  }, function(err, user) {
    if (err)
      res.send(err);
    if (!user) {
      res.json('no user exists.');
    }

    // return the user
    if (user) {
      // console.log(req.body.userSocketID);
      user.unseenNotifications = [];
      user.save(function(err, user) {
        if (err)
          res.send(err);

        res.send('done');

        // var socketio = req.app.get('socketio');
        // // emit an event for all connected clients
        // socketio.to(user.socketID).emit('socketID.updated', user.socketID);
      });
    }

  });
});

/*
 |--------------------------------------------------------------------------
 | Get a user's notifications
 |--------------------------------------------------------------------------
 */
router.route('/profile/:profile_id/getNotifs').get(isAuthenticated, function(req, res) {
  
  User
  .findOne({
    _id: req.params.profile_id
  })
  .populate('notifications') 
  .exec(function(err, user) {
    if (err)
      res.send(err);
    if (!user) {
      res.json('no user exists.');
    }

    // return the user
    if (user) {
      req.user = user;

      // populate the notifications in the user obj
      User.populate(user, {
        path: 'notifications.user',
        model: 'User',
        select: 'firstName profilePictures'
      },
      function(err, user2) {
        if(err) return (err);

        User.populate(user2, {
          path: 'notifications.post',
          model: 'Post',
          select: '._id brand title imageUrls'
        },
        function(err, user3) {
          if(err) return err;
          // console.log(user3);

          User.populate(user3, {
            path: 'notifications.sender',
            model: 'User',
            select: 'firstName profilePictures'
          },
          function(err, user4) {
            if(err) return err;
            // console.log(user3);


            var response = {}
            response['notifications'] = user3.notifications;
            response['unseenNotifications'] = user3.unseenNotifications;

            res.json(response);

            // update the seller's notifications
            // socketio.to(seller3.socketID).emit('update.notifs', seller3.notifications, seller3.unseenNotifications);
          });

          // var response = {}
          // response['notifications'] = user3.notifications;
          // response['unseenNotifications'] = user3.unseenNotifications;

          // res.json(response);

          // update the seller's notifications
          // socketio.to(seller3.socketID).emit('update.notifs', seller3.notifications, seller3.unseenNotifications);
        });
      });

      // req.user.populate('myPosts offeredPosts likedPosts', function(err, user) {
      //   if (err)
      //     res.send(err);

      //   Post.populate(user, {
      //     path:'likedPosts.post'
      //   }, function(err, user) {
      //       // console.log(user);
      //       res.json(user);
      //   });
      // });
    }
  });
});

/*
 |--------------------------------------------------------------------------
 | GET A WHO THE USER IS FOLLOWING
 |--------------------------------------------------------------------------
 */
router.route('/profile/:profile_id/getFollowing').get(isAuthenticated, function(req, res) {
  
  User
  .findOne({
    _id: req.params.profile_id
  }) 
  .exec(function(err, user) {
    if (err)
      res.send(err);
    if (!user) {
      res.json('no user exists.');
    }

    // return the user
    if (user) {
      req.user = user;

      res.json(user.following);

    }
  });
});

/*
 |--------------------------------------------------------------------------
 | UPDATE A NOTIFICATION IF THE USER HAS SEEN IT, BY CLICKING ON IT
 |--------------------------------------------------------------------------
 */
router.route('/profile/:profile_id/seenNotif').post(isAuthenticated, function(req, res) {

  // console.log(req.body);
  
  Activity
  .findOne({
    _id: req.body.notifID
  })
  // .populate('notifications') 
  .exec(function(err, activity) {
    if (err)
      res.send(err);
    if (!activity) {
      res.json('no activity exists.');
    }

    if (activity) {
      
      // update the activity's 'seen' array
      // by adding the user's id and the timestamp
      // var payload = {};
      // payload[req.body.user] = req.body.timestamp;

      // console.log(payload);

      // activity.seen.push(payload);
      // console.log('heres seen');
      // console.log(activity.seen);

      activity.seen[req.body.user] = req.body.timestamp;

      // console.log('heres after');
      // console.log(activity.seen);
      
      activity.save(function(err, activity2) {
        if (err)
          return err;

        // console.log('heres after save')
        // console.log(activity2);
      });

        // send confirmation
        // send the user's updated notifications
        res.send('OK');

    }
  });
});

/*
 |--------------------------------------------------------------------------
 | GET USER PROFILE INFORMATION
 |--------------------------------------------------------------------------
 */
router.route('/profile/:profile_id').get(function(req, res) {
  
  User.findOne({
    _id: req.params.profile_id
  }, function(err, user) {
    if (err)
      res.send(err);
    if (!user) {
      res.json('no user exists.');
    }

    // return the user
    if (user) {
      req.user = user;

      var opts = [
          { path: 'myPosts', 
            match: { status: { $in: [ 'Available', 'Held' ] } }, 
            // select: '_id brand status seller imageUrls created buyer description price acro category size likes title mobileImageUrls offers condition' 
          },
          { path: 'offeredPosts', 
            match: { status: { $in: [ 'active' ] } },
            // select: '_id brand status seller imageUrls created buyer description price acro category size likes title mobileImageUrls offers condition' 
          },
          { path: 'likedPosts', 
            match: { status: { $in: [ 'true' ] } },
            // select: '_id brand status seller imageUrls created buyer description price acro category size likes title mobileImageUrls offers condition' 
            // model: 'override' 
          },
          { path: 'purchasedPosts', 
            // match: { status: { $in: [ 'true' ] } },
            // select: '_id brand status seller imageUrls created buyer description price acro category size likes title mobileImageUrls offers condition' 
            // model: 'override' 
          },
          { path: 'soldPosts', 
            // match: { status: { $in: [ 'true' ] } },
            // select: '_id brand status seller imageUrls created buyer description price acro category size likes title mobileImageUrls offers condition' 
            // model: 'override' 
          },
          { path: 'followers', 
            // match: { status: { $in: [ 'Available' ] },
          },
          { path: 'following', 
            // match: { status: { $in: [ 'Available' ] },
          },
      ]

      User.populate(user, opts , function(err, user) {
        if (err)
          res.send(err);

        Post.populate(user, {
          path:'likedPosts.post'
        }, function(err, user) {
          if (err) return err;

          Post.populate(user, {
            path:'offeredPosts.post',
            match: { status: { $in: [ 'Available', 'Held' ] } }
          }, function(err, user) {
            if (err) return err;

            Like.populate(user, {
              path: 'myPosts.likes',
              match: { status: { $in: [ 'true' ] } }
            }, function(err, user) {
              if (err) return err;

              Like.populate(user, {
                path: 'offeredPosts.post.likes',
                match: { status: { $in: [ 'true' ] } }
              }, function(err, user) {
                if (err) return err;
                
                Like.populate(user, {
                  path: 'likedPosts.post.likes',
                  match: { status: { $in: [ 'true' ] } }
                }, function(err, user) {
                  if (err) return err;
                  
                  Like.populate(user, {
                    path: 'myPosts.likes.user',
                    model: 'User'
                  }, function(err, user) {
                    if (err) return err;
                    
                    Like.populate(user, {
                      path: 'offeredPosts.post.likes.user',
                      model: 'User'
                    }, function(err, user) {
                      if (err) return err;
                      
                      Like.populate(user, {
                        path: 'likedPosts.post.likes.user',
                        model: 'User'
                      }, function(err, user) {
                        if (err) return err;

                        Post.populate(user, {
                          path: 'myPosts.seller',
                          model: 'User'
                        }, function(err, user) {
                          if (err) return err;

                          Post.populate(user, {
                            path: 'likedPosts.post.seller',
                            model: 'User'
                          }, function(err, user) {
                            if (err) return err;
                            
                            Post.populate(user, {
                              path: 'offeredPosts.post.seller',
                              model: 'User'
                            }, function(err, user) {
                              if (err) return err;
                              
                              Post.populate(user, {
                                path: 'puchasedPosts.seller',
                                model: 'User'
                              }, function(err, user) {
                                if (err) return err;

                                res.json(user);
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });

            });

            
              // console.log(user);
              // res.json(user);
          });

            // console.log(user);
            // res.json(user);
        });
      });
    }
  });
});

/*
 |--------------------------------------------------------------------------
 | FOLLOWING + UNFOLLOWING A USER
 |--------------------------------------------------------------------------
 */
router.route('/profile/:profile_id/follow').post(isAuthenticated, function(req, res, next) {

  // find the user who sent the follow request
  User.findOne({
    _id: req.params.profile_id
  }, function(err, user) {
    if (err)
      return err;

    // console.log(user);

    if (user) {
      async.waterfall([
        function(done) {
          var followingUser = req.body.followingUser;
          var isFollowing;

          // Find the following user ID
          var i = user.following.indexOf(followingUser);

          // If the user is following user2
          // REMOVE them from the array 
          if (i != -1) {
            user.following.pull(followingUser); // this is a mongodb function that modifies the array (same thing as above)
            // console.log("/****************************FIRST FUNCTION POST SLICE***********/");            
            // console.log(user);
            user.save(function(err, user) {
              if (err) return (err);

              var isFollowing = true;

              // console.log("/****************************FIRST FUNCTION POST SLICE***********/");            
              // console.log(user);

              // create an activity for the person who started following
              var activityObj = new Activity({
                activityModel: 'User',
                user: user._id,
                modelRef: followingUser,
                comment: 'Unfollow'
              });

              // save the activity
              activityObj.save(function(err, obj) {
                if (err)
                  console.log(err);

                activityObj = obj;

                // add the activity to the user who started following
                addActivityToUser(user._id, activityObj);

                // console.log("/****************************FIRST FUNCTION REMOVE***********/");            
                // console.log(user);

                done(err, isFollowing, user, activityObj);
              });
            });
          }
          // otherwise the user is NOT following user2
          // ADD user2 to the user's following array
          // send a notification
          else {
            user.following.push(followingUser);
            user.save(function(err, user) {
              var isFollowing = false;

              // create an activity for the person who started following
              var activityObj = new Activity({
                activityModel: 'User',
                user: req.params.profile_id,
                modelRef: req.body.followingUser,
                comment: 'Follow'
              });

              // save the activity
              activityObj.save(function(err, obj) {
                if (err)
                  console.log(err);

                activityObj = obj;

                // console.log("/****************************FIRST FUNCTION ADD***********/");            
                // console.log(user);

                // add the activity to the user who started following
                addActivityToUser(req.params.profile_id, activityObj);

                done(err, isFollowing, user, activityObj);
              });
            });
          }
        },
        function(isFollowing, user, activityObj, done) {

          // console.log('made it');
          // console.log(user);

          // find user2
          User.findOne({ 
            _id: req.body.followingUser
          }, function(err, otherUser) {
            if (err)
              console.log(err);
            
            // console.log("/****************************SECOND FUNCTION MAIN LOOOP***********/");            
            // console.log(otherUser);

            // Remove the user from user2's followers list
            if (isFollowing) {

              // Find the user
              var i = otherUser.followers.indexOf(req.params.profile_id);

              // If the user is a follower of user2
              // REMOVE them from the array 
              if (i != -1) { 
                otherUser.followers.pull(req.params.profile_id);
                otherUser.save(function(err, otherUser) {

                  // console.log("/*******************SECOND FUNCTION REMOVE*****************************/");
                  // console.log(otherUser);

                  done(err, isFollowing, user, activityObj);
                });
              }

            }
            // Add the user to the user2's followers list
            else {

              // console.log("/*******************SECOND FUNCTION ADD*****************************/");
              // console.log(otherUser);
              
              otherUser.followers.push(req.params.profile_id);
              otherUser.save(function(err, otherUser) {
                done(err, isFollowing, user, activityObj);
              });
            }

          });
        }                
      ], function(err, isFollowing, user, activityObj) {
        if (err) return next(err);

        if (!isFollowing) {

            // console.log("/*******************FINAL FUNCTION ADD NOTIFICATION*****************************/");
            // console.log(user); 
          // send a notification to user2
          sendNotificationToUser2(user, req.body.followingUser, "Follow", req, activityObj);
        }

        // console.log(user.following);
        // send the updated followers list
        res.send(user.following);
      });
    }
    else {
      return res.status(409).send({ message: 'Email is not valid.' });
    }
  });
});


/*
 |--------------------------------------------------------------------------
 | GET STYLEFNF TEAM PROFILES
 |--------------------------------------------------------------------------
 */
router.route('/team').get(function(req, res) {
  
  User.find({
    isTeam: true
  }, 'numOfPosts facebookPicture education facebookName facebookDisplayName work location joined followers myPosts', function(err, users) {
    if (err)
      res.send(err);
    if (!users) {
      res.json('no team members exist.');
    }

    // return the user
    if (users) {
      req.users = users;

      // console.log(users);

      res.json(req.users);

      // req.users.populate('myPosts offeredPosts likedPosts', function(err, user) {
      //   if (err)
      //     res.send(err);

      //   Post.populate(user, {
      //     path:'likedPosts.post'
      //   }, function(err, user) {
      //       // console.log(user);
      //       res.json(user);
      //   });
      // });
    }
  });
});

/*
 |--------------------------------------------------------------------------
 | GET EMAIL WHITELIST
 |--------------------------------------------------------------------------
 */
router.route('/getWhitelist').get(function(req, res) {

  var whiteList = [
    'sugata.a@gmail.com', 
    'the.powerlive@gmail.com',
    'bob_mxfhqjj_nader@tfbnw.net',
    'paul.lupinacci@gmail.com',
    'mudita.shekhawat@gmail.com',
    'kathy.acharjya@live.com',
    'perry_pzjaghc_zamoreson@tfbnw.net',
    'michael_fvqjsmk_lombardi@tfbnw.net',
    'sandra_hcamrio_zuckerson@tfbnw.net',
    'tislobigus@thrma.com',
    'mail.utoronto.ca',
    'utoronto.ca',
    'g.tolles@hotmail.com',
    'parmita.singh@gmail.com',
    'support@stylefnf.com',
    'tontonc93@gmail.com',
    'funworld0275@outlook.com',
    'gc.acharjya@gmail.com',
    'alum.utoronto.ca'
  ];
  
  res.send(whiteList);
});

/*
 |--------------------------------------------------------------------------
 | UPDATE USER PROFILE
 |--------------------------------------------------------------------------
 */
router.route('/profile/:profile_id').put(isAuthenticated, function(req,res) {

  console.log(req.body);
  var newProfilePic = false;

  User.findOne({ 
    _id: req.params.profile_id 
  }, function(err, user) {
    if (err) {
      return res.send(err);
    }

    console.log(req.body.lastName);

    // update the user
    if (req.body.profilePic) {
      user.profilePictures.unshift(req.body.profilePic);
      newProfilePic = true;
    }
    if (req.body.about) {
      user.about = req.body.about; 
    }
    if (req.body.location) {
      user.location = req.body.location; 
    }
    if (req.body.firstName) {
      user.firstName = req.body.firstName;
    }
    if (req.body.lastName) {
      user.lastName = req.body.lastName;
    }  
    if (req.body.gender) {
      user.gender = req.body.gender;
    }
    if(req.body.deviceToken){
      console.log('req.body.deviceToken', req.body.deviceToken);

      user.deviceToken = req.body.deviceToken;
    }
    if (req.body.location) {
      user.location = req.body.location;
    }
    if (req.body.email) {
      user.email = req.body.email;
    }
    if (req.body.password) {
      async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {

          user.signupToken = token;
          user.signupTokenExpires = Date.now() + 259200000; // 3 days

          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
              user.password = hash;
              // done(err, token, user);

              user.save(function() {
                done(err, token, user);
              });
            });
          });
        },
        function(token, user, done) {
          // var mailer = nodemailer.createTransport(sgTransport(sgOptions));
          // var template = new EmailTemplate(path.join(templatesDir, 'verify'));
          
          // An example users object with formatted email function
          // var locals = {
          //   verifyLink: 'http://www.stylefnf.com/' + '#/verify/' + token,
          //   name: user.firstName
          // };
          
          // Send a single email
          // template.render(locals, function (err, results) {
          //   if (err) {
          //     return console.error(err)
          //   }

          //   mailer.sendMail({
          //     from: 'Stylefnf <support@stylefnf.com>',
          //     to: user.email,
          //     subject: 'Activate your Stylefnf account :)',
          //     html: results.html
          //   }, function (err, responseStatus) {
          //     if (err) {
          //       return console.error(err);
          //     }
          //     // console.log(responseStatus.message);
          //     done(err, 'done');
          //   });
          // });
          done(err, 'done');
        }                
      ], function(err) {
        if (err) return next(err);
        // res.send('sent an email to the user');
      });
    }

    // console.log(user);
 
    // save the post
    user.save(function(err, user) {
      if (err) {
        return res.send(err);
      }

      // console.log(user);
      var user2 = user.toObject();
      delete user2.password;

      // console.log('user.deviceToken', user.deviceToken);
      var token = createToken(user2);
      res.json({ token: token, user: user2 });

      if (newProfilePic) {
        // create mobile avatar images
        addResizedImages(user, [req.body.profilePic], "mobileProfileAvatars", 50, 50);
        addResizedImages(user, [req.body.profilePic], "mobileProfileDisplay", 100, 100);
      }
      
    });
  });
});

function addResizedImages(obj, fullImageArray, resizedImageArray, width, height, pushToEnd) {

  if (pushToEnd === undefined) pushToEnd = false;

  // iterate through the images in the object's image array
  for (var i in fullImageArray) {
    // download the s3 image
    request(fullImageArray[i], function(error, response, body) {

      // resize the image and name the file
      var fileInstance = sharp(body);
      var name = '_' + Math.random().toString(36).substr(2, 9);
      
      fileInstance.resize(width, height).toBuffer(function(err, buffer, info) {
        
        // upload the image to s3
        s3MobileUpload(name, buffer, function(data) {

          console.log('before push ', obj);

          // add the picture to end
          if (pushToEnd) {
            obj[resizedImageArray].push(data["Location"]);  
            console.log('after push', obj[resizedImageArray]);
          }
          else {
            obj[resizedImageArray].unshift(data["Location"]);
          }
          
          // save it to the onj
          obj.save(function(err, data) {
            if (err)
              res.send(err);
            console.log(data.mobileImageUrls);
          });
        
        });
      });
    })
  }
}

function s3MobileUpload(fileName, file, cb) {

  aws.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
  });

  var s3 = new aws.S3();
  var s3_params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: file,
      ACL: 'public-read'
  };
  s3.upload(s3_params, function(err, data) {
    if (err) {
      // console.log("Error uploading data: ", err);
    } else {
      // console.log("Successfully uploaded data to myBucket/myKey");
      // console.log(data);
      cb(data);
    }
  });
}

/*
 |--------------------------------------------------------------------------
 | FORGOT PASSWORD
 |--------------------------------------------------------------------------
 */
router.route('/forgotPassword').post(function(req, res) {
  // res.send(req.body.email);

  // query the database for the provided email
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) {
      return res.send(err);
    }

    console.log(user);

    // if user exists, send a verification email to the user
    if (user) {
      async.waterfall([
        function(done) {
          // create a token for the verification link
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          // if there hasn't been a crazy number of requests to reset password
          if (user.signupRequest <= 10) {
            user.signupToken = token;
            user.signupTokenExpires = Date.now() + 259200000; // 3 days
            user.signupRequest += 1;
            user.save(function() {
              done(err, token, user);
            });
          }
          else {
            return res.status(410).send({ message: 'Please contact support for help: support@stylefnf.com' });
          }
        },
        function(token, user, done) {
          // send the email
          var mailer = nodemailer.createTransport(sgTransport(sgOptions));
          var template = new EmailTemplate(path.join(templatesDir, 'forgotPassword'));
          
          // An example users object with formatted email function
          var locals = {
            resetLink: 'http://www.stylefnf.com' + '/#/forgot-password/' + token,
            resetToken: token,
            name: user.firstName
          };
          
          // Send a single email
          template.render(locals, function (err, results) {
            if (err) {
              return console.error(err)
            }

            mailer.sendMail({
              from: 'Stylefnf <support@stylefnf.com>',
              to: user.email,
              subject: 'Reset your Stylefnf password',
              html: results.html
            }, function (err, responseStatus) {
              if (err) {
                return console.error(err);
              }
              // console.log(responseStatus.message);
              done(err, 'done');
            });
          });
        }                
      ], function(err) {
        if (err) return next(err);
        res.send('sent an email to the user');
      });
    }
    else {
      return res.status(409).send({ message: 'Email is not valid.' });
    }
  });

  // res.status(400).send(req.body.email);
});

/*
 |--------------------------------------------------------------------------
 | CHECK IF EMAIL IS VALID
 |--------------------------------------------------------------------------
 */
router.route('/emailCheck').post(function(req, res) {

  console.log(req.body);

  User.findOne({ 
    email: req.body.emailToCheck
  }, function(err, user) {
    if (err) {
      res.send(err);
    }

    if (user) {
      res.status(515).send({ message: 'Email already exists.' });
    }
    else {
      res.send({ message: 'Email is not valid.' })
    }

  });

});

function isApprovedEmail(email) {
  var domain = emailParser.parseOneAddress(email).domain;

  var whiteListDomains = {
    'utoronto.ca':'University of Toronto',
    'mail.utoronto.ca':'University of Toronto',
    'alum.utoronto.ca':'University of Toronto'
  };

  var whiteList = {
    'sugata.a@gmail.com' : 'University of Toronto', 
    'the.powerlive@gmail.com' : 'University of Toronto',
    'bob_mxfhqjj_nader@tfbnw.net' : 'University of Toronto',
    'paul.lupinacci@gmail.com' : 'University of Toronto',
    'mudita.shekhawat@gmail.com' : 'York University',
    'kathy.acharjya@live.com' : 'Centennial College',
    'perry_pzjaghc_zamoreson@tfbnw.net' : 'Ryerson University',
    'michael_fvqjsmk_lombardi@tfbnw.net' : 'OCAD',
    'sandra_hcamrio_zuckerson@tfbnw.net' : 'University of Toronto',
    'tislobigus@thrma.com' : 'George Brown College',
    'g.tolles@hotmail.com' : 'Sheridan College',
    'parmita.singh@gmail.com' : 'Ryerson University',
    'support@stylefnf.com' : 'Stylefnf',
    'tontonc93@gmail.com' : 'University of Toronto',
    'funworld0275@outlook.com' : 'University of Toronto',
    'gc.acharjya@gmail.com' : 'IIT'
  };

  if (whiteListDomains[domain]) {
    return whiteListDomains[domain];
  }
  else if (email in whiteList) {
    return whiteList[email];
  } 
  return false;
}


function sendGCM(registrationIds, message){

  // API Key of Stylefnf
  var sender = new gcm.Sender(GOOGLE_API_KEY);
  sender.send(message, registrationIds, 4, function (result) {
      console.log(result); //null is actually success
  });
}

function createPayload(title, msg, image, important, type, id){

  if (important === undefined) important = false;

  var message = new gcm.Message();

  message.addData('message', msg);
  message.addData('title', title);
  message.addData('image', image);
  message.addData('msgcnt','3');
  message.addData('objID', id);
  message.addData('objType', type);
  if (!important) {
    message.addData('sound', '');
    message.addData('vibrationPattern', [0,0,0,0]);
  }

  return message;
}

module.exports = router;