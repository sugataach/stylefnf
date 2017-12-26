angular.module('Stylefnf')
.controller('verifyController', function($scope, $auth, $stateParams, Profile, $window, currentUser, $rootScope, $ionicPopup, IonicClosePopupService, Camera, $cordovaImagePicker, $ionicPlatform, $state, $ionicLoading, s3serverURL) {

  $scope.tokenVerified = false;
  $scope.chosenProfilePic;
  $scope.newPicture = false;

  if (!window.cordova) {
    // running on device/emulator
    $scope.isWeb = true;
  }

  $auth.login({ token: $stateParams.token })
    .then(function(response) {
      $window.localStorage.currentUser = JSON.stringify(response.data.user);
      // toaster.pop('success', "Logged in successfully.");
      var user = JSON.parse($window.localStorage.currentUser);
      // save the user object to the currentUser service
      currentUser.setCurrentUser(user);
      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

      // get the notifications of the current user
      // Profile.getNotifications();

      // $location.path('/');
    })
    .catch(function(response) {
      // console.log(response);
    });

  Profile.verifyUser($stateParams.token)
    .success(function(response) {

      // console.log(response);

      if (!angular.isObject(response)) {
        // swal("Signup token is invalid or has expired!", "Please try signing up again.", "error");
        // $location.path("/signup");
      }
      else {

        $scope.tokenVerified = true;

        $window.localStorage.currentUser = JSON.stringify(response.user);
        var user = JSON.parse($window.localStorage.currentUser);
        // save the user object to the currentUser service
        currentUser.setCurrentUser(user);
        $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

        $scope.currentUser = {
          about: $rootScope.currentUser.about,
          location: $rootScope.currentUser.location
        };

        $scope.profileIsComplete = function() {
          return ($scope.currentUser.about && $scope.currentUser.location);
        };

        $scope.isUpdated = function() {
          // console.log('change');
          $scope.clickSave = true;
        };

        $scope.updateProfile = function() {
          // console.log($scope.currentUser);
          // send the info to the backend
          Profile.updateProfile($scope.currentUser)
            .success(function(response) {
              console.log(response);
              $window.localStorage.currentUser = JSON.stringify(response.user);
              // save the user object to the currentUser service
              currentUser.setCurrentUser(user);
              $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

              $state.go('tab.feed');
            });
        };

        $scope.addProfilePic = function() {

          var alertPopup = $ionicPopup.show({
            cssClass: 'upload-pic-popup',
            templateUrl: 'uploadPic-template.html',
            scope: $scope,
          });
          IonicClosePopupService.register(alertPopup);
        };

        // upload function
        $scope.s3UploadWeb = function(userFiles){

          // create a unique filename
          // console.log(userFiles);
          var file_name = userFiles[0].name;
          // file_name = file_name[file_name.length-1];

          // edit the individual files
          var file_element = userFiles;
          var f, files, output, _i, _len, _results, newF;
          files = userFiles;
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            f = files[_i];
            resizePic(f, file_name);
          }
        };

        // helper function to resize the file to 720 x 720
        function resizePic(file, file_name) {
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          var cw = canvas.width;
          var ch = canvas.height;

          // limit the image to 150x100 maximum size
          var maxW = 720;
          var maxH = 720;

          var img = new Image;
          img.onload = function() {
            var iw = img.width;
            var ih = img.height;
            var scale = Math.min((maxW/iw),(maxH/ih));
            var iwScaled = iw*scale;
            var ihScaled = ih*scale;
            canvas.width = iwScaled;
            canvas.height = ihScaled;
            ctx.drawImage(img,0,0,iwScaled,ihScaled);

            $scope.chosenProfilePic = dataURLtoBlob(canvas.toDataURL('image/jpeg', 0.75));
            console.log($scope.chosenProfilePic);
            $scope.s3Upload();
            $scope.newPicture = true;
            $scope.$apply();
          }
          img.src = URL.createObjectURL(file);
        };

        // upload function
        // think about creating a service
        $scope.s3Upload = function(){

          // create a unique filename
          var file_name = $rootScope.currentUser.firstName + $rootScope.currentUser.lastName;

          // form the s3 upload object
          var s3upload = new S3Upload({
              s3_object_name: file_name,
              file_type: 'image',
              file_dom_selector: $scope.chosenProfilePic,
              s3_sign_put_url: s3serverURL,
              onProgress: function(percent, message) {
                // console.log('Upload progress: ', percent, message);
              },
              onFinishS3Put: function(public_url) {
                console.log(public_url);

                $ionicLoading.show({
                  content: 'Updating profile picture',
                  animation: 'fade-in',
                  showBackdrop: true,
                });

                // Add profile pic to user object
                Profile.updateProfilePic(public_url).success(function() {
                  // Grab the new user profile
                  Profile.getUserProfile($rootScope.currentUser._id).success(function(response) {

                    // Update the JSON Webtoken with new picture
                    $window.localStorage.currentUser = JSON.stringify(response);
                    // save the user object to the currentUser service
                    currentUser.setCurrentUser(user);
                    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

                    // get the notifications of the current user
                    Profile.getNotifications();

                    $ionicLoading.hide();
                  });

                });
              },
              onError: function(status) {
                // console.log('Upload error: ', status);
              }
          });
        };

        // helper function to generate a blob from a base64 string
        function dataURLtoBlob(dataurl) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {type:mime});
        }

        // function to take a picture
        $scope.takePicture = function () {

          var cameraOptions = {
             quality : 75,
             targetWidth: 720,
             targetHeight:720,
             sourceType: 1,
             saveToPhotoAlbum: false,
          };

          Camera.getPicture(cameraOptions).then(function(imageData) {

            // Setup the loader
            $ionicLoading.show({
              content: 'Updating profile picture',
              animation: 'fade-in',
              showBackdrop: true,
            });

            // save the picture in an array
            $scope.chosenProfilePic = dataURLtoBlob((imageData));
            $scope.s3Upload();
            $scope.newPicture = true;

            $ionicLoading.hide();
          }, function(err) {
             console.log(err);
          });

        };

        // function to get pictures from gallery
        $scope.getPictures = function () {
          var photoOptions = {
            maximumImagesCount: 1,
            width: 720,
            height: 720,
            quality: 75
          };

          $cordovaImagePicker.getPictures(photoOptions).then(function (results) {

            // Setup the loader
            $ionicLoading.show({
              content: 'Updating profile picture',
              animation: 'fade-in',
              showBackdrop: true,
            });

           for (var i = 0; i < results.length; i++) {
              $scope.chosenProfilePic = dataURLtoBlob(results[i]);
              $scope.s3Upload();
              $ionicLoading.hide();

              $scope.newPicture = true;
           }

           return;
          },  function(error) {
             console.log(error);
          });
        };

      }
    })
    .catch(function(response) {

      if (response.status == 401) {
        // swal("Singup token is invalid or has expired", "Please try signing up again.", "error");
        // $location.path("/signup");
      }
    });

});
