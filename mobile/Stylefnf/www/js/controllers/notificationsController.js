angular.module('Stylefnf')
.controller('notificationsController', function(
	$scope,
	$rootScope,
	$window,
	Profile,
	$state,
  $auth,
  $interval,
  Socket,
	currentUser,
	Profile) {

  $scope.$on("$ionicView.beforeEnter", function(event, data){
     // handle event
     $scope.loadNotifs();
  });

  // UPDATE THE NOTIFICATIONS
  Socket.on('update.notifs', function(notifications, unseenNotifications) {
    console.log('received notifications');
    $scope.notifs = notifications;
  });

  var user = JSON.parse($window.localStorage.currentUser);
  $scope.goToAvatar = false; 


	$scope.removeUnseen = function(){
    // $rootScope.unseenNotifications = [];

		// Profile.removeUnseenNotifications(user._id).success(function(data) {
		// 	// console.log($rootScope.currentUser.unseenNotifications);
		// });
	};

  //console.log($scope);

  $scope.isUnseenNotif = function(notif) {
    if (notif.seen.length > 0) {
      return false;
    }
    return true;
  };

  $scope.seenNotif = function(notif) {
    // console.log('notif', notif);
    if (notif.seen.length == 0) {
      console.log('updating');
      // update the unseen notification to seen
      Profile.seenNotif({'notifID': notif._id, 'user': $rootScope.currentUser._id});
      // update the unseen notification on the client
      // notif.seen.push($rootScope.currentUser._id);
    }
  };

  $scope.loadNotifs = function() {
    $scope.removeUnseen();
    var myNotificationsPromise = Profile.getNotifications(user._id);
    myNotificationsPromise.then(function(result) {
      // this is only run after getData() resolves
      $scope.notifs = result['notifications'];
      // $rootScope.unseenNotifications = result['unseenNotifications'];
      // console.log(currentUser.getNotifications());
    });
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.goTo = function(route, id) {

    // console.log($scope.goToAvatar);
    $scope.seenNotif(id);

    if (route == "listing") {
      // go to the given listing
      // $location.path('#/tab/detail/' + id);
      $state.go('tab.listing-detail', {listingId: id});
      // $state.transitionTo('tab/chats/' + id);
    }

    if (route == "profile") {
      if (id == $rootScope.currentUser._id) {
        $state.go('tab.account');
      }
      else {
        $state.go('tab.profile-detail', {profileId: id});
      }
    }

    if (route == "comments") {
      // console.log("hi");
      $state.go('tab.comments', {listingId: id});
    }

    if (route == "notification") {

      if ($scope.goToAvatar || id.notifModel == "User") $state.go('tab.profile-detail', {profileId: id.sender._id});
      else $state.go('tab.listing-detail', {listingId: id.post._id});
    }
  };

  $scope.setAvatar = function() {
    $scope.goToAvatar = true;
  };

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    $rootScope.unseenNotifications = [];
  });

  // $scope.notifs = currentUser.getNotifications();
  // console.log($scope.notifs);
  // console.log(currentUser.getNotifications());
	$scope.getProfileAvatar = function(person) {
    if(person){ 
      if (typeof person.mobileProfileAvatars !== "undefined") {
        if (person.mobileProfileAvatars.length > 0) {
          return person.mobileProfileAvatars[0];
        } else {
          return person.profilePictures[0];
        }
      } else {
          return person.profilePictures[0];
      }
    }
  }

	$scope.getMobileAvatar = function(post) {
		if(post){
      if (typeof post.mobileImageUrlsAvatar !== "undefined") {
        if (post.mobileImageUrlsAvatar.length > 0) {
          return post.mobileImageUrlsAvatar[0];
        } else {
          return post.imageUrls[0];
        }
      } else {
          return post.imageUrls[0];
      }
    }
  }

});
