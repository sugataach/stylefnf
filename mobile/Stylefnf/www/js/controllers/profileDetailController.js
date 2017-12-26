angular.module('Stylefnf')
.controller('profileDetailController', function($scope, $stateParams, Profile, $location, $rootScope, $window, $state, currentUser, $ionicTabsDelegate, Like, $ionicModal) {

  $scope.following = false;

  $scope.loadProfile = function() {
      // fashion posts
      Profile.getUserProfile($stateParams.profileId)
        .success(function(data) {

          $scope.descriptions = [];
          $scope.user = data;
          $scope.likedPosts = $scope.user.likedPosts.reverse();

          if($scope.user != undefined) {
            for(i = 0; i < $scope.user.followers.length; i++) {
              if($scope.user.followers[i]._id == $rootScope.currentUser._id) {

                $scope.following = true;
                break;
              }
            }
          }

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

          //drop-down for description
          $scope.toggleDesc= function(desc) {

            for (i = 0; i < $scope.displayPost.length; i++) {
              if ($scope.displayPost[i].description == desc) {

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

          $scope.getFollowers = function(user) {
            return user.followers.length;
          };

          $scope.getFollowing = function(user) {
            return user.following.length;
          };
        });

      $scope.$broadcast('scroll.refreshComplete');

      $scope.goToFollowing = function() {
        $state.go('tab.following', {profileId: $stateParams.profileId});
      };

      $scope.goToFollowers = function() {
        $state.go('tab.follower', {profileId: $stateParams.profileId});
      };
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

    if(route == "comments") {

      $state.go('tab.comments', {listingId: id});
    }
  };

  $scope.goBack = function() {
      window.history.back();
  }

  // hack to prevent the page from changing after clicking a button
  $scope.$on('$locationChangeStart', function(event, next) {
    console.log(next);
    if (next.split('#/')[1] == 'profiles') {
      event.preventDefault();
    }
  });

  $scope.isFollowing = function(user) {
    return $scope.following;
  };

  $scope.followAction = function(user) {

    Profile.followAction($stateParams.profileId)
      .success(function(result) {
        if($scope.following) $scope.following = false;
        else $scope.following = true;

        Profile.getUserProfile($stateParams.profileId)
          .success(function(data) {

            $scope.descriptions = [];
            $scope.user = data;
            $scope.likedPosts = $scope.user.likedPosts;
          });
        // $scope.loadProfile();
        // $state.go('tab.profile-detail', {profileId: user._id});
        // $rootScope.currentUserFollowing = result;
    });
  };

  $scope.startChat = function() {

    var chatID = undefined;
    var currUser = currentUser.getCurrentUser().chats;
    var otherUser = $scope.user.chats;
    var isChatAvailable = false;


    // $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    //   $ionicTabsDelegate.showBar(true);
    // });

    //find if chat already exist
    for (chat in currUser){

      //chat with this person already exist
      if(otherUser.indexOf(currUser[chat]) != -1){
        isChatAvailable = true;
        $state.go('tab.chat-detail', { chatId :  currUser[chat]});
      }
    }

    $rootScope.newChat = $scope.user;
    $rootScope.currChatName = $scope.user.firstName + ' ' + $scope.user.lastName;

    if(isChatAvailable == false){
      // console.log("hi");
      $state.go('tab.chat-detail', {});
    }
  };

  $scope.goBack = function(){
    window.history.back();
  };

  // click to like or unlike a listing
  $scope.likeListing = function(listing) {

    Like.likeAction(listing._id).success(function(result) {
      listing.likes = result.likes;
    });
  };

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

  $scope.closeProfileModal = function() {
    $scope.profileModal.hide();
  };

  $scope.showProfileModal = function(){
    $scope.profileModal.show();
  }
  $ionicModal.fromTemplateUrl('profile-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.profileModal = modal;
  });

  $scope.getDeviceHeight = function(){
    return $window.innerHeight;
  }

});
