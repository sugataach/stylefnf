'use strict';

angular.module('Haberdashery')

  // super simple postService
  // each function returns a promise object

  .factory('Search', function($q, $http, $auth, $rootScope, serverURL) {

    // var serverURL = 'http://45.55.156.158:3000';

    var Search = {
      
      // getAll : function(query, seenids) {
      //   seenids = typeof seenids !== 'undefined' ?  seenids : null;

      //   // console.log(query);

      //   if (query.indexOf("sort") == -1) {
      //     query = query + "&sort=newest"
      //   }
      //   console.log(query);

      //   if (seenids) {
      //     // console.log('seenids: ' + seenids.length);
      //     // console.log('execute load more search');
      //     // console.log(query);

      //     // this is where safari trips up
      //     // setting any headers makes safari throw an exception
      //     return $http.get(serverURL + '/search/' + query, {headers: {'seenids': seenids}});
      //     // return $http.get(serverURL + '/search/' + query);
      //   }
      //   // console.log(query);
      //   // console.log('execute page load search');
      //   return $http.get(serverURL + '/search/' + query);
      // },

      getAll : function(query, seenids) {
        seenids = typeof seenids !== 'undefined' ?  seenids : null;

        // console.log(query);

        if (query.indexOf("sort") == -1) {
          query = query + "&sort=newest"
        }
        console.log(query);

        if (seenids) {
          console.log('seenids: ' + seenids.length);
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

      userPhonebook: function() {
        return $http.post(serverURL + '/search/users');
      }


    };

    return Search;
  });