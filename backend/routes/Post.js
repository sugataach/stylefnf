'use strict';

// load the post model
var Post = require('../models/Post');
var User = require('../models/User');
var Comment = require('../models/Comment');
var Like = require('../models/Like');
var Offer = require('../models/Offer');
var Activity = require('../models/Activity');
var Notification = require('../models/Notification');
var express = require('express');
var router = express.Router();
var config = require('../config/config');
var jwt = require('jwt-simple');
var moment = require('moment');
var async = require('async');
var path = require('path');
var gcm = require('node-gcm');
var EmailTemplate = require('email-templates').EmailTemplate;
var paypal = require('paypal-rest-sdk');
var sharp = require('sharp');
var request = require('request').defaults({encoding: null});

var redis = require('redis');
var redisWorker = redis.createClient();
redisWorker.select(2);
// var socketEmitter = require('socket.io-emitter')({ host: 'localhost', port: 3000});
// var multer = require("multer"),
//     formidable = require('formidable'),
//     util = require('util'),
//     fs   = require('fs-extra'),
//     qt   = require('quickthumb');

var aws = require('aws-sdk');
var AWS_ACCESS_KEY = config.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = config.AWS_SECRET_KEY;
var S3_BUCKET = config.S3_BUCKET;

var GOOGLE_API_KEY = config.GOOGLE_API_KEY;

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var sgOptions = {
    auth: {
        api_user: config.SENDGRID_USERNAME,
        api_key: config.SENDGRID_PASSWORD
    }
};

var dev_config = {
  'mode': 'sandbox', //sandbox or live
  'client_id': config.PAYPAL_DEV_CLIENT_ID,
  'client_secret': config.PAYPAL_DEV_SECRET
};

var prod_config = {
    'mode': 'live',
    'client_id': '<SECOND_CLIENT_ID>',
    'client_secret': '<SECOND_CLIENT_SECRET>'
};

paypal.configure(dev_config);

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

function sendEmail(template, locals, emailType) {
  var mailer = nodemailer.createTransport(sgTransport(sgOptions));

  if (emailType == "offerMade") {

    // find the seller's email
    User.findOne({
      _id: locals.sellerID
    }, function(err, user) {
      if (err) return err;

      locals.sellerName = user.firstName;
      var sentFrom = 'Stylefnf ' + '<no-reply@stylefnf.com>';

      // Send a single email
      template.render(locals, function (err, results) {
        if (err) {
          // return console.error(err)
        }

        mailer.sendMail({
          from: sentFrom,
          to: user.email,
          subject: '$' + locals.offerPrice + ' offer on ' + locals.postName,
          html: results.html
        }, function (err, responseStatus) {
          if (err) {
            // return console.error(err);
          }
          // console.log(responseStatus.message);
          return;
        });
      });
    });
  }

  else if (emailType == "offerAccepted") {

    // find the offer maker's email
    User.findOne({
      _id: locals.offerMakerID
    }, function(err, offerMaker) {
      if (err) return err;

      // find the seller's info
      User.findOne({
        _id: locals.sellerID
      }, function(err, seller) {

        // populate the locals
        locals.sellerPic = seller.facebookPicture;
        locals.sellerName = seller.firstName;
        locals.offerMakerName = offerMaker.firstName;

        var sentFrom = 'Stylefnf ' + '<no-reply@stylefnf.com>';

        // console.log('my locals');
        // console.log(locals);

        // Send a single email
        template.render(locals, function (err, results) {
          if (err) {
            return console.error(err)
          }

          mailer.sendMail({
            from: sentFrom,
            to: offerMaker.email,
            subject: locals.postName + ' - Your $' + locals.offerPrice + ' offer accepted',
            html: results.html
          }, function (err, responseStatus) {
            if (err) {
              return console.error(err);
            }
            // console.log(responseStatus.message);
            return;
          });
        });


      });
    });
  }

}


/*
 |--------------------------------------------------------------------------
 | Uitility Functions
 |--------------------------------------------------------------------------
 */

