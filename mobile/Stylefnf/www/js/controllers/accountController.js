angular.module('Stylefnf')
.controller('accountController', function($scope, Profile, $state, $rootScope, $window, $ionicPopup, IonicClosePopupService, Camera, $cordovaImagePicker, $ionicPlatform, $ionicLoading, s3serverURL, currentUser, Like, Post) {

  if(!$rootScope.currentUser){
    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
  }

  //console.log($rootScope.currentUser);
  //$scope.user = $rootScope.currentUser;

  $scope.chosenProfilePic;
  $scope.descriptions = [];

  $scope.loadProfile = function() {

    Profile.getUserProfile($rootScope.currentUser._id)
      .success(function(data) {

        $scope.user = data;
        //console.log(data);
        $scope.likedPosts = $scope.user.likedPosts.reverse();
        //console.log($scope.user);

        var posts = $scope.user.myPosts;
        $scope.displayPost = posts.reverse();

        $scope.getListings = function(user) {
          var total = 0;
          for (i in user.myPosts) {
            if (user.myPosts[i].status != 'sold') {
              total += 1;
            }
            user.myPosts[i]['liked'] = Like.hasLiked(user.myPosts[i]['likes']);
            $scope.descriptions.push(false);
          }
          return total;
        };

        $scope.getFollowers = function(user) {
          return user.followers.length;
        };

        $scope.getFollowing = function(user) {
          return user.following.length;
        };

        $scope.addProfilePic = function() {

          $scope.addPicPopup = $ionicPopup.show({
            cssClass: 'upload-pic-popup',
            templateUrl: 'uploadPic-template.html',
            scope: $scope,
          });
          IonicClosePopupService.register($scope.addPicPopup);
        };

        // upload function
        $scope.s3UploadWeb = function(userFiles){

          // create a unique filename
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
                // console.log(public_url);

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
                    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
                    $scope.user = $rootScope.currentUser;

                    // get the notifications of the current user
                    Profile.getNotifications($scope.user._id);

                    $scope.addPicPopup.close();
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
          // console.log(dataurl);
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
             targetWidth: 640,
             targetHeight: 640,
             destinationType: 0,
             sourceType: 1,
             saveToPhotoAlbum: false,
             correctOrientation: true,
             allowEdit: true
          };

          Camera.getPicture(cameraOptions).then(function(imageData) {

            // save the picture in an array
            var image = document.getElementById('myImage');
            $scope.chosenProfilePic = dataURLtoBlob("data:image/jpeg;base64," + imageData);
            $scope.s3Upload();

          }, function(err) {
             console.log(err);
          });

        };


        //  $scope.goToChats = function() {
        //   console.log('heelo');
        //   // $state.go('tab.chats');
        //   $state.transitionTo('tab.chats');
        //   // $location.path('/chats');
        // };

        $scope.goToOptions = function(){
          $state.go('tab.options');
        };

          // click to like or unlike a listing
        $scope.likeListing = function(listing) {

          Like.likeAction(listing._id).success(function(result) {
            listing.likes = result.likes;
          });
        };

        //drop-down for description
        $scope.toggleDesc= function(desc) {

          for (i = 0; i < $scope.posts.length; i++) {
            if ($scope.posts[i].description == desc) {
              if($scope.descriptions[i]) {

                $scope.shownDesc = null;
                $scope.descriptions[i] = false;
              }
              else {

                $scope.shownDesc = desc;
                $scope.descriptions[i] = true;
              }
              break;
            }
          }
        };

        $scope.isDescShown = function(desc) {
          for (i = 0; i < $scope.displayPost.length; i++) {
            if ($scope.displayPost[i].description == desc)
              return $scope.descriptions[i];
          }
          return false;
        };

        $scope.isAvailable = function(listing) {
          return Post.isAvailable(listing);
        };

        $scope.hasOffers = function(listing) {
          return listing.offers.length > 0;
        };

        // function to get pictures from gallery
        $scope.getPictures = function () {

          var photoOptions = {
            maximumImagesCount: 1,
            width: 640,
            height: 640,
            quality: 75
          };

          $cordovaImagePicker.getPictures(photoOptions)
          .then(function (results) {
              for (var i = 0; i < results.length; i++) {
                  console.log('Image URI: ' + results[i]);
                  $scope.imageUri = results[i];

                 // Encode URI to Base64
                 window.plugins.Base64.encodeFile($scope.imageUri, function(base64){
                    // Save images in Base64
                    // $scope.images.push(base64);
                    $scope.chosenProfilePic = dataURLtoBlob(base64);
                    $scope.s3Upload();
                 });
              }

          }, function(error) {
              // error getting photos
          });
        };

        $scope.offers = $scope.user.offeredPosts.reverse();
        //console.log($scope.offers);
      });


      $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (toState.name == "tab.account") {
      $scope.loadProfile();
    }
  });

  $scope.showPrice = function(price) {
    if (price == 0) {
      return "Free!";
    }
    if(price % 1 != 0){
      return "$" + price.toFixed(2);
    } else {
      return  "$" + price;
    }
  };

  $scope.goTo = function(route, id) {
    if (route == "listing") {
      // go to the given listing
      // $location.path('#/tab/detail/' + id);
      $state.go('tab.listing-detail', {listingId: id});
      // $state.transitionTo('tab/chats/' + id);
    }

    if (route == "profile") {
      $state.go('tab.profile-detail', {profileId: id});
    }

    if(route == "editAccount"){
      $state.go('tab.edit-account', {profileId: id})
    }

    if(route == "follower"){
      $state.go('tab.follower', {profileId: id})
    }

    if(route == "following"){
      $state.go('tab.following', {profileId: id})
    }

    if(route == "comments") {

      $state.go('tab.comments', {listingId: id});
    }

  };

  //  $scope.goToChats = function() {
  //   console.log('heelo');
  //   // $state.go('tab.chats');
  //   $state.transitionTo('tab.chats');
  //   // $location.path('/chats');
  // };

  $scope.goToOptions = function(){
    $state.go('tab.options');
  };

    // click to like or unlike a listing
  $scope.likeListing = function(listing) {

    Like.likeAction(listing._id).success(function(result) {
      listing.likes = result.likes;
    });
  };

  //drop-down for description
  $scope.toggleDesc= function(desc) {

    for (i = 0; i < $scope.posts.length; i++) {
      if ($scope.posts[i].description == desc) {
        if($scope.descriptions[i]) {

          $scope.shownDesc = null;
          $scope.descriptions[i] = false;
        }
        else {

          $scope.shownDesc = desc;
          $scope.descriptions[i] = true;
        }
        break;
      }
    }
  };

  $scope.isDescShown = function(desc) {
    for (i = 0; i < $scope.displayPost.length; i++) {
      if ($scope.displayPost[i].description == desc)
        return $scope.descriptions[i];
    }
    return false;
  };

  $scope.isAvailable = function(listing) {
    return Post.isAvailable(listing);
  };

  $scope.hasOffers = function(listing) {
    return listing.offers.length > 0;
  }

  $scope.getMobileAvatar = function(post) {
    if(post){
      if (typeof post.mobileImageUrlsAvatar !== "undefined") {
        if (post.mobileImageUrlsAvatar.length > 0) {
          return post.mobileImageUrlsAvatar[0];
        } else {
          return post.imageUrls[0];
        }
      } else {
          return post.imageUrls[0];
      }
    }
  }

  $scope.getProfileImg = function(person) {
    if(person){
      if (typeof person.mobileProfileDisplay !== "undefined") {
        if (person.mobileProfileDisplay.length > 0) {
          return person.mobileProfileDisplay[0];
        } else {
          return person.profilePictures[0];
        }
      } else {
          return person.profilePictures[0];
      }
    }
  }

  $scope.getMobileImg = function(post) {
    if(post){
      if (typeof post.mobileImageUrls !== "undefined") {
        if (post.mobileImageUrls.length > 0) {
          return post.mobileImageUrls[0];
        } else {
          return post.imageUrls[0];
        }
      } else {
          return post.imageUrls[0];
      }
    }
  }

  $scope.getProfileAvatar = function(person) {
    if(person){
      if (typeof person.mobileProfileAvatars !== "undefined") {
        if (person.mobileProfileAvatars.length > 0) {
          return person.mobileProfileAvatars[0];
        } else {
          return person.profilePictures[0];
        }
      } else {
          return person.profilePictures[0];
      }
    }
  }

});
