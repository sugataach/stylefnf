// Dialog Box Function
(function () {
  'use strict';
  angular
      .module('Haberdashery')
      .controller('CustomProfilePicCtrl', profilePicController)

  function profilePicController (
              $scope, 
              $window,
              $mdSidenav,
              $mdUtil,
              $log,
              $rootScope, 
              $routeParams, 
              $location, 
              toaster, 
              Post, 
              $auth, 
              $route,
              $timeout, 
              Socket, 
              Comment, 
              Offer,
              Profile,
              $animate,
              $mdDialog,
              $q,
              s3serverURL,
              $mdToast,
              $http) {
    

    var ctrl = this;

    // Some cropper options.
    ctrl.imageUrl = $rootScope.uploadProfilePic;
    ctrl.showControls = false;
    ctrl.fit = true;

    // controls for the photo editing buttons
    ctrl.cropperApi = function(cropperApi) {

      $scope.picZoomIn = function(factor) {
        cropperApi.zoomIn(factor);
      };

      $scope.fit = function() {
        cropperApi.fit();
      }

      $scope.rotate = function() {
        cropperApi.rotate(90);
      };

      $scope.crop = function() {
        cropperApi.crop();
      };

    };

    ctrl.updateResultImage = function(base64) {
      // create a blob from the base64
      ctrl.blob = dataURLtoBlob(base64);
      // upload the blob
      $scope.s3Upload();
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
          file_dom_selector: ctrl.blob,
          s3_sign_put_url: s3serverURL,
          onProgress: function(percent, message) {
            console.log('Upload progress: ', percent, message);
          },
          onFinishS3Put: function(public_url) {
            console.log(public_url);

            // Add profile pic to user object
            Profile.updateProfilePic(public_url).success(function() {
              // Grab the new user profile
              Profile.getUserProfile($rootScope.currentUser._id).success(function(response) {

                // Update the JSON Webtoken with new picture
                $window.localStorage.currentUser = JSON.stringify(response);
                $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
                
                // get the notifications of the current user
                Profile.getNotifications();

                // Close the dialog
                $scope.answer();
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

  }
})();