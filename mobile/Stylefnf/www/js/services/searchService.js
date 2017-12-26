'use strict';

angular.module('Stylefnf')

  // super simple postService
  // each function returns a promise object

  .factory('Search', function($q, $http, $auth, $rootScope, serverURL) {

    var Search = {

      getAll : function(query, seenids) {
        seenids = typeof seenids !== 'undefined' ?  seenids : null;

        // console.log(query);

        if (query.indexOf("sort") == -1) {
          query = query + "&sort=newest"
        }
        //console.log(query);

        if (seenids) {
          //console.log('seenids: ' + seenids.length);
          // console.log('execute load more search');
          // console.log(query);
          var searchData = {'seenids': seenids, 'query': query};

          // this is where safari trips up
          // setting any headers makes safari throw an exception
          return $http.post(serverURL + '/search/' + query, searchData);
          // return $http.get(serverURL + '/search/' + query);
        }
        else {
          var searchData = {'query': query};
          // console.log(query);
          // console.log('execute page load search');
          return $http.post(serverURL + '/search/' + query, searchData);
        }
      },

      getRecommended: function() {
        var query = "sort=popular";
        return $http.get(serverURL + '/search/' + query);
      },

      getAllUsers: function(query) {
        return $http.get(serverURL + '/search/users/' + query);
      },

      getFeaturedPosts: function() {
        return $http.get(serverURL + '/search/featured/posts');
      },

      getFeaturedUsers: function() {
        // console.log('featured users call');
        return $http.get(serverURL + '/search/featured/users');
      },

      getFashionPosts: function() {
        return $http.get(serverURL + '/search/macro=fashion&sort=newest');
      },

      getHomeFurniturePosts: function() {
        return $http.get(serverURL + '/search/macro=homeFurniture&sort=newest');
      },

      getElectronicsPosts: function() {
        return $http.get(serverURL + '/search/macro=electronics&sort=newest');
      },

      getTextbooksPosts: function() {
        return $http.get(serverURL + '/search/macro=textbooks&sort=newest');
      },

      getOtherPosts: function() {
        return $http.get(serverURL + '/search/macro=other&sort=newest');
      }
    };

    return Search;
  });