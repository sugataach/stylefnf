'use strict';

angular.module('Haberdashery')

  .factory('Offer', function($http, $auth, $rootScope, $window, Post, serverURL) {

    // var serverURL = 'http://45.55.156.158:3000';

    var Offer = {

      makeOffer: function(postId, offer) {
          // console.log(offer);
          return $http.post(serverURL + '/api/post/' + postId + '/offers', offer);
      },

      hasOffered: function(postData) {
        if($rootScope.currentUser) {
          // console.log($rootScope.currentUser._id);
          // console.log(postData.offers[0].poster);
          for (var i = 0; i < postData.offers.length; i++) {
            // iterate through the array and check if the current user is in the poster field for any of the offers made previously
            var currentOffer = postData.offers[i];
            // console.log(currentOffer.poster);
            if (currentOffer.poster._id == $rootScope.currentUser._id) {
              return true;
            }
          }
          return false;
        }
      },

      isMaker: function(offerData) {
        // console.log(offerData.poster);
        // console.log($rootScope.currentUser);
        // console.log($rootScope.currentUser._id === offerData.poster);
        return ($rootScope.currentUser && $rootScope.currentUser._id === offerData.poster._id);
      },

      getOffer: function(postId, offerId) {
        return $http.get(serverURL + '/api/post/' + postId + '/offer/' + offerId);
      },

      cancelOffer: function(postId, offerId) {
        // return $http.delete(serverURL + '/api/post/' + postId + '/offers/' + offerId);

        var o = this.getOffer(postId, offerId);
        var offerData = {
          offerData: {status: 'cancelled'}, 
          userData: $rootScope.currentUser._id
        };
        // console.log(offerData);
        return $http.put(serverURL + '/api/post/' + postId + '/offer/' + offerId, offerData);
      },

      removeHold: function(postId, offerId) {
        // return $http.delete(serverURL + '/api/post/' + postId + '/offers/' + offerId);

        var o = this.getOffer(postId, offerId);
        var offerData = {status: 'cancelled'};
        // console.log(offerData);
        return $http.put(serverURL + '/api/post/' + postId + '/offer/' + offerId, offerData);
      },

      acceptOffer: function(postId, offerId, buyerId) {
        var a = this.getOffer(postId, offerId);
        var offerData = {accepted: true};
        return $http.put(serverURL + '/api/post/' + postId + '/accept/' + offerId, offerData).then(function() {

          var p = Post.getPost(postId);
          var postData = {status: 'Held', buyer: buyerId};
          return $http.put(serverURL + '/api/post/' + postId + '/hold', postData);
        });
      },

      getServiceFee: function(price) {
        var offerData = {offerPrice: price};
        return $http.post(serverURL + '/api/post/getServiceFee', offerData);
      }

      // cancelHold: function(postId, offerId, buyerId) {
      //   var a = this.getOffer(postId, offerId);
      //   var offerData = {accepted: false};
      //   return $http.put(serverURL + '/api/post/' + postId + '/accept/' + offerId, offerData).then(function() {

      //     var p = Post.getPost(postId);
      //     var postData = {status: 'Available', buyer: ''};
      //     return $http.put(serverURL + '/api/post/' + postId + '/hold', postData);
      //   });
      // },

    };

    return Offer;
});