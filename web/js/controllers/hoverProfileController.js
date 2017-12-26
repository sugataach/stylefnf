// Dialog Box Function
(function () {
  'use strict';
  angular
      .module('Haberdashery')
      .controller('CustomHoverProfileCtrl', hoverProfileController)

  function hoverProfileController (
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
              Profile,
              $animate,
              $mdDialog,
              $q,
              s3serverURL,
              HoverProfile,
              $mdToast,
              $http) {


    $scope.isAuthenticated = function() {
      // console.log($auth.isAuthenticated());
      // console.log($rootScope.currentUser);
      return ($auth.isAuthenticated() && $rootScope.currentUser.isComplete);
    };
    

    var ctrl = this;
    
    ctrl.profile = $rootScope.hoverProfile;
    console.log(ctrl.profile);

    $scope.isOtherProfile = function() {
      if ($rootScope.currentUser && $rootScope.hoverProfile) {
        return $rootScope.hoverProfile._id != $rootScope.currentUser._id;
      }
      return false;
    }

    $scope.followAction = function() {

      if ($scope.isAuthenticated()) {
        Profile.followAction($rootScope.hoverProfile._id).success(function(result) {
          // console.log($scope.search_posts);
          console.log('new followers')
          console.log(result);
          $rootScope.currentUserFollowing = result;
        });
      }
    };

    $scope.isFollowing = function() {

      if ($rootScope.hoverProfile) {
        // console.log(likes);
        // console.log(likes);
        return Profile.hasFollowed($rootScope.hoverProfile);
      }
      return false;
    };

    $scope.goToSignup = function() {
      $location.path('/signup');
    }

  }
})();