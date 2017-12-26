// 'use strict';

angular.module('Haberdashery')
  .controller('forgotPasswordController', function($scope, $window, $location, $rootScope, $auth, toaster, Socket, Profile, Chat) {

    if ($auth.isAuthenticated() && $rootScope.currentUser.isComplete) {
      $location.path('/home');
    }

    $scope.goToLink = function(type) {
      // console.log(postID);
      if (type == "signup") {
        $location.path('/signup/');
      }
      else {
        // console.log(postID);
        $location.path('/');
      }
    };

    $scope.sendPassword = function() {
      // send verify email
      Profile.forgotPassword($scope.email)
        .success(function(response) {
          swal("Email Sent!", "A password reset email has been sent to " + $scope.email, "success");
          $location.path('/login'); 
          // if the response if OK, redirect to login
        })
        .catch(function(response) {
          // if not valid email, show error
          if (response.status == 400) {
            swal("Invalid email.", $scope.email + " is not a valid email.", "error");
          }
        
        });

    };

    $scope.emailLogin = function() {
      $auth.login({ email: $scope.email, password: $scope.password })
        .then(function(response) {



        })
        .catch(function(response) {
          // console.log(response);
          $scope.errorMessage = {};
          angular.forEach(response.data.message, function(message, field) {
            $scope.forgotPasswordForm[field].$setValidity('server', false);
            $scope.errorMessage[field] = response.data.message[field];
          });
        });
    };



  });