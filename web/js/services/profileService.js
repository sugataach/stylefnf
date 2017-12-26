'use strict';

angular.module('Haberdashery')

  .factory('Profile', function($http, $auth, $rootScope, $window, Post, serverURL, $routeParams) {

    // var serverURL = 'http://45.55.156.158:3000';

    var Profile = {

      getUserProfile: function(profileId) {
        return $http.get(serverURL + '/auth/profile/' + profileId);
      },

      sendSocketID: function(socketID) {
        var socketData = {userSocketID: socketID};
        // console.log(socketID);
        return $http.post(serverURL + '/auth/profile/' + $rootScope.currentUser._id + '/socket', socketData);
      },

      removeUnseenNotifications: function() {
        return $http.post(serverURL + '/auth/profile/' + $rootScope.currentUser._id + '/removeUnseenNotifs');
      },

      getNotifications: function() {
        $http.get(serverURL + '/auth/profile/' + $rootScope.currentUser._id + '/getNotifs')
        .then(function(response) {
          // console.log(response);
          $rootScope.currentUser.notifications = response.data['notifications'];
          $rootScope.currentUser.unseenNotifications = response.data['unseenNotifications'];
        });
      },

      seenNotif: function(notifData) {
        // console.log(notifData);
        $http.post(serverURL + '/auth/profile/' + $rootScope.currentUser._id + '/seenNotif', notifData)
        .then(function(response) {
          // console.log(response);
        });
      },

      verifyUser: function() {
        // console.log(verifyData);
        return $http.post(serverURL + '/auth/verify/' + $routeParams.token);
      },

      getTeam: function() {
        return $http.get(serverURL + '/auth/team/');
      },

      getWhitelist: function() {
        return $http.get(serverURL + '/auth/getWhitelist');
      },

      updateProfilePic: function(picURL) {
        // console.log(postData);
        var profilePicURL = {profilePic: picURL};
        return $http.put(serverURL + '/auth/profile/' + $rootScope.currentUser._id, profilePicURL);
      },

      updateProfile: function(data) {
        // console.log(postData);
        var profileData = data;
        return $http.put(serverURL + '/auth/profile/' + $rootScope.currentUser._id, profileData);
      },

      followAction: function(profileID) {
        // console.log(postData);
        var profile = {followingUser: profileID};
        return $http.post(serverURL + '/auth/profile/' + $rootScope.currentUser._id + '/follow', profile);
      },

      hasFollowed: function(profile) {

        if (!$rootScope.currentUser) {
          return false;
        }

        if (!profile) {
          return false;
        }

        // console.log('/**************************************hasFollowed****************');
        // console.log(profile._id);
        // console.log($rootScope.currentUserFollowing);

        var i = $rootScope.currentUserFollowing.indexOf(profile._id);

        if (i != -1) { 
          return true;
        }
        return false;
      },

      getFollowing: function(profileID) {
        return $http.get(serverURL + '/auth/profile/' + profileID + '/getFollowing');
      },

      forgotPassword: function(email) {
        var forgotPasswordEmail = {email: email};
        return $http.post(serverURL + '/auth/forgotPassword', forgotPasswordEmail);
      }


      // checkEmail: function(email) {
      //   var jsonEmail = {toCheck: email};

      //   return $http.post(serverURL + '/auth/emailCheck', jsonEmail);
      // }

    };

    return Profile;
});