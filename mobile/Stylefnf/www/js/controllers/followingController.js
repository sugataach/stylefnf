angular.module('Stylefnf')
.controller('followingController', function($scope, Profile, $state, $rootScope, $window, currentUser, $stateParams) {

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
        $scope.following = data.following;
        //console.log($scope.following);
      });
     $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.goToFollowing = function(id){
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
