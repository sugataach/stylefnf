'use strict';

angular.module('Haberdashery')

  .factory('Chat', function($http, $auth, $rootScope, serverURL) {

    // var serverURL = 'http://45.55.156.158:3000';

    var Chat = {

      getChats: function(profileid) {
        // console.log(profileid);
        return $http.get(serverURL + '/chat/', {headers: {'profile_id': profileid} } );
      },

      getMessages: function(chatId) {
        return $http.post(serverURL + '/chat/' + chatId);
      },

      sendMessage: function(sendMsgToChatAPI) {
        // console.log(sendMsgToChatAPI);

        return $http.post(serverURL + '/chat/', sendMsgToChatAPI);
      },

      sendSeenTimestamp: function(chatId) {

        var seenTimestamp = Date();
        var seenTimeStampData = {timestamp: seenTimestamp};
        // console.log(serverURL + '/chat/' + chatId);

        return $http.put(serverURL + '/chat/' + chatId, seenTimeStampData);
      }


    };

    return Chat;
});