function checkAuthenticatedUser(req) {
  if (!(req.headers && req.headers.authorization)) {
    // console.log('err headers missing');
    return false;
  }

  var header = req.headers.authorization.split(' ');
  var token = header[1];
  var payload = jwt.decode(token, config.tokenSecret);
  var now = moment().unix();

  if (now > payload.exp) {
    // console.log('err headers expired');
    return false;
  }

  User.findById(payload.sub, function(err, user) {
    if (!user) {
      // console.log('user missing');
      return false;
    }
  });

  // console.log('user found');
  return payload.sub;
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

function getProperty(arr, property) {
  var result = [];
  var obj;
  for (var i in arr) {
    if (arr[i]) {
      obj = arr[i];
      if (obj[property]) {
        // console.log(obj);
        result.push(obj[property]);
      }
    }
  }
  // console.log('get property \n' + result);
  return result;
}

function _getUniqueParticipants(ids, seller_id) {
  // get the users that have commented
  var resultUsers = [];
  var posterID;

  // only add unique users to the resultUsers list
  // ignore the last person who commented
  for (var u in ids) {
    posterID = ids[u];
    var isInArray = resultUsers.some(function (user) {
        return user.equals(posterID);
    });
    // console.log(commentUsers.indexOf(posterID));
    if (!isInArray && (posterID != seller_id)) {
      // console.log('user not in array ' + posterID);
      resultUsers.push(posterID);
    }
  }
  // console.log('get unique \n' + resultUsers);
  return resultUsers;
}

function sendNotificationToSeller(seller_id, notifType, req, toastObj, activityObj, givenParticipants) {

  var socketio = req.app.get('socketio');

  // find the seller
  User
  .findOne({ _id:seller_id })
  .populate('notifications')
  .exec(function(err, seller) {

    var socketio = req.app.get('socketio');

    // send a comment toast
    if (notifType == "Comment") {
      // populate the comment
      // this is for the toast
      Comment.populate(toastObj, {
        path: 'poster',
        model: 'User',
        select: 'profilePictures firstName'
      },
      function(err, comment2) {
        if(err) return (err);

        Comment.populate(comment2, {
          path: 'post',
          model: 'Post',
          select: '._id brand title imageUrls'
        },
        function(err, comment3) {
          if(err) return err;
          
          // update the seller's notifications
          // socketio.to(seller.socketID).emit('comment.made.notif', comment3);
          sendToUser(req, seller._id, 'comment.made.notif', comment3);

          // console.log(comment3.post.imageUrls[0]);

          // create and send a push notification

          var messageObj = createPayload("Stylefnf", createPushNotifMsg("comment", comment3), "https://s3-us-west-2.amazonaws.com/stylefnf.static/stylefnf_icon.png", false, "comment", comment3.post._id); 

          sendGCM(seller.deviceToken, messageObj);
        });
      });

      // send a notification update
      // to the seller
      // sendNotifToAffectedUsers([seller_id], activityObj, givenParticipants, req);
    }
    // send a like toast
    else if (notifType == "Like") {
      // populate the like
      // this is for the toast
      Like.populate(toastObj, {
        path: 'user',
        model: 'User',
        select: 'profilePictures firstName'
      },
      function(err, like2) {
        if(err) return (err);

        Like.populate(like2, {
          path: 'post',
          model: 'Post',
          select: '._id brand title'
        },
        function(err, like3) {
          if(err) return err;
          // console.log('this is the comment');
          // console.log(comment3);

          // update the seller's notifications
          // socketio.to(seller.socketID).emit('like.made.notif', like3);
          sendToUser(req, seller._id, 'like.made.notif', like3);

          // create and send a push notification
          var messageObj = createPayload(like3.post.title, createPushNotifMsg("like", like3), like3.user.profilePictures[0], false, "like", like3.post._id); 
          sendGCM(seller.deviceToken, messageObj);
        });
      });
    }
    // send a Offer Made toast
    else if (notifType == "Offer Made") {
      // populate the like
      // this is for the toast
      Offer.populate(toastObj, {
        path: 'poster',
        model: 'User',
        select: ' profilePictures firstName'
      },
      function(err, offer2) {
        if(err) return (err);

        Offer.populate(offer2, {
          path: 'post',
          model: 'Post',
          select: '._id brand title imageUrls'
        },
        function(err, offer3) {
          if(err) return err;
          // console.log('this is the comment');
          // console.log(comment3);

          // update the seller's notifications
          // socketio.to(seller.socketID).emit('offer.made.notif', offer3);
          sendToUser(req, seller._id, 'offer.made.notif', offer3);

          // create and send a push notification

          var messageObj = createPayload(offer3.post.title, createPushNotifMsg("offerMade", offer3),  "https://s3-us-west-2.amazonaws.com/stylefnf.static/stylefnf_icon.png", true, "offer", offer3.post._id); 

          sendGCM(seller.deviceToken, messageObj);
        });
      });
    }
    // send a Offer Accepted toast
    else if (notifType == "Offer Accepted") {
      // populate the like
      // this is for the toast
      Offer.populate(toastObj, {
        path: 'poster',
        model: 'User',
        select: ' profilePictures firstName'
      },
      function(err, offer2) {
        if(err) return (err);

        Offer.populate(offer2, {
          path: 'post',
          model: 'Post',
          select: '._id brand title imageUrls'
        },
        function(err, offer3) {
          if(err) return err;
          // console.log('this is the comment');
          // console.log(comment3);

          // update the seller's notifications
          // socketio.to(seller.socketID).emit('yourOffer.accepted.notif', offer3);
          sendToUser(req, seller._id, 'yourOffer.accepted.notif', offer3);

          // create and send a push notification
          var messageObj = createPayload(offer3.post.title, createPushNotifMsg("offerAccepted", offer3), "https://s3-us-west-2.amazonaws.com/stylefnf.static/stylefnf_icon.png", true, "offer", offer3.post._id); 

          sendGCM(seller.deviceToken, messageObj);
        });
      });
    }
    // send a Offer Removed toast
    else if (notifType == "Offer Removed") {
      // populate the like
      // this is for the toast
      Offer.populate(toastObj, {
        path: 'poster',
        model: 'User',
        select: ' profilePictures firstName'
      },
      function(err, offer2) {
        if(err) return (err);

        Offer.populate(offer2, {
          path: 'post',
          model: 'Post',
          select: '._id brand title imageUrls'
        },
        function(err, offer3) {
          if(err) return err;
          // console.log('this is the comment');
          // console.log(comment3);

          // update the seller's notifications
          // socketio.to(seller.socketID).emit('yourOffer.removed.notif', offer3);
          sendToUser(req, seller._id, 'yourOffer.removed.notif', offer3);

          // create and send a push notification
          var messageObj = createPayload(offer3.post.title, createPushNotifMsg("offerRemoved", offer3, false), "https://s3-us-west-2.amazonaws.com/stylefnf.static/stylefnf_icon.png", true, "offer", offer3.post._id); 

          sendGCM(seller.deviceToken, messageObj);
        });
      });
    }
    // send a Payement Received toast
    else if (notifType == "Payment Received") {
      // update the seller's notifications
      // socketio.to(seller.socketID).emit('payment.received.notif', toastObj);
      sendToUser(req, seller._id, 'payment.received.notif', toastObj);

      // create and send a push notification
      var messageObj = createPayload(toastObj.post.title, createPushNotifMsg("paymentReceived", toastObj), "https://s3-us-west-2.amazonaws.com/stylefnf.static/stylefnf_icon.png", true); 
      sendGCM(seller.deviceToken, messageObj);
    }

    // console.log(givenParticipants);
    sendNotifToAffectedUsers([seller_id], activityObj, givenParticipants, req);
  });

}

function createPushNotifMsg(type, data, isBuyer) {

  if (isBuyer === undefined) isBuyer = true;

  var msg = "";
  switch(type) {
    case "comment":
      msg = data.poster.firstName + " commented: " + "\"" + data.content[0] + "\""; 
      break;
    case "like":
      msg = data.user.firstName + " liked " + data.post.title;
      break;
    case "offerMade":
      msg = data.poster.firstName + " has made an offer.";
      break;
    case "offerRemoved":
      msg = "Offer removed for " + data.post.title;
      // if (isBuyer) {
      //   msg = data.poster.firstName + " has removed their offer.";
      // }
      // else {
      //   msg = data.firstName + " has removed your offer.";
      // }
      break;
    case "offerAccepted":
      msg = "Your offer has been accepted!";
      break;
    case "available":
      msg = "This listing is now available!";
      break;
    case "held":
      msg = "This listing is now on hold!";
      break;
    case "paymentReceived":
      msg = "Payment received for " + data.post.title;
      break;
    default:
      msg = "";

  }


  return msg;

}

function _sendNotifToAffectedUsers(givenParticipants, notifType, req, toastObj, activityObj, afterSeller) {
  var socketio = req.app.get('socketio');

  givenParticipants = givenParticipants.filter(function (el) {
          return el.toHexString() !== activityObj.user.toHexString();
  });

  // console.log('these are the participants');
  // console.log(givenParticipants);

  for (var u in givenParticipants) {
    // find the seller
    User
    .findOne({ _id:givenParticipants[u] })
    .populate('notifications')
    .exec(function(err, user) {

      var socketio = req.app.get('socketio');

      // send a comment toast
      if (notifType == "Comment") {
        // populate the comment
        // this is for the toast
        Comment.populate(toastObj, {
          path: 'poster',
          model: 'User',
          select: ' profilePictures firstName'
        },
        function(err, comment2) {
          if(err) return (err);

          Comment.populate(comment2, {
            path: 'post',
            model: 'Post',
            select: '._id brand title'
          },
          function(err, comment3) {
            if(err) return err;
            // console.log('this is the comment');
            // console.log(comment3);

            // update the user's notifications
            // socketio.to(user.socketID).emit('comment.made.notif', comment3);
            sendToUser(req, user._id, 'comment.made.notif', comment3);
          });
        });
      }
      // send a Offer Made toast
      else if (notifType == "Offer Made") {
        // populate the like
        // this is for the toast
        Offer.populate(toastObj, {
          path: 'poster',
          model: 'User',
          select: ' profilePictures firstName'
        },
        function(err, offer2) {
          if(err) return (err);

          Offer.populate(offer2, {
            path: 'post',
            model: 'Post',
            select: '._id brand title imageUrls'
          },
          function(err, offer3) {
            if(err) return err;
            // console.log('this is the comment');
            // console.log(comment3);

            // update the seller's notifications
            // socketio.to(user.socketID).emit('offer.made.notif', offer3);
            sendToUser(req, user._id, 'offer.made.notif', offer3);
            
            var messageObj = createPayload(offer3.post.title, createPushNotifMsg("offerMade", offer3), "https://s3-us-west-2.amazonaws.com/stylefnf.static/stylefnf_icon.png", true, "offer", offer3.post._id); 
            sendGCM(user.deviceToken, messageObj);
          });
        });
      }
      // send a Listing Held toast
      else if (notifType == "Listing Held") {
        // populate the like
        // this is for the toast
        Offer.populate(toastObj, {
          path: 'poster',
          model: 'User',
          select: ' profilePictures firstName'
        },
        function(err, offer2) {
          if(err) return (err);

          Offer.populate(offer2, {
            path: 'post',
            model: 'Post',
            select: '._id brand title imageUrls'
          },
          function(err, offer3) {
            if(err) return err;
            // console.log('this is the comment');
            // console.log(comment3);

            // update the seller's notifications
            // socketio.to(user.socketID).emit('listing.held.notif', offer3);
            sendToUser(req, user._id, 'listing.held.notif', offer3);

            // create and send a push notification

            var messageObj = createPayload(offer3.post.title, createPushNotifMsg("held", undefined), "https://s3-us-west-2.amazonaws.com/stylefnf.static/stylefnf_icon.png",true,"offer", offer3.post._id); 
            sendGCM(user.deviceToken, messageObj);

          });
        });
      }
      // send a Listing Available toast
      else if (notifType == "Listing Available") {
        // populate the like
        // this is for the toast
        Offer.populate(toastObj, {
          path: 'poster',
          model: 'User',
          select: ' profilePictures firstName'
        },
        function(err, offer2) {
          if(err) return (err);

          Offer.populate(offer2, {
            path: 'post',
            model: 'Post',
            select: '._id brand title imageUrls'
          },
          function(err, offer3) {
            if(err) return err;
            // console.log('this is the comment');
            // console.log(comment3);

            // update the seller's notifications
            // socketio.to(user.socketID).emit('listing.available.notif', offer3);
            sendToUser(req, user._id, 'listing.available.notif', offer3);

            // create and send a push notification

            var messageObj = createPayload(offer3.post.title, createPushNotifMsg("available", undefined), "https://s3-us-west-2.amazonaws.com/stylefnf.static/stylefnf_icon.png", true, "offer", offer3.post._id); 
            sendGCM(user.deviceToken, messageObj);

          });
        });
      }

      // console.log(givenParticipants);


      if (afterSeller) {
        // send a notification update
        _sendNotifAfterSeller(givenParticipants,
                              activityObj,
                              givenParticipants,
                              req);
      }
      else {
        // send a notification update
        sendNotifToAffectedUsers(givenParticipants,
                               activityObj,
                               givenParticipants,
                               req);

      }
    });
  }
}

function _sendNotifAfterSeller(listOfParticipants, activityObj, givenParticipants, req) {

  Notification
  .findOne({
    notifModel: activityObj.activityModel,
    post: activityObj.post
  })
  .populate('post seen')
  .exec(function(err, notif) {
    if(err)
      return err;

    User
    .findOne({ _id: activityObj.user})
    .exec(function(err, myUser) {

      // console.log('this is the user sending the activityObj');
      // console.log(activityObj.user);
      // console.log(myUser);

      if (activityObj.activityModel == "Comment") {

        // console.log('my participants' + givenParticipants.length);

        var tempParticipants = givenParticipants.filter(function (el) {
                return el.toHexString() !== activityObj.user.toHexString();
        });

        // console.log('participants without the sender \n' + tempParticipants);

        if (tempParticipants.length == 0) {
          notif.notifBody = myUser.firstName + ' commented on ' + notif.post.title;
        }
        else if (tempParticipants.length == 1) {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other person commented on ' + notif.post.title;
        }
        else {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other people commented on ' + notif.post.title;
        }

      }
      else if (activityObj.activityModel == "Offer Made") {

        // console.log('my participants' + givenParticipants.length);

        var tempParticipants = givenParticipants.filter(function (el) {
                return el.toHexString() !== activityObj.user.toHexString();
        });

        // console.log('participants without the sender \n' + tempParticipants);

        if (tempParticipants.length == 0) {
          notif.notifBody = myUser.firstName + ' made an offer on ' + notif.post.title;
        }
        else if (tempParticipants.length == 1) {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other person made offers on ' + notif.post.title;
        }
        else {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other people made offers on ' + notif.post.title;
        }

      }
      else if (activityObj.activityModel == "Listing Held") {
          notif.notifBody = notif.post.title + ' was placed on hold.';
      }

      // notif.participants = givenParticipants;
      // console.log('these are the givenParticipants \n' + givenParticipants);
      // console.log('this the user sending the comment ' + String(activityObj.user) + ' ' + typeof(String(activityObj.user)));

      // gotta make sure the notif.participants is a unique set of user ids

      // OPTION 1
      // console.log('is the user sending the comment in the given participants array' + givenParticipants.indexOf(String(activityObj)));

      // maybe it doesn't matter
      notif.participants = givenParticipants;

      // console.log('right before saving' + notif);
      notif.save(function(err) {
        // console.log('this is before sending' + notif);
        _sendNotification(listOfParticipants, notif, req);
      });
    });

    // _sendNotification(listOfParticipants, notif, req);
  });

  return true;

}

function sendNotifToAffectedUsers(listOfParticipants, activityObj, givenParticipants, req) {

  /* Takes an input:

  listOfParticipants: array of userids - to send the notification to
  activityObj: populated Activity Object
  givenParticipants: array of userids - to count the participants
  req: request to send to socket

  */

  // create the notification object
  // find the notification
  Notification
  .findOne({
    notifModel: activityObj.activityModel,
    post: activityObj.post
  })
  .populate('post seen')
  .exec(function(err, notif) {
    if(err)
      return err;

    var newPost;
    // console.log('thisisthenotif' + notif);
    // if the notification exists
    if (notif) {

      // console.log('found notif');
      newPost = notif.post;
      // console.log('old date ' + notif.updated);

      //change the update date
      notif.updated = Date.now();

      // change the sender
      notif.sender = activityObj.user;


      // console.log('new date ' + notif.updated);
    }
    // otherwise no notification exists
    else {

      // console.log('creating new notif');

        var notif = new Notification(
          { notifModel: activityObj.activityModel, post: activityObj.post, participants: givenParticipants, sender: activityObj.user}
        );

      Post
      .findOne({_id: activityObj.post})
      .exec(function(err, newPost2) {
        newPost = newPost2;
        // create a new notification
      });
    }

    if (newPost == undefined) {
      newPost = function(callBackFunction) {
        Post.findOne({_id: activityObj.post}).exec(callBackFunction);
      }
    }

    // console.log(newPost);

    // console.log('the post im looking at is \n' + newPost);

    User
    .findOne({ _id: activityObj.user})
    .exec(function(err, myUser) {

      if (activityObj.activityModel == "Comment") {

        // console.log('my participants' + givenParticipants.length);

        var tempParticipants = givenParticipants.filter(function (el) {
                return el.toHexString() !== activityObj.user.toHexString();
        });

        // console.log('participants without the sender \n' + tempParticipants);

        if (tempParticipants.length == 0) {
          notif.notifBody = myUser.firstName + ' commented on ' + newPost.title;
        }
        else if (tempParticipants.length == 1) {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other person commented on ' + newPost.title;
        }
        else {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other people commented on ' + newPost.title;
        }

      }
      else if (activityObj.activityModel == "Like") {

        // console.log('my participants' + givenParticipants.length);

        var tempParticipants = givenParticipants.filter(function (el) {
                return el.toHexString() !== activityObj.user.toHexString();
        });

        // console.log('participants without the sender \n' + tempParticipants);

        if (tempParticipants.length == 0) {
          notif.notifBody = myUser.firstName + ' liked ' + newPost.title;
        }
        else if (tempParticipants.length == 1) {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other person liked ' + newPost.title;
        }
        else {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other people liked ' + newPost.title;
        }

      }
      else if (activityObj.activityModel == "Offer Made") {

        // console.log('my participants' + givenParticipants.length);

        var tempParticipants = givenParticipants.filter(function (el) {
                return el.toHexString() !== activityObj.user.toHexString();
        });

        // console.log('participants without the sender \n' + tempParticipants);

        if (tempParticipants.length == 0) {
          notif.notifBody = myUser.firstName + ' made an offer on ' + newPost.title;
        }
        else if (tempParticipants.length == 1) {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other person made offers on ' + newPost.title;
        }
        else {
          notif.notifBody = myUser.firstName + ' and ' + tempParticipants.length + ' other people made offers on ' + newPost.title;
        }

      }
      else if (activityObj.activityModel == "Offer Accepted") {

        notif.notifBody = myUser.firstName + ' accepted your offer on ' + newPost.title;
      }
      else if (activityObj.activityModel == "Listing Held") {
          notif.notifBody = newPost.title + ' was placed on hold.';
      }
      else if (activityObj.activityModel == "Offer Removed") {
          if (activityObj.user == newPost.seller_id) {
            notif.notifBody = myUser.firstName + ' cancelled your offer on ' + newPost.title + '.';
          }
          else {
            notif.notifBody = myUser.firstName  + ' cancelled their offer on ' + newPost.title + '.';
          }
      }
      else if (activityObj.activityModel == "Listing Available") {
          notif.notifBody = newPost.title + ' is available again.';
      }
      else if (activityObj.activityModel == "Payment Received") {
          notif.notifBody = 'Payment received for ' + newPost.title;
      }

      // notif.participants = givenParticipants;
      // console.log('these are the givenParticipants \n' + givenParticipants);
      // console.log('this the user sending the comment ' + String(activityObj.user) + ' ' + typeof(String(activityObj.user)));

      // gotta make sure the notif.participants is a unique set of user ids

      // OPTION 1
      // console.log('is the user sending the comment in the given participants array' + givenParticipants.indexOf(String(activityObj)));

      // maybe it doesn't matter
      notif.participants = givenParticipants;

      // console.log('right before saving' + notif);
      notif.save(function(err) {
        // console.log('this is before sending' + notif);
        _sendNotification(listOfParticipants, notif, req);
      });
    });

  });

  return true;

}

function _sendNotification(userIDs, notifObj, req) {

  // console.log('notif object \n' + notifObj);

  // console.log('these are the participants being sent');
  // console.log('userIDs: \n'+ userIDs);

  var socketio = req.app.get('socketio');

  // console.log('this is the userIDS');
  // console.log(userIDs);
  // console.log('this is the notiftype');
  // console.log(notifObj);

  for (var x in userIDs) {

    User.findOne({
      _id: userIDs[x]
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
            sendToUser(req, user3._id, "update.notifs", user3.notifications, user3.unseenNotifications);
          });

        });

      });

    });

  }

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
 | GET ALL POSTS
 |--------------------------------------------------------------------------
 */
