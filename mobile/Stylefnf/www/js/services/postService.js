'use strict';

angular.module('Stylefnf')

  // super simple postService
  // each function returns a promise object

  .factory('Post', function($q, $http, $auth, $rootScope, serverURL) {

    // var serverURL = 'http://45.55.156.158:3000';

    var deferred = $q.defer(); 

    var Post = {
      
      getAll : function() {
        return $http.get(serverURL + '/api/posts');
      },

      getDeferredPost : function(postId) {
        $http.get(serverURL + '/api/post/' + postId)
        .success(function(data){
          // console.log(data);
          deferred.resolve(data);
        })
        .error(function(err){
          // console.log(err);
          deferred.reject(err);
        })

        return deferred.promise;
      },

      setEditablePost : function(data) {
          this.editablePost = data;
          // console.log('in the service, Ive set the editable post');
          // console.log(this.editablePost);
      },

      getEditablePost : function() {
        return this.editablePost;
      },

      getPost: function(postId) {
        // console.log('fetch detail');
        return $http.get(serverURL + '/api/post/' + postId);
      },
      
      createPost : function(postData) {
        // console.log('this is what is being sent to the server');
        // console.log(postData);
        postData.datetime = moment().unix();
        // console.log(postData);
        return $http.post(serverURL + '/api/posts', postData);
      },

      updatePost: function(postId, postData) {
        // console.log(postData);
        return $http.put(serverURL + '/api/post/' + postId, postData);
      },

      cancelPost: function(postId) {
        var p = this.getPost(postId);
        // console.log(postId);
        var postData = {status: 'cancelled'};
        return $http.put(serverURL + '/api/post/' + postId, postData);
      },

      soldPost: function(postId) {
        var p = this.getPost(postId);
        // console.log(postId);
        var postData = {status: 'Sold'};
        return $http.put(serverURL + '/api/post/' + postId, postData);
      },

      reactivatePost: function(postId) {
        var p = this.getPost(postId);
        // console.log(postId);
        var postData = {status: 'Available'};
        return $http.put(serverURL + '/api/post/' + postId, postData);
      },

      isSold: function(postData){
        return (postData.status === 'Sold');
      },

      isCreator: function(postData) {
        if ($rootScope.currentUser) {
          return ($rootScope.currentUser && $rootScope.currentUser._id === postData.seller_id);
        }
        return false;
      },

      isAvailable: function(postData) {
        // console.log(postData);
        return (postData.status === 'Available');
      },

      completeTransaction: function(postId) {
        var p = this.getPost(postId);
        var postData = {status: 'purchased'};
        return $http.put(serverURL + '/api/post/' + postId + '/purchase', postData);
      },

      isBuyer: function(postData) {
        return ($rootScope.currentUser && $rootScope.currentUser._id === postData.buyer);
      },

      // isHolder: function(postData) {
      //   return ($)
      // }

      isPurchased: function(postData) {
        return postData.status === "purchased";
      },

      payCreditCard : function(paymentData) {
        return $http.post(serverURL + '/api/post/' + postId + '/purchase', paymentData);
      }



    };

    return Post;
  });