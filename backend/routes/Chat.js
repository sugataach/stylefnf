'use strict';

// load the post model
var Post = require('../models/Post');
var User = require('../models/User');
var Comment = require('../models/Comment');
var Like = require('../models/Like');
var Offer = require('../models/Offer');
var Chat = require('../models/Chat');
var Message = require('../models/Message');
var express = require('express');
var moment = require('moment');
var router = express.Router();
var config = require('../config/config');
var querystring = require('querystring');
var ObjectId = require('mongoose').Types.ObjectId;
var jwt = require('jwt-simple');
var gcm = require('node-gcm');

var redis = require('redis');
var redisWorker = redis.createClient();
redisWorker.select(2);

var GOOGLE_API_KEY = config.GOOGLE_API_KEY;

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

    // console.log('Authenticated user');

    req.user = user;
    next();
  })
}

function getOther(participants, id) {
  for (var x in participants) {
    if (participants[x]._id != id) {
      return participants[x];
    }
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
| GET ALL CHAT THREADS FOR A USER
|--------------------------------------------------------------------------
*/
router.route('/').get(isAuthenticated, function(req, res) {

  // console.log(req.headers);

  // given a user profile
  // populate all the chat threads
  User
  .findOne(
    { _id: req.headers.profile_id }
  )
  .populate('chats')
  .sort('-lastUpdated')
  .exec(function (err, user) {

    // sort the chats

    User.populate(user.chats, {
      path:'participants',
      options: { sort: '-lastUpdated'},
      select: 'firstName lastName profilePictures'
    }, function(err, results) {

        // sort the chats by last updated
        var chats = results.toObject();
        chats.sort(function(m1, m2) { return m2.lastUpdated - m1.lastUpdated; });
        // console.log(chats.sort(function(m1, m2) { return m2.lastUpdated - m1.lastUpdated; }));
        // console.log(chats);
        res.json(chats);
    });

  });

});

/*
|--------------------------------------------------------------------------
| GET DETAILED MESSAGE THREAD
|--------------------------------------------------------------------------
*/

router.route('/:chat_id').post(isAuthenticated, function(req, res) {

  // given the chat id find the chat thread
  Chat
  .findOne({ _id: req.params.chat_id })
  .populate('messages participants')
  .exec(function(err, chat) {
    if (err)
      res.send(err);

    User.populate(chat.messages, {
      path:'receiver sender',
      select: 'firstName lastName profilePictures'
    }, function(err, results) {
        // console.log(results);
        res.json(results);
    });
    
  });
});

/*
|--------------------------------------------------------------------------
| UPDATE MESSAGES AFTER BEING SEEN
|--------------------------------------------------------------------------
*/

router.route('/:chat_id').put(isAuthenticated, function(req, res) {

  // console.log(req.params.chat_id);

  // given the chat id find the chat thread
  Chat
  .findOne({ _id: req.params.chat_id })
  .populate('messages')
  .exec(function(err, chat) {
    if (err)
      res.send(err);

    // console.log(req.body.timestamp);

    // for all messages that don't have a seen timestamp
    for (var i in chat.messages) {
      if ((chat.messages[i].seenTimestamp == null) && (chat.messages[i]._id)) {
        // update the the timestamp
        chat.messages[i].seenTimestamp = req.body.timestamp;
        // console.log(chat.messages[i]);
        chat.messages[i].save();
      }
    }

    chat.hasUnseenMessages = false;
    chat.save(function(err, chat) {
      // send a notifiction to the user who last sent the message
      console.log(chat);
      var lastSender = chat.messages[chat.messages.length-1].sender;
      var lastReceiver = chat.messages[chat.messages.length-1].receiver;
      User.findOne({
        _id : lastSender
      }, function(err, user) {
        if (err)
          res.send(err);
        
        // send a notification to the sender, with the timestamp
        var socketio = req.app.get('socketio');
        // that the receiver has seen the message
        // socketio.to(user.socketID).emit('message.seen', req.body.timestamp);
        sendToUser(req, user._id, "message.seen", req.body.timestamp);
      });
      // populate the chat
      User
      .findOne(
        { _id: lastReceiver }
      )
      .populate('chats')
      .exec(function (err, user) {

        User.populate(user.chats, {
          path:'participants',
          select: 'firstName lastName profilePictures'
        }, function(err, results) {

            // sort the chats by most recent
            var chatResults = results.toObject();
            chatResults.sort(function(m1, m2) { return m2.lastUpdated - m1.lastUpdated; });
            res.send(chatResults);
        });

      });
      
    });
  });
});

/*
|--------------------------------------------------------------------------
| SEND A MESSAGE
|--------------------------------------------------------------------------
*/

router.route('/').post(isAuthenticated, function(req, res) {

  var x;

  /* Requires:
  
  sender
  receiver
  chat: chat._id (if known chatid)
  content
  participants (if no known chatid)

  */

  // if a chat id has been included
  // this usually means that the users are on the chat page
  // find the given chat
  // create a new message
  // save that message to the chat
  if (req.body.chat) {

    Chat
    .findOne({ _id: req.body.chat })
    .populate('participants')
    .exec(function(err, chat) {

    // });
    // Chat.findOne({
    //   _id: req.body.chat
    // }, function(err, chat) {
      if (err)
        res.send(err);

      // create the message object
      var message = new Message(
          { sender: req.body.sender, receiver: req.body.receiver, chat: chat._id, content: req.body.content }
      );
      // console.log(message);

      // save the message object
      message.save(function(err, message){
        if (err) { return res.send(err); }

        // push the message object to the chat thread
        chat.messages.push(message);

        // update the chat lastUpdated var
        chat.lastUpdated = moment();

        // update that the chat has a new message
        chat.hasUnseenMessages = true;

        // save the last message
        chat.lastMessage = req.body.content;

        // save the sentUser
        chat.lastSentUser = req.body.sender;

        // save the chat thread
        chat.save(function(err, chat) {
          if (err) { return res.send(err); }

          // need to send the chat list and new messages
          // for each participant

          // find the participants of the chat
          User.find({
            _id: { $in: chat.participants }
          }, function(err, participants) {

            // console.log(participants)

            var socketio = req.app.get('socketio');

            // 
            for (x in participants) {

              if (participants[x]._id.toString() != req.body.sender) {
                console.log('sent message to' + participants[x].firstName);

                var sender = getOther(participants, participants[x]._id);
                
                // send a notification to the receiver
                // that the sender sent a message
                // socketio.to(participants[x].socketID).emit('new.message.received', sender, chat._id);
                sendToUser(req, participants[x]._id, "new.message.received", sender, chat._id);

                // create and send a push notification
                var messageObj = createPayload("Stylefnf", createPushNotifMsg(sender, chat), sender.profilePictures[0], false, "chat", chat._id); 
                sendGCM(participants[x].deviceToken, messageObj);
              }

              // console.log(participants[x]);

              // populate the chat
              User
              .findOne(
                { _id: participants[x]._id }
              )
              .populate('chats')
              .exec(function (err, user) {

                User.populate(user.chats, {
                  path:'participants',
                  select: 'firstName lastName profilePictures'
                }, function(err, results) {

                    // sort the chats by most recent
                    var chatResults = results.toObject();
                    chatResults.sort(function(m1, m2) { return m2.lastUpdated - m1.lastUpdated; });
                    // socketio.to(user.socketID).emit('message.sent', chatResults, chat);
                    sendToUser(req, user._id, "message.sent", chatResults, chat);
                });

              });
            }
            return res.send('done');
          });
          
        });
      });

    });

  }

  // if chat id has not been included
  // but if participants have been
  // check if the participants already have a chat going on
  // if so, do the same thing as above
  // otherwise create a new chat and append the message to it
  else if (req.body.participants && (req.body.content)) {

    // convert the req.body.participants to an array
    // prolly not neccessary once we use bodyparser
    var chatParticipants = req.body.participants;

    Chat
    .findOne({ participants: { $all: chatParticipants } })
    .populate('participants') // only works if we pushed refs to children
    .exec(function (err, chat) {
      if (err) 
          res.send(err);

    // match the chat participants
    // Chat.findOne({
    //   participants : { $all: chatParticipants }
    // }, function(err, chat) {
      // if(err)
      //   res.send(err)

      // If you find a chat
      // this means the participants already have a chat going but aren't on the chat page
      // push the message into the chat
      if (chat) {

        // create the message object
        // console.log(req.body.receiver);
        var message = new Message(
            { sender: req.body.sender, receiver: req.body.receiver, chat: chat._id, content: req.body.content }
        );
        // create the message object
        // var message = new Message(
        //       { sender: req.body.sender },{ receiver: req.body.receiver },{ chat: chat._id },{ content: req.body.content}
        // );
        // console.log(message);

        // save the message object
        message.save(function(err, message){
          if (err) { return res.send(err); }

          // push the message object to the chat thread
          chat.messages.push(message);

          // update the chat lastUpdated var
          chat.lastUpdated = moment();

          // save the last message
          chat.lastMessage = req.body.content;  
          
          // update that the chat has a new message
          chat.hasUnseenMessages = true;

          // save the sentUser
          chat.lastSentUser = req.body.sender;

          // save the chat thread
          chat.save(function(err, chat) {
            if (err) { return res.send(err); }

            // take out socket instance from the app container
            var socketio = req.app.get('socketio');

            // for each participant in the chat
            // send a notification
            for (x in chat.participants) {

              console.log(chat.participants[x]._id != req.body.sender);

              if (chat.participants[x]._id != req.body.sender) {

                var sender = getOther(chat.participants, chat.participants[x]._id);

                console.log('sent message to' + chat.participants[x].firstName);
                // send a notification to the receiver
                // socketio.to(chat.participants[x].socketID).emit('new.message.received', sender, chat._id);
                sendToUser(req, chat.participants[x]._id, "new.message.received", sender, chat._id);
                
                // create and send a push notification
                var messageObj = createPayload("Stylefnf", createPushNotifMsg(sender, chat), sender.profilePictures[0], false, "chat", chat._id); 
                sendGCM(chat.participants[x].deviceToken, messageObj);
              }

              // console.log(participants[x].socketID);
                // socketio.to(chat.participants[x].socketID).emit('message.sent', message);
                sendToUser(req, chat.participants[x]._id, "message.sent", message);
            }
            return res.send('done');
          });
        });

      }

      // If you don't find a chat
      // this is usually when one person sends a message to someone else new
      // create a new chat
      // and push the message in
      else {

        // console.log('new chat to be created');

        // create a new chat object
        var chat = new Chat({ participants: chatParticipants });
        
        chat.participants = chatParticipants;
        // console.log(chat);

        // save the chat object
        chat.save(function(err, chat) {
          if (err) { res.send(err); }

          // console.log(chat);

          // find the participants of the chat
          User.find({
            _id: { $in: chat.participants }
          }, function(err, participants) {

            // console.log(participants)

            // push the chat id into the participants' chat field
            for (x in participants) {
              // console.log(participants[x]);
              participants[x].chats.push(chat);
              participants[x].save(function (err) {
                if (err) {res.send(err)};
              });
            }
          });

          // create the message object
          // console.log(req.body.receiver);
          var message = new Message(
              { sender: req.body.sender, receiver: req.body.receiver, chat: chat._id, content: req.body.content }
          );
          // console.log(message);

          // save the message object
          message.save(function(err, message){
            if (err) { return res.send(err); }

            // push the message object to the chat thread
            chat.messages.push(message);

            // update the chat lastUpdated var
            chat.lastUpdated = moment();

            // save the last message
            chat.lastMessage = req.body.content;

            // update that the chat has a new message
            chat.hasUnseenMessages = true;

            // save the sentUser
            chat.lastSentUser = req.body.sender;

            // save the chat thread
            chat.save(function(err, chat) {
              if (err) { return res.send(err); }


              // find the participants of the chat
              User.find({
                _id: { $in: chat.participants }
              }, function(err, participants) {

                // console.log(participants)

                var socketio = req.app.get('socketio');




                // 
                for (x in participants) {

                  if (participants[x]._id != req.body.sender) {

                    var sender = getOther(participants, participants[x]._id);

                    console.log('sent message to' + participants[x].firstName);
                    // send a notification to the receiver
                    // socketio.to(participants[x].socketID).emit('new.message.received', sender, chat._id);
                    sendToUser(req, participants[x]._id, "new.message.received", sender, chat._id);

                    // create and send a push notification
                    var messageObj = createPayload("Stylefnf", createPushNotifMsg(sender, chat), sender.profilePictures[0], false,  "chat", chat._id); 
                    sendGCM(participants[x].deviceToken, messageObj);
                  }

                  // console.log(participants[x]);

                  // populate the chat
                  User
                  .findOne(
                    { _id: participants[x]._id }
                  )
                  .populate('chats')
                  .exec(function (err, user) {

                    // need to sort the chats

                    User.populate(user.chats, {
                      path:'participants',
                      select: 'firstName lastName profilePictures'
                    }, function(err, results) {

                        var chatResults = results.toObject();
                        chatResults.sort(function(m1, m2) { return m2.lastUpdated - m1.lastUpdated; });

                        // socketio.to(user.socketID).emit('new.chat.sent', chatResults, chat);
                        sendToUser(req, user._id, "new.chat.sent", chatResults, chat);
                    });

                  });
                }
                // res.send('done');
                return res.send('done');
              });

            });
          });

        });
      }

    });
  }

});

function createPushNotifMsg(profile, chat) {
  return profile.firstName + ": " + chat.lastMessage;
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