router.route('/posts').get(function(req, res) {

  // use mongoose to get all posts in the db
  Post
  .find({ status: { $nin: [ 'cancelled' ] } })
  .populate('likes', null, { status: { $in: [ 'true' ] } }) // only works if we pushed refs to children
  .exec(function (err, posts) {
    if (err) res.send(err);

    User.populate(posts, {
      path:'likes.user'
    }, function(err, posts) {
        res.json(posts);
    });
    // res.json(posts);
  });
});

/*
 |--------------------------------------------------------------------------
 | UPLOAD PICTURE(S)
 |--------------------------------------------------------------------------
 */
router.route('/sign_s3').get(function(req, res) {
  // console.log('made to the server');
  aws.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
  });

  console.log(req.query);

  var s3 = new aws.S3();
  var s3_params = {
      Bucket: S3_BUCKET,
      Key: req.query.s3_object_name,
      Expires: 60,
      ContentType: req.query.s3_object_type,
      ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3_params, function(err, data){
      if(err){
          console.log(err);
      }
      else{
          var return_data = {
              signed_request: data,
              url: 'http://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.s3_object_name
          };
          res.write(JSON.stringify(return_data));
          res.end();
      }
  });
});

/*
 |--------------------------------------------------------------------------
 | CREATE A POST
 |--------------------------------------------------------------------------
 */
