'use strict';

angular.module('Haberdashery')
  .controller('verifyController', function($scope, $auth, $animate, $mdDialog, $location, $routeParams, Profile, $window, $rootScope, Socket, $timeout) {

    $scope.tokenVerified = false;

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
          swal("Signup token is invalid or has expired!", "Please try signing up again.", "error");
          $location.path("/signup");
        }
        else {

          $scope.tokenVerified = true;

          $window.localStorage.currentUser = JSON.stringify(response.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

          $scope.currentUser = {
            firstName: $rootScope.currentUser.firstName,
            lastName: $rootScope.currentUser.lastName,
            gender: $rootScope.currentUser.gender,
            about: $rootScope.currentUser.about,
            location: $rootScope.currentUser.location
          };

          $scope.profileIsComplete = function() {
            return ($scope.currentUser.firstName && $scope.currentUser.lastName && $scope.currentUser.gender && $scope.currentUser.about && $scope.currentUser.location);
          };

          $scope.isValidEmail = function(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
          };

          $scope.clickSave = true;
          $scope.isEditing = true;

          $scope.clickEdit = function() {
            $scope.isEditing = true;
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

                $location.path('/');
              });
          };

          $scope.genderOptions = [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' }
          ];  

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

          // $timeout(function() {
          //     $location.path('/');
          // }, 1000);

          $scope.facebookLogin = function() {
            // console.log('made it to facebook login');
            $auth.authenticate('facebook', {token: response.token})
              .then(function(response) {
                $window.localStorage.currentUser = JSON.stringify(response.data.user);
                // console.log($window.localStorage.currentUser);
                // toaster.pop('success', "Logged in successfully.");
                $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
                // console.log(Socket.managers);

                // send the socket id to the server
                Profile.sendSocketID(io.managers[Object.keys(io.managers)[0]].engine.id)
                  .then(function(response) {
                    // console.log(response);
                });

                // get the notifications of the current user
                Profile.getNotifications();

                $location.path('/');
              })
              .catch(function(response) {
                // console.log(response);
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

    // on page load
    // verify the token and get the user
    // if ($auth.isAuthenticated() && $rootScope.currentUser.isComplete && rootScope.profilePictures) {
    //   $location.path('/');
    // }
    // else {
    //   Profile.verifyUser()
    //     .success(function(response) {

    //       // console.log(response);

    //       if (!angular.isObject(response)) {
    //         swal("Signup token is invalid or has expired!", "Please try signing up again.", "error");
    //         $location.path("/signup");
    //       }
    //       else {

    //         $scope.tokenVerified = true;

    //         $window.localStorage.currentUser = JSON.stringify(response.user);
    //         $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

    //         $scope.facebookLogin = function() {
    //           // console.log('made it to facebook login');
    //           $auth.authenticate('facebook', {token: response.token})
    //             .then(function(response) {
    //               $window.localStorage.currentUser = JSON.stringify(response.data.user);
    //               // console.log($window.localStorage.currentUser);
    //               // toaster.pop('success', "Logged in successfully.");
    //               $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
    //               // console.log(Socket.managers);

    //               // send the socket id to the server
    //               Profile.sendSocketID(io.managers[Object.keys(io.managers)[0]].engine.id)
    //                 .then(function(response) {
    //                   // console.log(response);
    //               });

    //               // get the notifications of the current user
    //               Profile.getNotifications();

    //               $location.path('/');
    //             })
    //             .catch(function(response) {
    //               // console.log(response);
    //             });
    //         };
    //       }
    //     })
    //   .catch(function(response) {

    //     if (response.status == 401) {
    //       swal("Singup token is invalid or has expired", "Please try signing up again.", "error");
    //       $location.path("/signup");
    //     }
    //   });
    // }

  });