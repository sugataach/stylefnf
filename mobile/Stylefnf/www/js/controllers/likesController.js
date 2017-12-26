angular.module('Stylefnf')
.controller('likesController', function($scope,$state, $stateParams, Post, $state, $rootScope, $window) {

	$scope.loadLikes = function(){
		Post.getPost($stateParams.listingId)
			.success(function(data){
				$scope.likes = data.likes;
				console.log($scope.likes);
				$scope.$broadcast('scroll.refreshComplete');
			});
	}

	$scope.goToLike = function(profile){
		$state.go('tab.profile-detail', {profileId: profile.user._id});
	}

	$scope.goBack = function (){
    window.history.back();
	}

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
	
})
