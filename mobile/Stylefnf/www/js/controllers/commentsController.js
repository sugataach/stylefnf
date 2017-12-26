angular.module('Stylefnf')
.controller('commentsController', function($scope, Post, $state, $stateParams, $rootScope, $window, currentUser, Comment, $ionicPopup, $http, IonicClosePopupService) {

	$scope.selectedComment = false;

	if($scope.currentUser == undefined){
    $rootScope.currentUser = currentUser.getCurrentUser();
  }

	$scope.loadComments = function(){
		Post.getPost($stateParams.listingId)
	      .success(function(data) {

	        //$scope.selectedPost = data;
			$scope.comments = data.comments;
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	$scope.getParticipantPic = function (commentObj){
		if (typeof commentObj.poster.mobileProfileAvatars !== "undefined") {
      if (commentObj.poster.mobileProfileAvatars.length > 0) {
        return commentObj.poster.mobileProfileAvatars[0];
      } else {
        return commentObj.poster.profilePictures[0];
      }
    } else {
        return commentObj.poster.profilePictures[0];
    }
   }

  $scope.getComment = function (commentObj){
  	return commentObj.content[0];
  }

  $scope.getParticipantName = function (commentObj){

  	return commentObj.poster.firstName;
  }

  //$scope.comments = $scope.selectedPost.comments;

  $scope.addComment = function(commentInput) {
    // var text = $scope.content.replace(/\n\r?/g, '<br />');
    // console.log($scope.content);

    //var currUser = currentUser.getCurrentUser();

    var comment = {
      content: commentInput,
      name: $rootScope.currentUser.firstName + $rootScope.currentUser.lastName,
      picture: $rootScope.currentUser.profilePictures[0],
      post: $stateParams.listingId,
      poster: $rootScope.currentUser._id,
    };

    var fakeComment = {
    	content: commentInput,
    	poster: $rootScope.currentUser,
    	created: new Date()
    }

    $scope.comments.push(fakeComment);

    Comment.addComment($stateParams.listingId, comment).then(
      function() {
        $scope.input.message = '';
			$scope.loadComments();
    });
  };

  $scope.selectComment = function(comment){

  	if($rootScope.currentUser._id == comment.poster._id){
		  $scope.editing = comment;
		  $scope.editPopup = $ionicPopup.show({
	      cssClass: 'upload-pic-popup',
	      templateUrl: 'edit-comment.html',
	      scope: $scope,
	    });
	    IonicClosePopupService.register($scope.editPopup);
	  } else {
	  	$scope.selectedComment = false;
	  }
  }

  $scope.deleteComment = function(){

      	Comment.removeComment($scope.editing._id);
     		var index = $scope.comments.indexOf($scope.editing);
    		if (index > -1) {
    			$scope.comments.splice(index, 1);
				}
          $scope.editPopup.close();
  }

  $scope.goBack = function(){
  	window.history.back()
  }

	$scope.getDate = function(date) {

		var toAvoidError = date + "";
		return toAvoidError.slice(0, 10);
	}

})
