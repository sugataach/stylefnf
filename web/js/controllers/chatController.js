'use strict';

angular.module('Haberdashery')
  .controller('chatController', function($scope, $location, $auth, $window, $cookies, toaster, $rootScope, Socket, $animate, $mdDialog, $mdToast, $route, Chat, $log) {

    $scope.isAuthenticated = function() {
      return ($auth.isAuthenticated() && $rootScope.currentUser.isComplete);
    };

    $scope.isChatPage = function() {
      // the string of the location URL contains the word browse
      return ($location.path().indexOf('/messages') > -1); 
    };

    // when a new message gets sent
    Socket.on('message.sent', function(updatedChatThreads, updatedChat) {
      // console.log('updatedChatThreads', updatedChatThreads);

      if ($scope.isChatPage()) {
        // update the chatThreads list
        $scope.chatThreads = updatedChatThreads;

        // get the chats of the current user
        var promise = Chat.getChats($rootScope.currentUser._id);
        promise.then( 
          function(payload) { 
            $scope.chatThreads = payload.data;
            
            // if the current chat is the one that got updated
            if ($scope.currChat._id == updatedChat._id) {

              $scope.currChat = updatedChat;

              // console.log('on currchat');

              // remove notification
              if ($rootScope.new_msg_chats) {
                var exists_index = $scope.checkForChat($scope.currChat);
                if(exists_index != -1) {
                //if ($rootScope.new_msg_chats.indexOf($scope.currChat._id) >= 0) {
                  $rootScope.new_msg_chats.splice(exists_index, 1);
                  // $rootScope.new_msg_chats.splice($rootScope.new_msg_chats.indexOf($scope.currChat._id), 1);

                  Chat.sendSeenTimestamp($scope.currChat._id).then(
                    function(data) {
                      console.log(data);
                  });

                  if ($rootScope.new_msg_chats.length == 0) {
                    $rootScope.new_msg_chats = undefined;
                  }
                }
              }


              var promise2 = Chat.getMessages($scope.currChat._id);
              promise2.then(
                function(payload) { 
                  // update the message thread
                  $scope.messageThread = payload.data;

                  // console.log('got new msgs');

                  // update if the chat thread has unseen messages
                  // and the current user is the last receiver

                  // console.log($scope.currChat.hasUnseenMessages);
                  // console.log($scope.messageThread[$scope.messageThread.length-1].sender._id != $rootScope.currentUser._id);

                  if (($scope.currChat.hasUnseenMessages == true) && ($scope.messageThread[$scope.messageThread.length-1].sender._id != $rootScope.currentUser._id)) {

                    // console.log('is it the right chat?' + $scope.currChat._id == updatedChat._id);
                    if ($scope.currChat._id == updatedChat._id) {
                      // update the messages on the server side
                      Chat.sendSeenTimestamp($scope.currChat._id).success(function(data) {
                        // console.log(data);
                        // $scope.chatThreads = data;
                        updateChatThreadSeenMessage($scope.currChat._id);
                      });
                      // console.log('send timestamp');
                    }
                  }
                  else {
                    $scope.seenTimestamp = $scope.messageThread[$scope.messageThread.length-1].seenTimestamp;
                  }
                },
                function(errorPayload) {
                  $log.error('failure loading movie', errorPayload);
                }
              );

            }
          },
          function(errorPayload) {
            $log.error('failure loading', errorPayload);
          }
        );
      }

    });

    Socket.on('message.seen', function(timestamp) {
      // console.log('received seen');
      // on message seen, update the message seen scope
      $scope.seenTimestamp = timestamp;
    });

    // reset the new messages counter
    $rootScope.new_msg_chats = undefined;

    // when a new chat gets sent
    Socket.on('new.chat.sent', function(updatedChatThreads, updatedChat) {

      Chat.getChats($rootScope.currentUser._id)
        .success(function(data) {
          $scope.chatThreads = data;
          // select the most recent chat thread
          // $scope.currChat = data[0];
          // change the url
          // $location.path('/messages/' + $scope.currChat._id, false);

        // if there's no current chat selected
        // select the most recent one that has been seen
        if ($scope.currChat === undefined) {
          for (var c in $scope.chatThreads) {
            if ($scope.chatThreads[c].hasUnseenMessages == false) {
              $scope.currChat = $scope.chatThreads[c];
              break;
            }
          }
          if ($scope.currChat === undefined) {
            $scope.currChat === data[0];
          }
        }

        // if the current chat is the one that got updated, update the message thread
        if ($scope.currChat._id == updatedChat._id) {

          $scope.currChat = updatedChat;

          Chat.getMessages($scope.currChat._id)
            .success(function(msgs) {
              // console.log(msgs)
              $scope.messageThread = msgs;

              // update if the chat thread has unseen messages
              // and the current user is the last receiver
              if (($scope.currChat.hasUnseenMessages == true) && ($scope.messageThread[$scope.messageThread.length-1].sender._id != $rootScope.currentUser._id)) {
                
                // update the messages on the server side
                Chat.sendSeenTimestamp($scope.currChat._id);
                // console.log('send timestamp');
              }
              else {
                $scope.seenTimestamp = $scope.messageThread[$scope.messageThread.length-1].seenTimestamp;
              }

          }); 
        }
      });

    });


    // get the chat threads for the current user on page load
    Chat.getChats($rootScope.currentUser._id)
      .success(function(data) {
        $scope.chatThreads = data;
        // console.log($scope.chatThreads);

        if ($scope.currChat === undefined) {
          for (var c in $scope.chatThreads) {
            // console.log($scope.chatThreads[c].hasUnseenMessages);
            if ($scope.chatThreads[c].lastSentUser == $rootScope.currentUser._id || $scope.chatThreads[c].hasUnseenMessages == false) {
              $scope.currChat = $scope.chatThreads[c];
              break;
            }
          }
          // console.log($scope.currChat);
          if ($scope.currChat === undefined) {
            $scope.currChat = data[0];
          }
        }

        if ($scope.currChat) {
          Chat.getMessages($scope.currChat._id)
            .success(function(msgs) {
              // console.log(msgs)
              $scope.messageThread = msgs;

              // update if the chat thread has unseen messages
              // and the current user is the last receiver
              if (($scope.currChat.hasUnseenMessages == true) && ($scope.messageThread[$scope.messageThread.length-1].sender._id != $rootScope.currentUser._id)) {
                
                // update the messages on the server side
                Chat.sendSeenTimestamp($scope.currChat._id);
                // console.log('send timestamp');

                // update the current chat threads
                Chat.getChats($rootScope.currentUser._id)
                  .success(function(data) {
                    $scope.chatThreads = data;
                    for (var c in $scope.chatThreads) {
                      if ($scope.chatThreads[c]._id == $scope.currChat._id) {
                        $scope.currChat = $scope.chatThreads[c];
                        break;
                      }
                    }
                  });
              }
              else {
                $scope.seenTimestamp = $scope.messageThread[$scope.messageThread.length-1].seenTimestamp;
              }

          }); 
        }
    });

    // get the messages in the latest chat thread

    $scope.getOther = function(users, term) {
      for (var x in users) {
        if (users[x]['_id'] != $rootScope.currentUser['_id']) {
          // console.log(users[x][term]);
          return users[x][term];
        }
      }
    };

    $scope.getOtherFullName = function(users) {
      for (var x in users) {
        if (users[x]['_id'] != $rootScope.currentUser['_id']) {
          // console.log(users[x][term]);
          var y = users[x].firstName + ' ' + users[x].lastName;
          return y;
        }
      }
    };

    $scope.getOtherPicture = function(users) {
      for (var x in users) {
        if (users[x]['_id'] != $rootScope.currentUser['_id']) {
          // console.log(users[x][term]);
          return users[x].profilePictures[0];
        }
      }
    };

    function updateChatThreadSeenMessage(chatID) {
      for (var i in $scope.chatThreads) {
        if (chatID == $scope.chatThreads[i]._id) {
          $scope.chatThreads[i].hasUnseenMessages = false;
        }
      }
    }


    $scope.checkForChat = function(chat) {

      for(var i = 0; i < $rootScope.new_msg_chats.length; i++) {
        if(chat._id == $rootScope.new_msg_chats[i]._id)
          return i;
      }
      return -1;
    };

    // on change the selected chat
    $scope.selectChat = function(chat) {
      $scope.currChat = chat;
      $scope.msgContent = '';
      updateChatThreadSeenMessage($scope.currChat._id);

      // remove notification
      if ($rootScope.new_msg_chats) {
        var exists_index = $scope.checkForChat($scope.currChat);
        if(exists_index != -1) {
        //if ($rootScope.new_msg_chats.indexOf($scope.currChat._id) >= 0) {
          $rootScope.new_msg_chats.splice(exists_index, 1);
          // $rootScope.new_msg_chats.splice($rootScope.new_msg_chats.indexOf($scope.currChat._id), 1);

          Chat.sendSeenTimestamp($scope.currChat._id).then(
            function(data) {
              console.log(data);
          });

          if ($rootScope.new_msg_chats.length == 0) {
            $rootScope.new_msg_chats = undefined;
          }
        }
      }

      // get the messages for the selected chat
      Chat.getMessages($scope.currChat._id)
        .success(function(msgs) {
          // console.log(msgs)
          $scope.messageThread = msgs;

          // update if the chat thread has unseen messages
          // and the current user is the last receiver
          if (($scope.currChat.hasUnseenMessages == true) && ($scope.messageThread[$scope.messageThread.length-1].sender._id != $rootScope.currentUser._id)) {

            // update the current chat threads
                // update the current chat threads
            Chat.sendSeenTimestamp($scope.currChat._id).success(function(data) {
                // console.log(data);
                // $scope.chatThreads = data;
                // $scope.currChat.seenTimestamp = Date.now();
                updateChatThreadSeenMessage($scope.currChat._id);
              });

          }
          else {
            $scope.seenTimestamp = $scope.messageThread[$scope.messageThread.length-1].seenTimestamp;
          }
      }); 
    };

    // send a message
    $scope.sendMessage = function() {
      var chatBuddy = $scope.getOther($scope.currChat.participants, '_id');

      if (!chatBuddy) {
        for (var c in $scope.currChat.participants) {
          if ($scope.currChat.participants[c] != $rootScope.currentUser._id) {
            chatBuddy = $scope.currChat.participants[c];
            break;
          } 
        }
      }

      $scope.seenTimestamp = undefined;

      // console.log($scope.msgContent);

      // send this JSON object to the message sending endpoint
      var sendMsgToChatAPI = {
        chat: $scope.currChat._id,
        sender: $rootScope.currentUser._id,
        receiver: chatBuddy,
        content: $scope.msgContent
      };

      var fakeMsg = {
        sender: $rootScope.currentUser,
        content: $scope.msgContent,
        created: new Date()
      }

      $scope.messageThread.push(fakeMsg);

      // console.log(sendMsgToChatAPI);

      Chat.sendMessage(sendMsgToChatAPI).then(
        function() {
          $scope.msgContent = '';
          angular.element('#chatField').focus();
      });
    };

});