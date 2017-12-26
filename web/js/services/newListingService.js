'use strict';

angular.module('Haberdashery')

  // super simple postService
  // each function returns a promise object

  .factory('NewListing', function($q, $http, $auth, $rootScope, serverURL) { 

    var macro = "";

    var NewListing = {
      
      saveMacro : function(data) {
        macro = data;
      },

      getMacro : function() {
        return macro;
      }

    };

    return NewListing;
  });