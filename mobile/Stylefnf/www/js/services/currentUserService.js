angular.module('Stylefnf')

.factory('currentUser', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var currentUser = {};

  return {
    // set the current user to the token
    setCurrentUser: function(currentUserData) {
      currentUser = currentUserData;
    },

    setDeviceToken: function(deviceToken) {
      currentUser["deviceToken"] = deviceToken;
    },

    getDeviceToken: function() {
      return currentUser["deviceToken"];
    },

    setPushObj: function(pushObj) {
      // save to the in-memory currentUser obj
      currentUser["pushObj"] = pushObj;
      // save to localStorage
      window.localStorage['pushObj'] = angular.toJson(pushObj);
    },

    getPushObj: function() {
      if (currentUser["pushObj"] == undefined) {
        var pushObj = window.localStorage['pushObj'];
        if(pushObj) {
          return angular.fromJson(pushObj);
        }
      }
      return currentUser["pushObj"];
    },

    // delete the current user
    removeCurrentUser: function(chat) {
      currentUser = {};
    },
    getCurrentUser: function() {
      return currentUser;
    },
    setNotifications: function(notificationsData) {
      console.log(notificationsData);
      currentUser.notifications = notificationsData;
    },
    setUnseenNotifications: function(unseenNotificationsData) {
      // currentUser.no
    },
    // get Notifications
    getNotifications: function() {
      // console.log(currentUser);
      // for (var i in currentUser.notifications) {
      //   console.log(currentUser.notifications[i]);
      // }
      return currentUser.notifications;
    },
    getChats: function() {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    },
  };
});