'use strict';

angular.module('Stylefnf')

  .factory('Like', function($http, $auth, $rootScope, $window, serverURL) {

    var Like = {

      // sends a like action to the server with the current user, add new like, or remove old like
      likeAction: function(postId) {
        // console.log($rootScope.currentUser._id);
        var likeData = {user: $rootScope.currentUser._id}; 
        return $http.post(serverURL + '/api/post/' + postId + '/like', likeData);
      },

      hasLiked: function(likes) {
        if($rootScope.currentUser) {
          // console.log($rootScope.currentUser._id);
          // console.log(postData.offers[0].poster);
          for (var i = 0; i < likes.length; i++) {
            // iterate through the array and check if the current user is in the poster field for any of the offers made previously
            // var currentUser = likes[i].user;
            // console.log(likes);
            var currentUser = likes[i].user;
            // console.log(currentUser);
            if (currentUser._id) {
              currentUser = currentUser._id;
            }
            // console.log(currentUser);
            // console.log(currentOffer.poster);
            if (currentUser.indexOf($rootScope.currentUser._id) > -1) {
              return true;
            }
          }
          return false;
        }
      },
      hasDetailLiked: function(likes) {
        if($rootScope.currentUser) {
          // console.log($rootScope.currentUser._id);
          // console.log(postData.offers[0].poster);
          for (var i = 0; i < likes.length; i++) {
            // iterate through the array and check if the current user is in the poster field for any of the offers made previously
            var currentUser = likes[i].user;
            // console.log(currentUser);
            currentUser = currentUser._id;
            // console.log(currentUser);
            // console.log(currentOffer.poster);
            if (currentUser.indexOf($rootScope.currentUser._id) > -1) {
              return true;
            }
          }
          return false;
        }
      },

    };

    return Like;
});