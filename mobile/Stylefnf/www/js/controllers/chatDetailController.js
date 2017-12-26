angular.module('Stylefnf')
.controller('chatDetailController', function($scope, $stateParams, Profile, $ionicTabsDelegate, Chat, $window, currentUser, $ionicScrollDelegate, $timeout, $rootScope, Socket, $rootScope) {


  var receiverID = "";

  var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
  $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
  var user = JSON.parse($window.localStorage.currentUser);

  Socket.on('message.sent', function(updatedChatThreads, updatedChat) {
    if ($scope.currChatID === updatedChat._id) {
      $rootScope.currChatName = $scope.getOther(updatedChat.participants, 'firstName', 'lastName');
      Chat.getMessages(updatedChat._id)
        .success(function(msgs) {
          $scope.messageThread = msgs;
          viewScroll.scrollBottom(true);
        });
    }
  });

  Socket.on('message.seen', function(timestamp) {
    // console.log('received seen');
    // on message seen, update the message seen scope
    $scope.seenTimestamp = timestamp;
  });

  $scope.getOther = function(users, term1, term2) {
    for (var x in users) {
      if (users[x]['_id'] != $rootScope.currentUser['_id']) {
        // console.log(users[x][term]);
        return users[x][term1] + " " + users[x][term2];
      }
    }
  };

  Chat.getMessages($stateParams.chatId)
    .success(function(msgs) {
      $scope.currChatID = $stateParams.chatId;
      $scope.messageThread = msgs;
      viewScroll.scrollBottom(true);
    });

  $scope.getUserId = function(msg){
    return $rootScope.currentUser._id;
  }

  $scope.getParticipantId = function(msg){
    receiverID = msg.sender._id;
    return msg.sender._id;
  }

  $scope.getParticipantPic = function(msg) {
      if (typeof msg.sender.mobileProfileAvatars !== "undefined") {
        if (msg.sender.mobileProfileAvatars.length > 0) {
          return msg.sender.mobileProfileAvatars[0];
        } else {
          return msg.sender.profilePictures[0];
        }
      } else {
          return msg.sender.profilePictures[0];
      }
  }

  $scope.getParticipantName = function(msg) {
    //console.log(msg);
    return msg.sender.firstName + " " + msg.sender.lastName;
  }

  $scope.sendMessage = function(inputMessage){

    //If chat exists
    if($stateParams.chatId != ""){
      var sendMsgToChatAPI = {
        chat: $stateParams.chatId,
        sender: $rootScope.currentUser._id,
        receiver: receiverID,
        content: inputMessage
      };

      Chat.sendMessage(sendMsgToChatAPI).then(
        function() {
          $scope.input.message = '';
      });


      viewScroll.scrollBottom(true);

    } else {

      //create new chat if it didnt exist before

      $scope.messageThread = [];

      var myNewMessage = {
        participants: [$rootScope.newChat._id, currentUser.getCurrentUser()._id],
        content: inputMessage,
        sender: $rootScope.currentUser._id,
        receiver: $rootScope.newChat._id,
      };

      Chat.sendMessage(myNewMessage).then(
        function() {
          $scope.input.message = '';
      });
    }

    var fakeMsg = {
      sender: $rootScope.currentUser,
      content: inputMessage,
      created: new Date()
    }

    $scope.messageThread.push(fakeMsg);
  };

  $scope.goBack = function(){
    $ionicTabsDelegate.showBar(true);
    window.history.back();
  }

  $ionicTabsDelegate.showBar(false);

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    $ionicTabsDelegate.showBar(true);
  });

})
