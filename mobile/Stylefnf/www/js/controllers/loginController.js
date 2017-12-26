angular.module('Stylefnf')
.controller('loginController', function($scope, $state, $auth, $window, $rootScope, $ionicPopup, Profile, currentUser, Socket) {

  if ($auth.isAuthenticated()){
    //console.log($auth.isAuthenticated());
    $state.go('tab.feed');
  }

  $scope.emailLogin = function(email, password) {
    //$state.go('tab.feed');
    $auth.login({email: email, password: password})
      .then(function(response){
        // parse the response containing the user object
        //alert($rootScope.deviceToken);
        $window.localStorage.currentUser = JSON.stringify(response.data.user);
        var user = JSON.parse($window.localStorage.currentUser);
        Socket.emit('active', {id: user._id} );

        // save the user object to the currentUser service
        //console.log('deviceToken', currentUser.getDeviceToken());
        //Profile.updateDeviceToken($rootScope.deviceToken);
        currentUser.setCurrentUser(user);
        $rootScope.currentUser = user;

        if (window.cordova) {

          var deviceInformation = ionic.Platform.device();
          var phonePlatform = "";
          
          if(ionic.Platform.isIOS()) {
            phonePlatform = "iOS";
          } else {
            phonePlatform = "Android";
          }
          
          Profile.updateDeviceToken($rootScope.deviceToken, user._id)
           .success(function(data){

           });


          Profile.updatePlatform(phonePlatform, user._id)
           .success(function(data){

           });

        }

        // if (window.cordova) {
        //   // running on device/emulator
        //   var push = PushNotification.init({
        //     android: {
        //         senderID: "1063814232556"
        //     },
        //     ios: {
        //         alert: "true",
        //         badge: "true",
        //         sound: "true"
        //     },
        //     windows: {}
        //   });



        //   push.on('registration', function(data) {
        //     alert(data.registrationId);
        //     //currentUser.setDeviceToken(data.registrationId);
        //     Profile.updateDeviceToken(data.registrationId, user._id)
        //       .success(function(data){
        //         //alert(data.user.registrationId)
        //       });

        //     alert(JSON.stringify(push));
        //     currentUser.setPushObj(push);
        //   });

        //   // save push obj
        //   alert(JSON.stringify(push));
        //   currentUser.setPushObj(push);

        //   push.on('notification', function(data) {
        //     alert(JSON.stringify(data));
        //     if(data.additionalData.objType == "comment"){
        //       $state.go('tab.comments', {listingId: data.additionalData.objID});
        //     } else if(data.additionalData.objType == "like" || data.additionalData.objType== "offer"){
        //       $state.go('tab.listing-detail', {listingId: data.additionalData.objID});
        //     } else if(data.additionalData.objType == "chat"){
        //       $state.go('tab.chat-detail', {chatId: data.additionalData.objID});
        //     } else if(data.additionalData.objType == "follow"){
        //       alert("fdsafdsafasd");
        //       $state.go('tab.profile-detail', {profileId: data.additionalData.objID});
        //     }

        //   });
        // }

        $state.go('tab.feed');
    })
    .catch(function(response){

      var emailError = response.data.message.email;
      var passwordError = response.data.message.password;
      var errorMsg = "";

      if(emailError == undefined){
        errorMsg = passwordError;
      } else {
        errorMsg = emailError;
      }

      var alertPopup = $ionicPopup.alert({
        title: errorMsg
       //template: 'It might taste good'
      });

    });
  };

  $scope.goToAbout = function(){
    $state.go('about');
  }

});
