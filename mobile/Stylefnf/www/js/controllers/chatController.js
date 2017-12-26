angular.module('Stylefnf')
.controller('chatController', function($scope, $rootScope, Chat, $window, $state, currentUser, Socket) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

//$scope.chats = [];

  //console.log(currentUser.getCurrentUser());

  if(!$rootScope.currentUser){
    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
  }

  Socket.on('message.sent', function(updatedChatThreads, updatedChat) {
    $scope.loadChats();
  });


  $scope.isUnseenChat = function(chat) {
    if (chat.hasUnseenMessages && chat.lastSentUser != $rootScope.currentUser._id) {
      return true;
    }
    return false;
  };

  // load the chats for the current user
  $scope.loadChats = function() {

    // call chat API
    Chat.getChats($rootScope.currentUser._id)
      .success(function(data) {

        $scope.chatThreads = data;

        $scope.$broadcast('scroll.refreshComplete');

      }).catch(function(response) {

        //console.log("hi");
    });


  };

  $scope.getParticipantPic = function(participants) {
    for (i in participants) {
      if (participants[i]._id != $rootScope.currentUser._id) {
        if (typeof participants[i].mobileProfileAvatars !== "undefined") {
          if (participants[i].mobileProfileAvatars.length > 0) {
            return participants[i].mobileProfileAvatars[0];
          } else {
            return participants[i].profilePictures[0];
          }
        } else {
            return participants[i].profilePictures[0];
        }
      }
    }
  };

  $scope.getParticipantName = function(participants) {
    for (i in participants) {
      if (participants[i]._id != $rootScope.currentUser._id) {
        return participants[i].firstName + " " + participants[i].lastName;
      }
    }
  };

  $scope.goToChat = function(chat){
    $rootScope.currChatName = $scope.getParticipantName(chat.participants);
    chat.hasUnseenMessages = false;
    $state.go('tab.chat-detail', {chatId: chat._id});
  }

  $scope.getDate = function(date) {
		var result = date.slice(0, 10);
		return result;
	}

});
