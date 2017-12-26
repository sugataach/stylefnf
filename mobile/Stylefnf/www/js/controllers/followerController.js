angular.module('Stylefnf')
.controller('followerController', function($scope, Profile, $state, $rootScope, $window, $stateParams) {

	$rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

  var id = ""
  if($rootScope.currentUser._id != $stateParams.profileId){
    id = $stateParams.profileId;
  } else {
    id = $rootScope.currentUser._id;
  }

  // if($rootScope.currentUser == undefined){
  //   $rootScope.currentUser = currentUser.getCurrentUser();
  // }

	$scope.loadProfile = function() {
    Profile.getUserProfile(id)
      .success(function(data){
        $scope.followers = data.followers;
        //console.log($scope.followers);
      });
     $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.goToFollower = function(id){
  	$state.go('tab.profile-detail', {profileId: id});
  }
  $scope.goBack = function(){
    window.history.back();
  }

	$scope.getProfileAvatar = function(person) {
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
	
})
