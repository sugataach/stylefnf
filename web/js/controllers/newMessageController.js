// Dialog Box Function
(function () {
  'use strict';
  angular
      .module('Haberdashery')
      .controller('CustomNewMsgCtrl', newMessageController)

  function newMessageController (
              $scope, 
              $window,
              $mdSidenav,
              $mdUtil,
              $log,
              $rootScope, 
              $routeParams, 
              $location, 
              toaster, 
              Post, 
              $auth, 
              $route,
              $timeout, 
              Socket, 
              Comment, 
              Offer,
              Chat,
              Profile,
              $animate,
              $mdDialog,
              $q,
              s3serverURL,
              $mdToast,
              $http) {
    

    var ctrl = this;

    ctrl.sendMessageProfile = $rootScope.sendMessageProfile;

    if ($rootScope.meetUpMsg == true) {
      $scope.msgContent = "Hey " + ctrl.sendMessageProfile.firstName + " when are you free to meet up?";  
    }

    $scope.sendMessage = function() {
      var myNewMessage = {
        participants: [ctrl.sendMessageProfile._id, $rootScope.currentUser._id],
        content: $scope.msgContent,
        sender: $rootScope.currentUser._id,
        receiver: ctrl.sendMessageProfile._id
      };

      Chat.sendMessage(myNewMessage);
      $rootScope.meetUpMsg = false;
      $scope.cancel();
      $location.path('/messages/');

    };
  }
})();