'use strict';

angular.module('Stylefnf')

  .factory('Profile', function($http, $auth, $rootScope, $window, Post, serverURL, currentUser) {

    // var serverURL = 'http://45.55.156.158:3000';

    var Profile = {

      getUserProfile: function(profileId) {
        return $http.get(serverURL + '/auth/profile/' + profileId);
      },

      checkValidEmail: function(email) {
        var emailObj = {emailToCheck: email};
        return $http.post(serverURL + '/auth/emailCheck', emailObj);
      },

      sendSocketID: function(socketID) {
        var socketData = {userSocketID: socketID};
        // console.log(socketID);
        return $http.post(serverURL + '/auth/profile/' + $rootScope.currentUser._id + '/socket', socketData);
      },

      removeUnseenNotifications: function(userID) {
        return $http.post(serverURL + '/auth/profile/' + userID + '/removeUnseenNotifs');
      },

      getNotifications: function(userID) {
        return $http.get(serverURL + '/auth/profile/' + userID + '/getNotifs').then(function(result) {

            // What we return here is the data that will be accessible
            // to us after the promise resolves
            //console.log(result.data);
            return result.data;
        });
      },

      seenNotif: function(notifData) {
        // console.log(notifData);
        $http.post(serverURL + '/auth/profile/' + $rootScope.currentUser._id + '/seenNotif', notifData)
        .then(function(response) {
          // console.log(response);
        });
      },

      verifyUser: function(token) {
        // console.log(verifyData);
        console.log("token:", token);
        return $http.post(serverURL + '/auth/verify/' + token);
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

      updateDeviceToken: function(data, userID){
        var profileDeviceToken = {deviceToken: data};
        return $http.put(serverURL + '/auth/profile/' + userID, profileDeviceToken);
      },

      updatePlatform: function(data, userID){
        var profilePlatform = {phonePlatform: data};
        return $http.put(serverURL + '/auth/profile/' + userID, profilePlatform);
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
