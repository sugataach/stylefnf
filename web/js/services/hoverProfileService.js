'use strict';

angular.module('Haberdashery')

  // super simple postService
  // each function returns a promise object

  .factory('HoverProfile', function($q, $http, $auth, $rootScope, serverURL) { 

    var profile = "";

    var HoverProfile = {

      saveProfile : function(data) {
        profile = data;
      },

      getProfile : function() {
        return profile;
      },

      clear : function() {
        profile = "";
      }

    };

    return HoverProfile;
  });