// 'use strict';

angular.module('Haberdashery')
  .controller('loginController', function($scope, $window, $location, $rootScope, $auth, toaster, Socket, Profile, Chat) {

    // if($auth.isAuthenticated()) {
    //   $location.path('/');
    // }
    Socket.on('socketID.updated', function(response) {
      // console.log(response);
    });

    if ($auth.isAuthenticated() && $rootScope.currentUser.isComplete) {
      $location.path('/home');
    }

    // $scope.instagramLogin = function() {
    //   $auth.authenticate('instagram')
    //     .then(function(response) {
    //       $window.localStorage.currentUser = JSON.stringify(response.data.user);
    //       // console.log($window.localStorage.currentUser);
    //       toaster.pop('success', "Logged in successfully.");
    //       $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
    //     })
    //     .catch(function(response) {
    //       // console.log(response.data);
    //     });
    // };

    $scope.goToLink = function(type) {
      // console.log(postID);
      if (type == "signup") {
        $location.path('/signup/');
      }
      else {
        // console.log(postID);
        $location.path('/help/');
      }
    };

    // $scope.facebookLogin = function() {
    //   // console.log('made it to facebook login');
    //   $auth.authenticate('facebook')
    //     .then(function(response) {
    //       // console.log(response);
    //       $window.localStorage.currentUser = JSON.stringify(response.data.user);
    //       // console.log($window.localStorage.currentUser);
    //       toaster.pop('success', "Logged in successfully.");
    //       $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
    //       // console.log(Socket.managers);

    //       // send the socket id to the server
    //       Profile.sendSocketID(io.managers[Object.keys(io.managers)[0]].engine.id)
    //         .then(function(response) {
    //           // console.log(response);
    //       });

    //       // get the notifications of the current user
    //       Profile.getNotifications();

    //       $location.path('/');

    //     })
    //     .catch(function(response) {
    //       // console.log(response.data);
    //       swal("Your Facebook account is not registered with an active user on Stylefnf.", "Please try signing up.", "error");
    //       // $location.path("/signup");
    //     });
    // };

    $scope.emailLogin = function() {
      $auth.login({ email: $scope.email, password: $scope.password })
        .then(function(response) {
          $window.localStorage.currentUser = JSON.stringify(response.data.user);
          // toaster.pop('success', "Logged in successfully.");
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          $rootScope.currentUserFollowing = $rootScope.currentUser.following;

          Socket.emit('active', {id: $rootScope.currentUser._id} );

          // get the notifications of the current user
          Profile.getNotifications();

          // get messages of the current user 
          Chat.getChats($rootScope.currentUser._id).success(function(data) {
            console.log(data);

            // if there isn't an array, create one
            if ($rootScope.new_msg_chats == undefined) {
              $rootScope.new_msg_chats = [];
            }
            for (var i = 0; i < data.length; i++) {
              if (data[i].hasUnseenMessages && (data[i].lastSentUser == $rootScope.currentUser._id)) {
                console.log(i);
                $rootScope.new_msg_chats.push(i);
              }
            }
          });

          // // get the notifications of the current user
          // Profile.getNotifications();
          
          $location.path('/home');
        })
        .catch(function(response) {
          // console.log(response);
          $scope.errorMessage = {};
          angular.forEach(response.data.message, function(message, field) {
            $scope.loginForm[field].$setValidity('server', false);
            $scope.errorMessage[field] = response.data.message[field];
          });
        });
    };

    // SEO REQUIREMENT: 
    // PhantomJS pre-rendering workflow requires the page to declare, through htmlReady(), that
    // we are finished with this controller. 
    // $scope.htmlReady();



  });