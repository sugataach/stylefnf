// 'use strict';

angular.module('Haberdashery')
  .controller('accountController', function($scope, $animate, $mdDialog, $sce, $auth, $route, Socket, Search, Profile, Like, $location, $rootScope, $filter, HoverProfile, $window) {

    $scope.currentUser = {
      firstName: $rootScope.currentUser.firstName,
      lastName: $rootScope.currentUser.lastName,
      email: $rootScope.currentUser.email,
      password: $scope.password,
      gender: $rootScope.currentUser.gender,
    };

    $scope.profileIsComplete = function() {
      return ($scope.currentUser.firstName && $scope.currentUser.lastName && $scope.currentUser.gender && $scope.isValidEmail($scope.currentUser.email) && $scope.isNewPassword());
    };

    $scope.isNewPassword = function() {
      console.log($scope.password);
      if ($scope.password != undefined) {
        return $scope.password == $scope.confirmPassword;
      }
      return true;
    };

    $scope.isValidEmail = function(email) {
      // if (email.endsWith('@mail.utoronto.ca')) {
      //   return false;
      // }
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };

    $scope.isEditing = false;

    $scope.clickEdit = function() {
      $scope.isEditing = !$scope.isEditing;
    };

    $scope.isUpdated = function() {
      console.log('change');
      $scope.clickSave = true;
    };

    $scope.updateProfile = function() {
      console.log($scope.currentUser);
      // send the info to the backend
      Profile.updateProfile($scope.currentUser)
        .success(function(response) {
          console.log(response);
          $window.localStorage.currentUser = JSON.stringify(response.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser); 

          $scope.isEditing = false;
          $scope.clickSave = false;

          $scope.currentUser = {
            firstName: $rootScope.currentUser.firstName,
            lastName: $rootScope.currentUser.lastName,
            email: $rootScope.currentUser.email,
            gender: $rootScope.currentUser.gender,
          };
        });
    };

    $scope.genderOptions = [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' }
    ];

    //this function is called when the input loads an image
    function _grabImage(file){
        var reader = new FileReader();
        reader.onload = function(event){
            // console.log(event.target.result);
            $rootScope.uploadProfilePic = event.target.result;
            // start the dialog
            $scope.updateProfilePic();
        }
    
        //when the file is read it triggers the onload event above.
        reader.readAsDataURL(file);
    }

    $scope.grabImage = function(files) {

      // console.log(files);

      //check if browser supports file api and filereader features
      if (window.File && window.FileReader && window.FileList && window.Blob) {
          // call the grabImage function
          _grabImage(files[0]);

      } else {

        alert('The File APIs are not fully supported in this browser.');

      }
    };

    // show "Update Profile Picture" Dialog
    $scope.updateProfilePic = function() {
      console.log($rootScope.uploadProfilePic);

      if ($auth.isAuthenticated() && $rootScope.uploadProfilePic) {
          $mdDialog.show({
            controller: DialogCtrl,
            templateUrl: '../../views/partials/updateProfilePic.html',
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose:true 
          })
          .then(function(answer) {

          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      }
      else {
        $location.path('/login');
      }
    };

  });