router.route('/posts').post(isAuthenticated, function(req, res) {

  // console.log('this is the gender:');
  // console.log(req.body.gender);

  if (req.body.gender == undefined || req.body.gender == "") {
    // console.log('undefined gender');
    req.body.gender = "Any";
  }
  if(req.body.retail == undefined || req.body.retail == "") {
    req.body.retail = req.body.price;
  }
  if(req.body.description == undefined || req.body.description == "") {
    req.body.description = "No description given.";
  }
  if(req.body.brand == undefined || req.body.brand == "") {
    req.body.brand = "No Brand";
  }
  if(req.body.size == undefined || req.body.size == "") {
    req.body.brand = "Not set";
  }
  if(req.body.return == undefined || req.body.return == "") {
    req.body.return = "No";
  }

  // console.log(req.body);

  // create a post, info comes from AJAX request from Angular
  Post.create({
      brand : req.body.brand,
      title : req.body.title,
      macro : req.body.macro,
      price : req.body.price,
      retail : req.body.retail,
      colour: req.body.colour,
      category : req.body.category,
      condition : req.body.condition,
      locations: req.body.locations,
      size : req.body.size,
      description : req.body.description,
      seller_id : req.body.seller_id,
      seller : req.body.seller,
      seller_name : req.body.seller_name,
      imageUrls: req.body.imageUrls,
      datetime: req.body.datetime,
      status: req.body.status,
      gender: req.body.gender,
      room: req.body.room,
      ifTryOn: req.body.ifTryOn,
      tags: req.body.tags,
      return: req.body.return
  }, function(err, post) {
      if (err)
          res.send(err);

      // add the post to the user's myPosts array
      // find a user the db using the given poster id
      User.findOne({
        _id: req.body.seller_id
      }, function(err, user) {
        if (err)
          res.send(err);

        user.myPosts.push(post);
        user.save(function(err, user) {
          if (err)
            res.send(err);

          res.json(post);

          // create mobile images
          addResizedImages(post, post.imageUrls, "mobileImageUrls", 375, 415);
          addResizedImages(post, post.imageUrls, "mobileImageUrlsAvatar", 125, 115);
        });

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
 | GET A POST
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id').get(function(req, res, next) {

  Post.findOne({
    _id: req.params.post_id
  }, function(err, post) {
    if (err) {
      console.log(err);
      // return res.send(err);
      return res.status(400).send({ message: 'No post found' });
    }

    if (!post) {
      // console.log('post not found');
      return res.status(400).send({ message: 'No post found' });
    }

    if (post.status == "cancelled") {
      // console.log('post not found');
      return res.status(400).send({ message: 'No post found' });
    }

    // return the post
    //res.json(post);
    if (post) {
      req.post = post;

      req.post
      .populate('offers')
      .populate('seller')
      .populate('likes comments', null, { status: { $in: [ 'true' ] } }, function(err, post) {
        if (err)
          res.send(err);

        // populate the subdocument
        User.populate(post, {
          path:'likes.user'
        }, function(err, post) {
            // res.json(post);
          // populate the subdocument
          User.populate(post, {
            path:'comments.poster'
          }, function(err, post) {
              // res.json(post);
            User.populate(post, {
              path:'offers.poster'
            }, function(err, post) {
                res.json(post);
            });

          });
        });
      });

      // increment the view count of the listing by 1 if the user is authenticated
      var userId = checkAuthenticatedUser(req);
      if (userId) {
        // console.log('incrementing view');
        post.views += 1;

        if (userId) {
          // find the user
          User.findById(userId, function(err, user) {
            if (!user) {
              // console.log('user missing');
              return res.send(err);
            }

            // check if the user has already seen the item
            if ((userId != post.seller_id) && user.viewedPosts.indexOf(req.params.post_id) < 0) {
              // console.log('pushed postid to user views');
              user.viewedPosts.push(req.params.post_id);
              user.save(function(err) {
                if (err) {
                  return res.send(err);
                }
              });
              post.viewedBy.push(userId);
              // console.log('pushed userid to post views');
              post.save(function(err) {
                if (err) {
                  return res.send(err);
                }
                // console.log('finished saving post');
              });
            }

          });

        }
      }

      // post.save(function(err, post) {
      //   if (err) {
      //     return res.send(err);
      //   }
      // });
    }
  }); // end of findOne
});

/*
 |--------------------------------------------------------------------------
 | UPDATE A POST
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id').put(isAuthenticated, function(req,res) {

  var imagesToAdd = [];

  Post.findOne({
    _id: req.params.post_id
  }, function(err, post) {
    if (err) {
      return res.send(err);
    }
    // console.log(post.imageUrls);

    // check if changing imageUrls
    if (req.body.imageUrls) {

      var postImgUrls = post.imageUrls;

      for (var idx1 = 0; idx1 < postImgUrls.length; idx1++) {
        // if there's an image deleted - remove from mobile array  
        if(req.body.imageUrls.indexOf(postImgUrls[idx1]) == -1) {
          // imagesToAdd.push(req.body.imageUrls[i]);
          post["mobileImageUrls"].splice(idx1, 1);
          post["mobileImageUrlsAvatar"].splice(idx1, 1);
        }
      }
      
      for (var i in req.body.imageUrls) {
        // if there's a new image - create a resized version  
        if(post.imageUrls.indexOf(req.body.imageUrls[i]) == -1) {
          // console.log('adding pic ', req.body.imageUrls[i]);
          imagesToAdd.push(req.body.imageUrls[i]);
        }
      }
    }

    var val = [];

    for (val in req.body) {
      post[val] = req.body[val];
    }

    if (req.body.status == "cancelled") {
      // make the offers invalid
      console.log(post.offers);
      var offersObj = post.offers.toObject();
      for (var i in offersObj) {
        Offer.findOne({
          _id: offersObj[i]
        }, function(err, offer) {
          console.log(offer);
          if (offer.status != "cancelled") {
            offer['status'] = 'cancelled';
            offer.save(function(err, offer) {
              console.log('updated offer', offer);
            });
          }
        });
      }
    }

    // save the post
    post.save(function(err, post) {
      if (err) {
        return res.send(err);
      }

      // get and return all the posts after you create another
      Post.findOne({
        _id: req.params.post_id
      }, function(err, post) {
          if (err)
              res.send(err)

          res.json(post);

          // take care of any added images
          if (imagesToAdd.length > 0) {
            addResizedImages(post, imagesToAdd, "mobileImageUrls", 375, 415, true);
            addResizedImages(post, imagesToAdd, "mobileImageUrlsAvatar", 125, 115, true);
          }
      });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | ADD COMMENT TO POST
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id/comments').post(isAuthenticated, function(req, res, next) {

  // find the post
  // populate the offers
  // populate the comments that are active
  Post
  .findOne({ _id : req.body.post })
  .populate('offers')
  .populate('comments likes', null, { status: { $in: [ 'true' ] } })
  .exec(function(err, post) {
    if (err)
      return err;

    // create and save the comment
    var comment = new Comment(req.body);

    comment.save(function(err, comment) {
      if (err) { return next(err); }

      // create a activity for the person who made the comment
      var activityObj = new Activity({
        activityModel: 'Comment',
        user: req.body.poster,
        modelRef: comment._id,
        post: comment.post
      });

      // save the activity
      activityObj.save(function(err, obj) {
        if (err)
          console.log(err);

        activityObj = obj;
      });

      // add the activity to the user who posted the comment
      addActivityToUser(req.body.poster, activityObj);

      // console.log(post.comments);

      // add comment to post
      post.comments.push(comment);

      post.save(function(err, post2) {
        if (err) { return next(err); }

        // get and return all the comments after you create another comment
        Comment.find({
          post: req.body.post,
          status: true
        })
        .populate('poster')
        .exec(function(err, comments) {
          // console.log(comments);
          if (err)
            res.send(err)

          // take out socket instance from the app container
          var socketio = req.app.get('socketio');
          // emit an event for all connected clients
          socketio.sockets.emit('comment.created', comments);

          // console.log(post.commments);
          // console.log(post2.comments);


          // get the users that have commented
          var commentUsers = _getUniqueParticipants(getProperty(post2.comments.slice(0, -1), "poster"), post.seller_id);

          // get the users that have liked
          // console.log('likes baby \n' + post2.likes);
          // console.log('comments \n' + post2.comments);
          // var like1 = getProperty(post2.likes);
          var likeUsers = _getUniqueParticipants(getProperty(post2.likes, "user"), post.seller_id);

          // console.log('offers baby \n' + post2.offers);
          var offerUsers = _getUniqueParticipants(getProperty(post2.offers, "poster"), post.seller_id);

          // var commentUsers = [];
          // var posterID;

          // // only add unique users to the commentUsers list
          // // ignore the last person who commented
          // for (var u in post2.comments.slice(0, -1)) {
          //   posterID = post2.comments[u].poster;
          //   var isInArray = commentUsers.some(function (user) {
          //       return user.equals(posterID);
          //   });
          //   // console.log(commentUsers.indexOf(posterID));
          //   if (!isInArray && (posterID != post.seller_id)) {
          //     console.log('user not in array ' + posterID);
          //     commentUsers.push(posterID);
          //   }
          // }

          // console.log('these are the ppl (without seller) who commented \n' + commentUsers);
          // console.log('2. these are the ppl (without seller) who liked \n' + likeUsers);
          // console.log('2. these are the ppl (without seller) who offered \n' + offerUsers);

          // if the commenter is not the seller
          // send a notification to the post's creator
          if (req.body.poster != post.seller_id) {
            sendNotificationToSeller(
                                     post.seller_id,
                                     "Comment",
                                     req,
                                     comment,
                                     activityObj,
                                     commentUsers);
            // send a notification to everyone who commented on the listing
            _sendNotifToAffectedUsers(commentUsers,
                                      "Comment",
                                      req,
                                      comment,
                                      activityObj,
                                      true);

            // send a notification to everyone who liked the listing
            // _sendNotifToAffectedUsers(commentUsers,
            //                           "Comment",
            //                           req,
            //                           comment,
            //                           activityObj,
            //                           true);


            // send a notification to everyone who offered on the listing
            _sendNotifToAffectedUsers(offerUsers,
                                      "Comment",
                                      req,
                                      comment,
                                      activityObj,
                                      true);
          }
          else {
            // send a notification to everyone who commented on the listing

            _sendNotifToAffectedUsers(commentUsers,
                                      "Comment",
                                      req,
                                      comment,
                                      activityObj,
                                      false);
            // send a notification to everyone who offered on the listing
            _sendNotifToAffectedUsers(offerUsers,
                                      "Comment",
                                      req,
                                      comment,
                                      activityObj,
                                      false);
            }

          res.json(comment);
        });
      });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | UPDATE A COMMENT
 |--------------------------------------------------------------------------
 */

router.route('/post/:comment_id/comments').put(isAuthenticated, function(req, res, next) {

  // console.log('got to update comments');
  // console.log(req);

  // find the comment based on the provided comment id
  Comment.findOne({
    _id: req.params.comment_id
  }, function(err, comment) {
    if (err)
      res.send(err);

    // console.log('updated comment');
    // console.log(req.body.content);
    // console.log('comment content');
    // console.log(comment.content);
    // add the updated/new comment to the comment model
    comment.content.push(req.body.content);

    // save it
    comment.save(function(err, comment){
      if (err) { return next(err); }

        // console.log('heres the comment postid')
        // console.log(comment.post);
        // // get and return all the comments after you create another comment
        Comment.find({
          post: comment.post,
          status: true
        })
        .populate('poster')
        .exec(function(err, comments) {
          // console.log(comments);
          if (err)
            res.send(err)

        //   // take out socket instance from the app container
          var socketio = req.app.get('socketio');
        //   // emit an event for all connected clients
          socketio.sockets.emit('comment.updated', comments);
          res.json(comments);
        });


      });


    });
  });

/*
 |--------------------------------------------------------------------------
 | DELETE A COMMENT
 |--------------------------------------------------------------------------
 */

router.route('/post/:comment_id/remove').put(isAuthenticated, function(req, res, next) {

  // console.log('got to remove comments');
  // console.log(req);

  // find the comment based on the provided comment id
  Comment.findOne({
    _id: req.params.comment_id
  }, function(err, comment) {
    if (err)
      res.send(err);

    // console.log('updated comment');
    // add the updated/new comment to the comment model
    comment.status = req.body.status

    // save it
    comment.save(function(err, comment){
      if (err) { return next(err); }

        // console.log('heres the comment postid')
        // console.log(comment.post);
        // // get and return all the comments after you create another comment
        Comment.find({
          post: comment.post,
          status: true
        })
        .populate('poster')
        .exec(function(err, comments) {
          // console.log(comments);
          if (err)
            res.send(err)

        //   // take out socket instance from the app container
          var socketio = req.app.get('socketio');
        //   // emit an event for all connected clients
          socketio.sockets.emit('comment.updated', comments);
          res.json(comments);
        });
      });
    });
  });

/*
 |--------------------------------------------------------------------------
 | LIKING + UNLIKING A POST
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id/like').post(isAuthenticated, function(req, res, next) {
// router.post('/post/:post_id/like', function(req,res,next) {

  // check if user has already liked post
  Like.findOne({
    user: req.body.user,
    post: req.params.post_id
  }, function(err, like) {

    // if they liked it
    if (like) {

      // remove the like
      // console.log(like.status);
      if (like.status === true) {
        //return res.send('Unliked.');
        like.status = false;
        like.save(function(err, like){
          if (err) { return next(err); }

          // Post.findOne({
          //   _id: req.params.post_id
          // }, function(err, post) {
          //   if (err)
          //     res.send(err);
          //   res.json(post);
          // });

          // use mongoose to get all posts in the db
          Post
          .findOne({ _id: req.params.post_id })
          .populate('seller')
          .populate('likes', null, { status: { $in: [ 'true' ] } }) // only works if we pushed refs to children
          .exec(function (err, post) {
            if (err) res.send(err);

            User.populate(post, {
              path:'likes.user'
            }, function(err, post) {

              res.json(post);
            });
            // res.json(post);
          });

        });
      }

      // like again
      else {
        like.status = true;
        like.save(function(err, like){
          if (err) { return next(err); }

          // create an activity for the person who made the like
          var activityObj = new Activity({
            activityModel: 'Like',
            user: req.body.user,
            modelRef: like._id,
            post: like.post
          });

          // save the activity
          activityObj.save(function(err, obj) {
            if (err)
              console.log(err);

            activityObj = obj;
          });

          // add the activity to the user who posted the comment
          addActivityToUser(req.body.user, activityObj);

          // find and return the post
          Post
          .findOne({ _id: req.params.post_id })
          .populate('seller')
          .populate('likes comments', null, { status: { $in: [ 'true' ] } }) // only works if we pushed refs to children
          .exec(function (err, post) {
            if (err) res.send(err);

            var likeUsers = _getUniqueParticipants(getProperty(post.likes, "user"), post.seller_id);

            // if the person who liked is not the seller
            // send a notification to the post's creator
            if (req.body.user != post.seller_id) {
              sendNotificationToSeller(
                                       post.seller_id,
                                       "Like",
                                       req,
                                       like,
                                       activityObj,
                                       likeUsers);


            }

            User.populate(post, {
              path:'likes.user'
            }, function(err, post) {

              // User.findOne({
              //   _id:post.seller_id
              // }, function(err, seller) {
              //   var socketio = req.app.get('socketio');
              //   // emit an to the seller that their post has been liked
              //   socketio.to(seller.socketID).emit('like.made.notif', like, post);
              // });

              res.json(post);
            });
            // res.json(post);
          });
        });
      }
    }

    // if they haven't liked it
    if (!like) {

      // add a like
      Post
      .findOne({ _id: req.params.post_id })
      .exec(function(err, post) {
        if (err)
          res.send(err);
        if(post)

        req.post = post;

        var like = new Like(req.body);
        like.post = req.post;

        like.save(function(err, like){
          if (err) { return next(err); }

          // create an activity for the person who made the like
          var activityObj = new Activity({
            activityModel: 'Like',
            user: req.body.user,
            modelRef: like._id,
            post: like.post
          });

          // save the activity
          activityObj.save(function(err, obj) {
            if (err)
              console.log(err);

            activityObj = obj;
          });

          // add the activity to the user who posted the comment
          addActivityToUser(req.body.user, activityObj);

          req.post.likes.push(like);

          req.post.save(function(err, post) {
            if (err) { return next(err); }

            // find and return the post
            Post
            .findOne({ _id: req.params.post_id })
            .populate('seller')
            .populate('likes', null, { status: { $in: [ 'true' ] } }) // only works if we pushed refs to children
            .exec(function (err, post) {
              if (err) res.send(err);

              var likeUsers = _getUniqueParticipants(getProperty(post.likes, "user"), post.seller_id);

              // if the person who liked is not the seller
              // send a notification to the post's creator
              if (req.body.user != post.seller_id) {
                sendNotificationToSeller(
                                         post.seller_id,
                                         "Like",
                                         req,
                                         like,
                                         activityObj,
                                         likeUsers);
              }

              User.populate(post, {
                path:'likes.user'
              }, function(err, post) {

                  // User.findOne({
                  //   _id:post.seller_id
                  // }, function(err, seller) {
                  //   var socketio = req.app.get('socketio');
                  //   // emit an event for all connected clients
                  //   socketio.to(seller.socketID).emit('like.made.notif', like, post);
                  // });

                  res.json(post);
              });
              // res.json(post);
            });

            User.findOne({
              _id: req.body.user
            }, function(err, user) {
              if (err)
                res.send(err);

              if (user) {
                // console.log(user);
                user.likedPosts.push(like);
                user.save(function(err, user) {
                  if (err)
                    res.send(err);
                });
              }
            });

          });
        });
      });

    }

  });
});

/*
 |--------------------------------------------------------------------------
 | MAKE AN OFFER TO POST
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id/offers').post(isAuthenticated, function(req, res, next) {
// router.post('/post/:post_id/offers', function(req,res,next) {

  // check if user has already made an offer post
  Offer.findOne({
    poster: req.body.poster,
    post: req.params.post_id,
    status: 'active'
  }, function(err, offer) {

    if (offer) {

      res.json('offer already made.')

    }

    if (!offer) {

      Post.findOne({
        _id: req.body.post
      }, function(err, post) {
        if (err)
          res.send(err);

        req.post = post;

        var offer = new Offer(req.body);
        offer.post = req.post;
        offer.title = post.title;

        // save the offer object to the DB
        offer.save(function(err, offer){
          if (err) { return next(err); }

          // create an activity for the person who made the offer
          var activityObj = new Activity({
            activityModel: 'Offer Made',
            user: req.body.poster,
            modelRef: offer._id,
            post: offer.post
          });

          // save the activity
          activityObj.save(function(err, obj) {
            if (err)
              // console.log(err);

            activityObj = obj;
          });

          // add the activity to the user who posted the comment
          addActivityToUser(req.body.poster, activityObj);

          // add the offer to the post.offers array
          req.post.offers.push(offer);
          req.post.save(function(err, post) {
            if (err) { return next(err); }

            User.findOne({
              _id: req.body.poster
            }, function(err, user) {
              if (err)
                res.send(err);

              user.offeredPosts.push(offer);
              user.save(function(err, user) {
                if (err)
                  res.send(err);

                Offer
                .find({post: req.body.post, status: 'active'})
                .populate('poster')
                .exec(function(err, offers) {
                  // console.log(offers);
                  if (err)
                    res.send(err);

                // get and return all the offers after you create another offer
                // Offer.find({
                //   post: req.body.post,
                //   status: 'active'
                // }, function(err, offers) {
                //   console.log(offers);
                //   if (err)
                //     res.send(err)

                  // find and return the post
                  Post
                  .findOne({ _id: req.params.post_id })
                  .populate('seller')
                  .populate('offers')
                  .populate('likes', null, { status: { $in: [ 'true' ] } }) // only works if we pushed refs to children
                  .exec(function (err, post) {
                    if (err) res.send(err);


                    var offerUsers = _getUniqueParticipants(getProperty(post.offers, "poster"), post.seller_id);

                    // console.log('my offer makers \n' + offerUsers);

                    if (req.body.poster != post.seller_id) {
                      sendNotificationToSeller(post.seller_id,
                                               "Offer Made",
                                               req,
                                               offer,
                                               activityObj,
                                               offerUsers);

                      // send a notification to everyone who offered on the listing
                      _sendNotifToAffectedUsers(offerUsers,
                                                "Offer Made",
                                                req,
                                                offer,
                                                activityObj,
                                                true);

                      // send an email notification to the seller
                      sendEmail([post.seller_id], "Offer Made");
                    }

                    // populate the subdocument
                    User.populate(post, {
                      path:'likes.user'
                    }, function(err, post) {

                      User.populate(post, {
                        path: 'offers.poster'
                      }, function(err, post) {

                        // take out socket instance from the app container
                        var socketio = req.app.get('socketio');
                        // emit an event for all connected clients
                        socketio.sockets.emit('offer.made', offers, post);

                      });

                    });

                    // send an email to the seller that an offer has been made
                    var template = new EmailTemplate(path.join(templatesDir, 'offerMade'));
                    var locals = {
                      sellerName: post.seller_name,
                      postName: post.title,
                      // postLink: 'http://stylefnf.com/#/detail/' + post._id,
                      postPic: post.imageUrls[0],
                      // offerMakerProfile: 'http://stylefnf.com/#/profile/' + user._id,
                      // offerMakerPic: user.facebookPicture,
                      offerPrice: offer.total,
                      offerMakerName: user.firstName,
                      offerLink: 'http://stylefnf.com/#/detail/' + post._id,
                      sellerID: post.seller_id
                    };
                    sendEmail(template, locals, "offerMade");
                    res.json(offer);
                  });

                });

              });
            });

          });
        });
      });

    }
  });
});

/*
 |--------------------------------------------------------------------------
 | GET AN OFFER
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id/offer/:offer_id').get(function(req, res) {

  Offer
  .findOne({post: req.params.post_id, _id: req.params.offer_id})
  // .populate('poster')
  .exec(function (err, offer) {

  // Offer.findOne({
  //   post: req.params.post_id,
  //   _id: req.params.offer_id
  // }, function(err, offer) {
    if (err)
      res.send(err);

    User.populate(offer, {
      path: 'poster'
    },
    function(err, offer2) {
      if (err) return err;

      res.json(offer2);
    });

    // populate the offer poster
    // console.log(offer)

    // // return the offer
    // res.json(offer);
    // req.post = post;
  });

});

/*
 |--------------------------------------------------------------------------
 | DELETE AN OFFER
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id/offer/:offer_id').put(isAuthenticated, function(req, res) {

    console.log(req.params.post_id);
    console.log(req.params.offer_id);

    // find the offer (if active)
    Offer.findOne({
      post: req.params.post_id,
      _id: req.params.offer_id
    }, function(err, offer) {
      if(err)
        res.send(err);

      // update the offer status to "cancelled"
      // var val = [];
      // // console.log(req.body);
      // for (val in req.body.offerData) {
      //   offer[val] = req.body.offerData[val];
      // }
      offer['status'] = 'cancelled';
      // offer['cancellationReason'] = req.body.cancellationReason;
      // console.log(offer);

      // save the offer
      offer.save(function(err, offer) {
        if (err) {
          return res.send(err);
        }

        // create an activity for the person who removed the offer
        var activityObj = new Activity({
          activityModel: 'Offer Removed',
          user: req.body.userData,
          modelRef: offer._id,
          post: offer.post
        });

        // save the activity
        activityObj.save(function(err, obj) {
          if (err)
            console.log(err);

          activityObj = obj;
        });

        // add the activity to the user who removed the offer
        addActivityToUser(req.body.userData, activityObj);

        // find the corresponding post
        Post.findOne({
          _id: req.params.post_id
        }, function(err, post) {
          if (err)
            res.send(err);

          // var offer_id = req.params.offer_id;
          // console.log(offer_id);

          // remove the offerId from the offers array -> this contains the offers associated with the post
          req.post = post;
          // console.log(req.post.offers);
          req.post.offers.pull(req.params.offer_id);
          // console.log(req.post);

          var tempPostStatus = post.status;

          if (offer.poster == req.post.buyer) {
            req.post.status = "Available";
            req.post.buyer = '';
          }

          if (req.post.offers.length == 0) {
            req.post.status = "Available";
            req.post.buyer = '';
          }

          // save the updated post
          req.post.save(function(err, post) {
            if (err) { return next(err); }

            User.findOne({
              _id: offer.poster
            }, function(err, user) {
              if (err)
                res.send(err);

              user.offeredPosts.pull(offer);
              user.save(function(err, user) {
                if (err)
                  res.send(err);

                // get and return all the active offers after you create another offer
                Offer.find({
                  post: req.params.post_id,
                  status: 'active'
                }, function(err, offers) {
                  // console.log(offers);
                  if (err)
                    res.send(err)

                  // find and return the post
                  Post
                  .findOne({ _id: req.params.post_id })
                  .populate('seller')
                  .populate('offers')
                  .populate('likes', null, { status: { $in: [ 'true' ] } }) // only works if we pushed refs to children
                  .exec(function (err, post) {
                    if (err) res.send(err);

                    if (tempPostStatus == "Held" && req.post.status == "Available") {

                      // the person who removed the offer is the post creator
                      if (req.body.userData == post.seller_id) {

                        // console.log('made it to even more inside');

                        // send a notification to the offer creator
                        sendNotificationToSeller(
                                                 offer.poster,
                                                 "Offer Removed",
                                                 req,
                                                 offer,
                                                 activityObj,
                                                 [offer.poster]);
                      }
                      // the person who removed the offer is the offer creator
                      else if (req.body.userData == offer.poster) {

                        // send a notification to the post creator
                        sendNotificationToSeller(
                                                 post.seller_id,
                                                 "Offer Removed",
                                                 req,
                                                 offer,
                                                 activityObj,
                                                 [post.seller_id]);

                      }

                      // send a notification to the other people who have offered that the listing is now available
                      var offerUsers = _getUniqueParticipants(getProperty(offers, "poster"), post.seller_id);

                      var tempObj = new Activity({
                        activityModel: 'Listing Available',
                        user: req.body.userData,
                        modelRef: offer._id,
                        post: offer.post
                      });
                      // var tempObj = activityObj;
                      // tempObj.activityModel = "Listing Held";
                      _sendNotifToAffectedUsers(offerUsers,
                                                "Listing Available",
                                                req,
                                                offer,
                                                tempObj,
                                                false);
                    }

                    // populate the subdocument
                    User.populate(post, {
                      path:'likes.user'
                    }, function(err, post) {

                      //populate the offers data
                      User.populate(post, {
                        path: 'offers.poster'
                      }, function(err, post) {
                        // take out socket instance from the app container
                        var socketio = req.app.get('socketio');
                        // emit an event for all connected clients
                        socketio.sockets.emit('offer.removed', offers, post);

                        // socketio.to(user.socketID).emit('offer.removed.notif', offer, post);
                        sendToUser(req, user._id, 'offer.removed.notif', offer, post);

                        User.findOne({_id:post.seller_id}, function(err, seller) {
                          // send a notification to the user who posted the item
                          // socketio.to(seller.socketID).emit('offer.removed.notif', offer, post);
                          sendToUser(req, seller._id, 'offer.removed.notif', offer, post);
                        });
                      });
                    });
                  });
                  res.json(offer);
                });

              });
            });

          });
        });

      }); // end of save offer
    }); // end of findOne offer

});

/*
 |--------------------------------------------------------------------------
 | ACCEPT AN OFFER
 |--------------------------------------------------------------------------
 */

router.route('/post/:post_id/accept/:offer_id').put(isAuthenticated, function(req, res) {

  // console.log('post id: ' + req.params.post_id);
  // console.log('offer id: ' + req.params.offer_id);

  Offer
  .findOne({
    post: req.params.post_id,
    _id: req.params.offer_id,
    status: 'active'
  })
  .populate('poster')
  .populate('post')
  // .populate('poster')
  .exec(function(err, offer) {
    if(err)
      res.send(err)
    // console.log(offer);

    // update the offer accepted field to true
    var val = [];
    // console.log(req.body);
    for (val in req.body) {
      offer[val] = req.body[val];
    }
    // console.log(offer);

    // save the offer
    offer.save(function(err, offer) {
      if (err) {
        return res.send(err);
      }

      // create an activity for the listing's seller
      var activityObj = new Activity({
        activityModel: 'Offer Accepted',
        user: offer.post.seller_id,
        modelRef: offer._id,
        post: offer.post
      });

      // save the activity
      activityObj.save(function(err, obj) {
        if (err)
          // console.log(err);

        activityObj = obj;
      });

      // add the activity to the user who posted the comment
      addActivityToUser(offer.post.seller_id, activityObj);

      // get and return all the active offers after you create another offer
      Offer.find({
        post: req.params.post_id,
        status: 'active'
      }, function(err, offers) {
        // console.log(offers);
        if (err)
          res.send(err)

        // find and return the post
        Post
        .findOne({ _id: req.params.post_id })
        .populate('seller')
        .populate('offers')
        .populate('likes', null, { status: { $in: [ 'true' ] } }) // only works if we pushed refs to children
        .exec(function (err, post) {
          if (err) res.send(err);

          var offerUsers = _getUniqueParticipants(getProperty(offers, "poster"), post.seller_id);

          offerUsers = offerUsers.filter(function (el) {
                  return el.toHexString() !== offer.poster._id.toHexString();
          });

          // console.log('my offer makers \n' + offerUsers);


          if (req.body.poster != post.seller_id) {
            // send a notification to the offer maker that their offer was accepted
            sendNotificationToSeller(offer.poster,
                                     "Offer Accepted",
                                     req,
                                     offer,
                                     activityObj,
                                     [offer.poster]);

            // send a notification to everyone who offered on the listing that the listing has been placed on hold
            // console.log('these are the offersUsers\n' + offerUsers);
            var tempObj = new Activity({
              activityModel: 'Listing Held',
              user: offer.post.seller_id,
              modelRef: offer._id,
              post: offer.post
            });
            // var tempObj = activityObj;
            // tempObj.activityModel = "Listing Held";
            _sendNotifToAffectedUsers(offerUsers,
                                      "Listing Held",
                                      req,
                                      offer,
                                      tempObj,
                                      false);
          };

          // populate the subdocument
          User.populate(post, {
            path:'likes.user'
          }, function(err, post) {

            User.populate(post, {
              path:'offers.poster'
            }, function(err, post) {
              // take out socket instance from the app container
              var socketio = req.app.get('socketio');
              // emit an event for all connected clients
              socketio.sockets.emit('offer.accepted', offers, post);

              // send a notification to the offer maker
              // socketio.to(offer.poster.socketID).emit('offer.accepted.notif', offer, post);
            });
          });

          // send an email to the offer maker that their offer has been accepted
          var template = new EmailTemplate(path.join(templatesDir, 'offerAccepted'));
          var locals = {
            // offerMakerName:
            postName: post.title,
            postLink: 'http://stylefnf.com/#/detail/' + post._id,
            postPic: post.imageUrls[0],
            sellerProfileLink: 'http://stylefnf.com/#/profile/' + post.seller_id,
            // sellerPic: user.facebookPicture,
            // sellerName: user.firstName,
            offerPrice: offer.total,
            offerMakerID: offer.poster,
            sellerID: post.seller_id
          };
          sendEmail(template, locals, "offerAccepted");
        });

        res.json(offer);
      });


    });

  });

});

/*
 |--------------------------------------------------------------------------
 | HOLD A POST
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id/hold').put(isAuthenticated, function(req,res) {

  Post.findOne({
    _id: req.params.post_id
  }, function(err, post) {
    if (err) {
      return res.send(err);
    }

    var val = [];

    for (val in req.body) {
      post[val] = req.body[val];
    }

    // save the post
    post.save(function(err, post) {
      if (err) {
        return res.send(err);
      }

      // get and return all the posts after you create another
      // Post.find(function(err, posts) {
      //     if (err)
      //         res.send(err)

      //     // take out socket instance from the app container
      //     var socketio = req.app.get('socketio');
      //     // emit an event for all connected clients
      //     socketio.sockets.emit('posts.updated', posts);
      //     //res.json(posts);
      //     console.log('sent the updated posts');
      // });

      // find and return the post
      Post
      .findOne({ _id: req.params.post_id })
      .populate('seller')
      .populate('likes', null, { status: { $in: [ 'true' ] } }) // only works if we pushed refs to children
      .exec(function (err, post) {
        if (err) res.send(err);

        // populate the subdocument
        User.populate(post, {
          path:'likes.user'
        }, function(err, post) {

          User.populate(post, {
            path:'offers.poster'
          }, function(err, post) {
            // take out socket instance from the app container
            var socketio = req.app.get('socketio');
            // emit an event for all connected clients
            socketio.sockets.emit('post.held', post);
            res.json(post);
            // console.log('sent the held post');
          });
        });
      });

    });
  });
});

/*
 |--------------------------------------------------------------------------
 | PURCHASE A POST - IMPLEMENT FURTHER WITH PAYMENTS
 |--------------------------------------------------------------------------
 */
router.route('/post/:post_id/:offer_id/purchase').post(isAuthenticated, function(req,res) {

  // verify that the user making the request is the user that made the offer

});

/*
 |--------------------------------------------------------------------------
 | GET SERVICE FEE
 |--------------------------------------------------------------------------
 */
router.route('/post/getServiceFee').post(function(req,res) {

  // console.log(req.body.offerPrice);

  // find the listing
  var offerPrice = req.body.offerPrice;
  var serviceFee = calcServiceFee(offerPrice);
  var sellerFee = calcSellerFee(offerPrice);

  var allFees = {'serviceFee' : serviceFee, 'sellerFee' : sellerFee};

  // console.log(serviceFee);

  res.json(allFees);

  // console.log(req.body);
});

function calcServiceFee(offerPrice) {
  var serviceFee;
  
  if (offerPrice < 20) {
    serviceFee = offerPrice * 0.07;
  } else if (offerPrice>= 20 && offerPrice < 40) {
    serviceFee = offerPrice * 0.06;
  } else {
    serviceFee = offerPrice * 0.05;
  }

  serviceFee = Math.round( serviceFee * 1e2 ) / 1e2;

  return serviceFee;
}

function calcSellerFee(offerPrice) {
  var serviceFee = (offerPrice * 0.029) + 0.30;

  serviceFee = Math.round( serviceFee * 1e2 ) / 1e2;

  return serviceFee;
}


/*
 |--------------------------------------------------------------------------
 | PROCESS PAYPAL PAYMENT COMPLETED
 |--------------------------------------------------------------------------
 */
router.route('/confirmPayment').post(function(req,res) {

  console.log(req.body);

  // check if the incoming request has a offer ID
  // using the offer schema (Offer.js)
  if (req.body.custom)  {
    async.waterfall([
      // find the offer and populate it the appropriate variables
      function(done) {
        // search through offer system
        Offer
        .findOne({ _id: req.body.custom })
        .populate('poster')
        .populate('post')
        .exec(function (err, offer) {
          if (err) res.send(err);

          // populate the subdocument
          User.populate(offer, {
            path:'post.seller'
          }, function(err, offer) {


            // check if the item is already paid for

            if (offer.post.status != "Paid") {
              // create an activity for the listing's seller
              var activityObj = new Activity({
                activityModel: 'Payment Received',
                user: offer.poster._id,
                modelRef: offer._id,
                post: offer.post._id
              });

              // save the activity
              activityObj.save(function(err, obj) {
                if (err)
                  console.log(err);

                activityObj = obj;

                // add the activity to the user who bought the listing
                addActivityToUser(offer.poster._id, activityObj);

                // send a notification to the buyer and seller that a payment has been made
                sendNotificationToSeller(offer.post.seller._id,
                                         "Payment Received",
                                         req,
                                         offer,
                                         activityObj,
                                         [offer.post.seller, offer.poster]);

                  // now we have a complete offer object
                  // pass this object to the "send an email" step
                  done(err, offer);
              });
            }
            else {
              return res.status(410).send({ message: 'Please contact support for help: support@stylefnf.com' });
            }

          });
        });
      },
      // update the offer object
      function(offer, done) {

       // update the offer status to "sold"
        offer.status="Paid";
        // save the offer
        offer.save(function(err, offer) {
          if (err) {
            return res.send(err);
          }

          // finished
          done(err, offer);
        });
      },
      // update the listing detail
      function(offer, done) {
        // execute a search for the post that is defined by offer.post._id
        Post.findOne({
          _id: offer.post._id
        })
        .exec(function(err, post) {
          if(err)
            res.send(err);

          // change the status to sold once the transaction done
          post.status="Paid";

          // save it
          post.save(function(err, post) {
            if (err) {
              return res.send(err);
            }


            // store the post obj in the buyer's purchased array

            // done
            done(err, offer);
          }); 
        });
      },
      // store the post obj in the seller's sold array
      function(offer, done) {

        User.findOne({
          _id: offer.post.seller._id
        })
        .exec(function(err, seller) {
          if(err)
            res.send(err);

          // add to the beginning of the sold array
          seller.soldPosts.unshift(offer.post._id);

          // save user obj
          seller.save(function(err, seller) {
            if (err) {
              return res.send(err);
            }

            // done
            done(err, offer);
          });
        })
      },
      // store the post obj in the buyer's purchased array
      function(offer, done) {

        User.findOne({
          _id: offer.poster._id
        })
        .exec(function(err, buyer) {
          if(err)
            res.send(err);

          // add to the beginning of the sold array
          buyer.purchasedPosts.unshift(offer.post._id);

          // save user obj
          buyer.save(function(err, buyer) {
            if (err) {
              return res.send(err);
            }
            
            // done
            done(err, offer);
          });
        })
      },
      // send an email to the seller
      function(offer, done) {
        var mailer = nodemailer.createTransport(sgTransport(sgOptions));
        var template = new EmailTemplate(path.join(templatesDir, 'paymentReceived'));

        var calcPayout = getTotal(offer.total, offer.sellerFee, "seller").toFixed(2);
        var newDate = new Date();
        var returns = convertReturn(offer.post.return);
        


        // create the variables that are going to be used to populate the email
        var locals = {
          sellerName: offer.post.seller.firstName,
          sellerFullName: offer.post.seller.firstName + " " + offer.post.seller.lastName,
          invoiceNum: req.body.txn_id,
          currDate: newDate.toDateString(),
          offerPrice: offer.total.toFixed(2),
          sellerFee: offer.sellerFee.toFixed(2),
          buyerName: offer.poster.firstName,
          postName: offer.post.title,
          totalPayout: calcPayout,
          returnPolicy: returns,
          // postLink: 'http://stylefnf.com/#/detail/' + post._id,
          // postPic: post.imageUrls[0],
          buyerProfile: 'http://stylefnf.com/#/profile/' + offer.poster._id,
          offerLink: 'http://stylefnf.com/#/detail/' + offer.post._id,
          // sellerID: post.seller_id
        };
        
        // Send seller email
        template.render(locals, function (err, results) {
          if (err) {
            return console.error(err)
          }

          mailer.sendMail({
            from: 'Stylefnf <support@stylefnf.com>',
            to: offer.post.seller.email,
            bcc: 'support@stylefnf.com',
            subject: 'Payment successfully received',
            html: results.html
          }, function (err, responseStatus) {
            if (err) {
              return console.error(err);
            }
            // console.log(responseStatus.message);
            done(err, offer, locals);
          });
        });
      },
      // send an email to the buyer
      function(offer, done) {
        var mailer = nodemailer.createTransport(sgTransport(sgOptions));
        var template = new EmailTemplate(path.join(templatesDir, 'buyerReceipt'));

        var calcPrice = getTotal(offer.total, offer.serviceFee, "buyer").toFixed(2);
        var newDate = new Date();
        var returns = convertReturn(offer.post.return);

        // create the variables that are going to be used to populate the email
        var locals = {
          sellerName: offer.post.seller.firstName,
          buyerFullName: offer.poster.firstName + " " + offer.poster.lastName,
          invoiceNum: req.body.txn_id,
          currDate: newDate.toDateString(),
          offerPrice: offer.total.toFixed(2),
          serviceFee: offer.serviceFee.toFixed(2),
          buyerName: offer.poster.firstName,
          postName: offer.post.title,
          totalPrice: calcPrice,
          returnPolicy: returns,
          // postLink: 'http://stylefnf.com/#/detail/' + post._id,
          // postPic: post.imageUrls[0],
          // buyerProfile: 'http://stylefnf.com/#/profile/' + offer.poster._id,
          sellerProfile: 'http://stylefnf.com/#/profile/' + offer.post.seller._id,
          offerLink: 'http://stylefnf.com/#/detail/' + offer.post._id,
          // sellerID: post.seller_id
        };
        
        // Send seller email
        template.render(locals, function (err, results) {
          if (err) {
            return console.error(err)
          }

          mailer.sendMail({
            from: 'Stylefnf <support@stylefnf.com>',
            to: offer.poster.email,
            subject: 'Your Purchase - ' + locals.postName,
            html: results.html
          }, function (err, responseStatus) {
            if (err) {
              return console.error(err);
            }
            // console.log(responseStatus.message);
            res.send('err');
          });
        });
      }              
    ], function(err) {
      if (err) return next(err);
      res.send('error');
    });
  }
  else {
    // return res.status(409).send({ message: 'Error, invalid IPN.' });
    console.log('Error, invlaid IPN.');
  }

});

function getTotal(price, fee, user) {
  if (user === "seller") {
      var total = price - fee;
  }
  else {
      var total = price + fee;
  }
  return Math.round( total * 1e2 ) / 1e2;
}

function convertReturn(option) {
  if (option == "Day") {
    return "3 days return";
  } else if (option == "Maybe") {
    return "Conditional Return";
  } else if (option == "Hour") {
    return "24 hr return";
  } else {
    return "No return/refund";
  }
}


function sendGCM(registrationIds, message){
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
  // delete a post
  // app.delete('/posts/:post_id', function(req, res) {
  //     Post.remove({
  //         _id : req.params.post_id
  //     }, function(err, post) {
  //         if (err)
  //             res.send(err);

  //         // get and return all the posts after you create another
  //         Post.find(function(err, posts) {
  //             if (err)
  //                 res.send(err)
  //             res.json(posts);
  //         });
  //     });
  // });

module.exports = router;
