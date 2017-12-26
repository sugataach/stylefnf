angular.module('Stylefnf')
.controller('forgotPasswordVerifyController', function($scope, $window, $location, $stateParams, $auth, $state, $cordovaCamera, Socket, Search, Profile, Like, $rootScope, $ionicSlideBoxDelegate, $ionicModal, $ionicLoading, $ionicPopup) {

	$scope.tokenVerified = false;
  $rootScope.missedPasswordChange = true;


  $auth.login({ token: $stateParams.token })
    .then(function(response) {
      $window.localStorage.currentUser = JSON.stringify(response.data.user);
      // toaster.pop('success', "Logged in successfully.");
      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

      // get the notifications of the current user
      //Profile.getNotifications();
    })
    .catch(function(response) {
      //console.log("CATCH AUTH LOGIN ERROR: ", response);
    });


  Profile.verifyUser($stateParams.token)
    .success(function(response) {

      if (!angular.isObject(response)) {

        var alertPopup = $ionicPopup.alert({
             title: 'Invalid!',
             template: '<div align="center">This token is invalid or has expired! Please try resetting again.</div>'
           });

          alertPopup.then(function(res) {
            //$location.path("/forgotPassword");
            $state.go('forgotPassword');
          });
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

          if ($scope.currentUser.password != undefined)
            return $scope.currentUser.password == $scope.currentUser.confirmPassword;
          else return false;
        };

        $scope.updateProfile = function() {
          //console.log($scope.currentUser);
          // send the info to the backend
          Profile.updateProfile($scope.currentUser)
            .success(function(response) {
              //console.log('changed password');

              $rootScope.missedPasswordChange = false;

              //console.log(response);
              $window.localStorage.currentUser = JSON.stringify(response.user);
              $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

              $state.go('tab.feed');
            });
        };
      }
    })
  .catch(function(response) {

    var alertPopup = $ionicPopup.alert({
         title: 'Invalid!',
         template: '<div align="center">This token is invalid or has expired! Please try resetting again.</div>'
       });

      alertPopup.then(function(res) {
        //$location.path("/forgotPassword");
        $state.go('forgotPassword');
      });
  });

  $scope.$on('$locationChangeStart', function(event, next) {
    if ($rootScope.missedPasswordChange == true) {
      $auth.logout();
      $auth.removeToken();
      //delete $window.localStorage.currentUser;
      delete $window.cookies;
    }
  });
});
