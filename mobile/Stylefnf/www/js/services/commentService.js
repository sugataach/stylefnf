'use strict';

angular.module('Stylefnf')

  .factory('Comment', function($http, $auth, $rootScope, serverURL) {

    var config = {
        headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/plain'
        }
    };

    // var serverURL = 'http://45.55.156.158:3000';

    var Comment = {

      addComment: function(postId, comment) {
        // console.log(comment);
        return $http.post(serverURL + '/api/post/' + postId + '/comments', comment);
      },

      updateComment: function(commentId, comment) {
        // console.log('made it to updateComment');
        // console.log(comment);
        return $http.put(serverURL + '/api/post/' + commentId + '/comments', comment);
      },

      removeComment: function(commentId) {
        var commentStatus = {status: false};
        return $http.put(serverURL + '/api/post/' + commentId + '/remove', commentStatus);
      }
    };

    return Comment;
});
