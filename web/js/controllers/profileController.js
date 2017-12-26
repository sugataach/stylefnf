'use strict';

angular.module('Haberdashery')
  
  .controller('profileController', function(
              $scope, 
              Post, 
              $location, 
              $rootScope, 
              $routeParams, 
              $route, 
              $window, 
              toaster, 
              Socket, 
              Profile, 
              $auth, 
              Chat, 
              $filter,
              $mdDialog,
              HoverProfile,
              Like) {


    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
        $scope.$apply();
    }


    $scope.isAuthenticated = function() {
      // check if logged in
      return ($auth.isAuthenticated() && $rootScope.currentUser.isComplete);
    };

    $scope.isAvailable = function(post) {
      return Post.isAvailable(post);
    };

    $scope.isBuyer = function(post) {
      return Post.isBuyer(post);
    };

    $scope.isPoster = function(post) {
      return Post.isCreator(post);
    };

    $scope.isNotCurrentUser = function() {
      // check if logged in
      // console.log($rootScope.currentUser._id != $routeParams.profileId);
      return ($rootScope.currentUser._id != $routeParams.profileId);
    };

    $scope.goToLink = function(postID, type) {
      // console.log(postID);
      if (type == "post") {
        $location.path('/detail/' + postID);
      }
      else {
        // console.log(postID);
        $location.path('/profile/' + postID._id);
      }
    }

    var profileId = $routeParams.profileId;
    // console.log(profileId);

    $scope.myPosts = [];
    $scope.offeredPosts = [];

    Profile.getUserProfile(profileId)
      .then(function(profileData) {
        // console.log(profileData.data);
        $scope.profile = profileData.data;

        $scope.isFollowing = function(profile) {
          return Profile.hasFollowed(profile);
        };

        // console.log('profile data');
        // console.log($scope.profile);
        
        // myPosts are all Post Schemas
        $scope.myPosts = profileData.data.myPosts;

        // likedPosts are all Like Schemas
        $scope.likedPosts = profileData.data.likedPosts;

        // console.log('myposts:');
        // console.log($scope.myPosts);
        
        $scope.offeredPosts = profileData.data.offeredPosts;
        // console.log($scope.offeredPosts);

        $scope.purchasedPosts = profileData.data.purchasedPosts;

        $scope.soldPosts = profileData.data.soldPosts;

        $scope.numMyPosts = $scope.myPosts.length;
        $scope.numOfferedPosts = $scope.offeredPosts.length;  
    });

    $scope.goToDetail = function(ev, post) {
      // console.log('made it func');
      // $location.path('/detail/' + postID);
      $rootScope.viewListingDetail = post;

      // open a modal to show details
      $mdDialog.show({
        controller: PostCtrl,
        scope: $scope,
        preserveScope: true,
        templateUrl: '../../views/partials/detailModal.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true  
      })
      .then(function(answer) {
        $scope.$destroy();
        // $mdToast.show(
        //   $mdToast.simple()
        //     .content(JSON.stringify(answer))
        // );
      }, function() {
        // $scope.alert = 'You cancelled the dialog.';
      });
    };

    $scope.hovercardURL = '../../views/partials/hoverProfile.html';

    $scope.hoverProfileIn = function(seller) {
      // console.log('hoverIn');
      $rootScope.hoverProfile = seller;
    };

    $scope.hoverProfileOut = function() {
      // console.log('hoverOut');
      $rootScope.hoverProfile = undefined;
    };

    $scope.showCondition = function(cond) {
      // console.log(cond);

      var conditions = [
        {value: 'used', text: 'Gently Used'},
        {value: 'new', text: 'New (with tags)'},
        {value: 'likenew', text: 'Like New (no tags)'},
      ];
      var selected = $filter('filter')(conditions, {value: cond});
      return (cond && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.showMessage = function(ev) {
      // when you click the update my listing button, you set the post to a global var
      // console.log('clicked offer listing');

      $rootScope.sendMessageProfile = $scope.profile;

      if ($auth.isAuthenticated()) {
          $mdDialog.show({
            controller: PostCtrl,
            templateUrl: '../../views/partials/newMessage.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          })
          .then(function(answer) {
            // $mdToast.show(
            //   $mdToast.simple()
            //     .content(JSON.stringify(answer))
            // );
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      }
      else {
        $location.path('/login');
      }
    };

    // $scope.sendMessage = function() {
    //   var myNewMessage = {
    //     participants: [$scope.profile._id, $rootScope.currentUser._id],
    //     content: $scope.msgContent,
    //     sender: $rootScope.currentUser._id,
    //     receiver: $scope.profile._id
    //   };

    //   Chat.sendMessage(myNewMessage);
    //   $scope.cancel();
    //   $location.path('/messages/');

    // };


    $scope.likePost = function(post, typeOfPost) {

      Like.likeAction(post._id).success(function(result) {

        if (typeOfPost == "offeredPost") {
          // TODO
          // should be able to speed this up by hashing the index
          // since the items don't change unless the page is refreshed
          for (var i = 0; i < $scope.offeredPosts.length; i++) {
            var currPost = $scope.offeredPosts[i].post;
            if (currPost._id == post._id) {
              // console.log('result and currPost are identical');
              // console.log(currPost._id == result._id);
              $scope.offeredPosts[i].post = result;
              // console.log('foundit');
              // console.log(i);
              // console.log($scope.posts);
              return $scope.offeredPosts;
            }
          }
        }
        else if (typeOfPost == "myPost"){
          for (var i = 0; i < $scope.myPosts.length; i++) {
            var currPost = $scope.myPosts[i];
            if (currPost._id == post._id) {
              // console.log('result and currPost are identical');
              // console.log(currPost._id == result._id);
              $scope.myPosts[i] = result;
              // console.log('foundit');
              // console.log(i);
              // console.log($scope.posts);
              return $scope.myPosts;
            }
          }
        }
        else if (typeOfPost == "likedPost"){
          for (var i = 0; i < $scope.likedPosts.length; i++) {
            var currPost = $scope.likedPosts[i].post;
            if (currPost._id == post._id) {
              // console.log('result and currPost are identical');
              // console.log(currPost._id == result._id);
              $scope.likedPosts[i].post = result;
              // console.log('foundit');
              // console.log(i);
              // console.log($scope.posts);
              return $scope.likedPosts;
            }
          }
        }
        // console.log($scope.search_posts);
      });
    };

    $scope.myLike = function(likes) {
      // console.log(likes);
      // console.log(likes);
      return Like.hasDetailLiked(likes);
    };

    $scope.usersLiked = function(likes) {
      // console.log(likes);
      // iterate through the likes and return an array of user names who like the post
      var userNames = "";
      for (var i in likes) {
        if (i < 16) {
          userNames = userNames + likes[i].user.firstName + " " + likes[i].user.lastName + "\n";
        }
      }
      // console.log(userNames);
      return userNames;
    };

    $scope.$on('$locationChangeStart', function(event) {
      $mdDialog.hide();
    });

    $scope.showLiked = function(ev, post) {
      // when you click the update my listing button, you set the post to a global var
      // console.log('post');
      // console.log(post);
      /* ------------SUPER HACK-----------------
      Don't use rootScope to save a variable
      TODO: Change to service
      -----------------------------------------*/
      // $scope.selectedPost = post;
      $rootScope.selectedProfilePost = post;
      // console.log('clicked show likes');
      // console.log($scope.selectedBrowsePost.likes);

      if ($auth.isAuthenticated()) {
        // $scope.selectedBrowsePost = post;
          $mdDialog.show({
            controller: PostCtrl,
            templateUrl: '../../views/partials/profileLiked.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
          })
          .then(function(answer) {
            // $mdToast.show(
            //   $mdToast.simple()
            //     .content(JSON.stringify(answer))
            // );
            $scope.selectedPost = null;
          }, function() {
            // $scope.alert = 'You cancelled the dialog.';
          });
      }
      else {
        $location.path('/login');
      }
    };

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
      // console.log($rootScope.uploadProfilePic);

      if ($auth.isAuthenticated() && $rootScope.uploadProfilePic) {
          $mdDialog.show({
            controller: DialogCtrl,
            templateUrl: '../../views/partials/updateProfilePic.html',
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose:true 
          })
          .then(function(answer) {
            var random = (new Date()).toString();
            $scope.profile.profilePictures[0] = $rootScope.currentUser.profilePictures[0] + "?cb=" + random;
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      }
      else {
        $location.path('/login');
      }
    };

    // show "Choose a Macro" Dialog
    $scope.chooseMacro = function(ev) {

      if ($auth.isAuthenticated()) {
          $mdDialog.show({
            controller: PostCtrl,
            templateUrl: '../../views/partials/chooseMacro.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true 
          })
          .then(function(answer) {
            // $mdToast.show(
            //   $mdToast.simple()
            //     .content(JSON.stringify(answer))
            // );
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      }
      else {
        $location.path('/login');
      }
    };

    $scope.followAction = function(profile) {

      if ($scope.isAuthenticated()) {
        Profile.followAction(profile._id).success(function(result) {
          // console.log($scope.search_posts);
          console.log('new followers');
          console.log(result);
          $rootScope.currentUserFollowing = result;
        });
      }
    };

    $scope.isNotUser = function(profile) {
      return ($rootScope.currentUser._id != profile._id);
    };

    $scope.checkField = function(field, name) {
      console.log(field);
      if (field == "" || field == null) {
        return "You cannot leave the field empty.";
      }
    };

    $scope.updateProfile = function(profileId, profileData, profileField) {
      // console.log(postData);
      var updatedProfile = {};
      // if (postField == "description") {
      //   postData = postData.replace(/\n\r?/g, '<br />');
      // }
      updatedProfile[profileField] = profileData;
      console.log(updatedProfile);
      
      Profile.updateProfile(updatedProfile);
    };

    // SEO REQUIREMENT: 
    // PhantomJS pre-rendering workflow requires the page to declare, through htmlReady(), that
    // we are finished with this controller. 
    // $scope.htmlReady();

  });

function DialogCtrl($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };

  $scope.save = function() {
    alert('Form was valid!');
  };
}