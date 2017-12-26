angular.module('Stylefnf')
.controller('forgotPasswordController', function($scope, $auth, $state, $location, $cordovaCamera, Profile,  $rootScope, $ionicSlideBoxDelegate, $ionicModal, $ionicLoading, $ionicPopup) {

	// if ($auth.isAuthenticated() && $rootScope.currentUser.isComplete) {
 //    $location.path('/home');
 //  }

  // $scope.goToLink = function(type) {
  //   if (type == "signup") $location.path('/signup/');
  //   else $location.path('/');
  // };

    //console.log('heelo');

  $scope.forgotPasswordForm = {
    email: ""
  };

  $scope.sendEmail = function() {

    if ($scope.forgotPasswordForm.email == undefined) {

      var alertPopup = $ionicPopup.alert({
          title: 'Invalid entry!',
          template: '<div align="center">Please enter a valid email address.</div>'
        });
    }
    else {

      // send verify email
      Profile.forgotPassword($scope.forgotPasswordForm.email)
        .success(function(response) {

          var alertPopup = $ionicPopup.alert({
             title: 'Email Sent!',
             template: '<div align="center">A password reset email has been sent to ' + 
                $scope.forgotPasswordForm.email + '.</div>'
           });

          alertPopup.then(function(res) {
            $scope.forgotPasswordForm = {
              email:  "",
            };
            //$location.path('/login'); 
            $state.go('login');
            //$scope.emailNotValid = true;
          });
        })
        .catch(function(response) {
          
          // if not valid email, show error
          //if (response.status == 400) {

            var alertPopup = $ionicPopup.alert({
              title: 'Invalid email!',
              template: '<div align="center">This email is not registered.</div>'
            });

            alertPopup.then(function(res) {
              $scope.forgotPasswordForm = {
                email:  "",
              };
              //$scope.emailNotValid = true;
            });

          //}
        });
    }
  };
});
