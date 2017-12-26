// Dialog Box Function
(function () {
  'use strict';
  angular
      .module('Haberdashery')
      .controller('CustomPhotoCtrl', editPhotoController)

  function editPhotoController (
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

    // var img = new Image();
    // img.onload = function () {
    //     $scope.$apply(function() {
    //       ctrl.windowWidth = img.width;
    //       ctrl.windowHeight = img.height;
    //       // $scope.image.path = $scope.imageurl;
    //     });
    // }
    // img.src = $rootScope.editablePhoto;
    ctrl.windowWidth = 640;
    ctrl.windowHeight = 480;

    ctrl.imageUrl = $rootScope.editablePhoto;
    ctrl.showControls = false;
    ctrl.fit = true;

    $scope.isLoading = function() {
      console.log(ctrl.imageUrl);
    };

    // controls for the photo editing buttons
    ctrl.cropperApi = function(cropperApi) {
      $scope.zoomFactor = 1.1;

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
      var split_arr = $rootScope.editablePhoto.split('/');
      var file_name = split_arr[split_arr.length - 1];
      
      // form the s3 upload object
      var s3upload = new S3Upload({
          s3_object_name: file_name,
          file_type: 'image_reupload',
          file_dom_selector: ctrl.blob,
          s3_sign_put_url: s3serverURL,
          onProgress: function(percent, message) {
            console.log('Upload progress: ', percent, message);
          },
          onFinishS3Put: function(public_url) {
            console.log(public_url);
            
            // Close the dialog
            $scope.answer();
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