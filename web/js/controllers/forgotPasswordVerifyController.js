// 'use strict';

angular.module('Haberdashery')
  .controller('forgotPasswordVerifyController', function($scope, $animate, $mdDialog, $sce, $auth, $route, Socket, Search, Profile, Like, $location, $rootScope, $filter, HoverProfile, $window, $routeParams) {

    $scope.tokenVerified = false;

    $rootScope.missedPasswordChange = true;

    $auth.login({ token: $routeParams.token })
      .then(function(response) {
        $window.localStorage.currentUser = JSON.stringify(response.data.user);
        // toaster.pop('success', "Logged in successfully.");
        $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

        // get the notifications of the current user
        Profile.getNotifications();
        
        // $location.path('/');
      })
      .catch(function(response) {
        // console.log(response);
        $scope.errorMessage = {};
        angular.forEach(response.data.message, function(message, field) {
          $scope.loginForm[field].$setValidity('server', false);
          $scope.errorMessage[field] = response.data.message[field];
        });
      });


    Profile.verifyUser()
      .success(function(response) {

        // console.log(response);

        if (!angular.isObject(response)) {
          swal("This token is invalid or has expired!", "Please try resetting again.", "error");
          $location.path("/forgotPassword");
        }
        else {

          $scope.tokenVerified = true;

          $window.localStorage.currentUser = JSON.stringify(response.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

          $scope.currentUser = {
            firstName: $rootScope.currentUser.firstName,
            lastName: $rootScope.currentUser.lastName,
            email: $rootScope.currentUser.email,
            password: $scope.password,
            gender: $rootScope.currentUser.gender,
          };

          $scope.profileIsComplete = function() {
            console.log($scope.currentUser.password);
            if ($scope.currentUser.password != undefined) {
              return $scope.currentUser.password == $scope.currentUser.confirmPassword;
            }
            else {
              return false;
            }
          };

          $scope.updateProfile = function() {
            console.log($scope.currentUser);
            // send the info to the backend
            Profile.updateProfile($scope.currentUser)
              .success(function(response) {
                console.log('changed password');

                $rootScope.missedPasswordChange = false;

                console.log(response);
                $window.localStorage.currentUser = JSON.stringify(response.user);
                $rootScope.currentUser = JSON.parse($window.localStorage.currentUser); 

                $state.go("tab.feed");
              });
          };


        }
      })
    .catch(function(response) {

      if (response.status == 401) {
        swal("Singup token is invalid or has expired", "Please try signing up again.", "error");
        $location.path("/signup");
      }
    });

    $scope.$on('$locationChangeStart', function(event, next) {
      if ($rootScope.missedPasswordChange == true) {
        $auth.logout();
        $auth.removeToken();
        delete $window.localStorage.currentUser;
        delete $window.cookies;
      }
    });

  });