angular.module('Stylefnf')
.controller('feedController', function($scope, Search, $timeout, $state, $rootScope, currentUser, Like, Chat, $window, Socket) {

  $scope.pageTitle = "<div ng-click=\"goToChats()\" class=\"row row-center feed-row thin-row\"><img src=\"img/stylefnf.png\" class=\"top-logo\"><span style=\"flex: auto\"></span><i class=\"icon ion-android-mail positive badge-container\" style=\"font-size:30px;\"><span class=\"badge badge-assertive notif-badge\">{{newMessages}}</span></i></div>";

  // console.log(currentUser.getCurrentUser());


  $scope.posts = [];
  $scope.allPostsLoaded = false;
  var seenids = "";
  var seenidsArray = [];

  // get the most up to date user

  var user = JSON.parse($window.localStorage.currentUser);
  $rootScope.currentUser = user;

  Socket.on('new.message.sent', function(sender, chatID) {
    $rootScope.currentUser.messageNotifications.push(chatID);
  });

  $scope.newMessages = user.messageNotifications.length;

  $scope.descriptions = [];

  function loadPosts(seenids, callback) {
    // console.log(seenids);
    Search.getAll('sort=newest', seenids)
      .success(function(data) {
        var posts = [];
        angular.forEach(data['results'], function(child) {
          // add a field to the listing
          // to check if the current user has liked it
          // console.log($scope.liked(child['_id']));
          child['liked'] = Like.hasLiked(child['likes']);
          posts.push(child);
          $scope.descriptions.push(false);
        });
        callback(posts, data['total_items']);
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
  }

  $scope.getOlderPosts = function() {
    if ($scope.posts.length > 0) {
      for (var i in $scope.posts) {
          seenidsArray.push($scope.posts[i]['_id']);
          seenids = seenids + $scope.posts[i]['_id'] + " ";
      }
    }
    loadPosts(seenids, function(olderPosts, total_items) {
      $scope.posts = $scope.posts.concat(olderPosts);
      $scope.$broadcast('scroll.infiniteScrollComplete');

      if (total_items == 0) {
        $scope.allPostsLoaded = true;
      }
    });
    // if (!$scope.allPostsLoaded) {    }
  };

  $scope.getNewerPosts = function() {
    seenids = "";
    seenidsArray = [];
    loadPosts(seenids, function(newPosts, total_items) {

        $scope.posts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
        // if (total_items == 0) {
        //   $scope.allPostsLoaded = true;
        // }
      });
  };

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
  };

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
  };


  $scope.goToChats = function() {
    // remove all chat notifications
    $rootScope.new_msg_chats = [];
    // $state.go('tab.chats');
    $state.transitionTo('tab.chats');
    // $location.path('/chats');
  };

  $scope.goTo = function(route, id) {
    if (route == "listing") {
      // go to the given listing
      // $location.path('#/tab/detail/' + id);
      $state.go('tab.listing-detail', {listingId: id});
      // $state.transitionTo('tab/chats/' + id);
    }

    if (route == "profile") {
      if (id == $rootScope.currentUser._id) {
        $state.go('tab.account');
      }
      else {
        $state.go('tab.profile-detail', {profileId: id});
      }
    }

    if (route == "likes") {

      $state.go('tab.likes', {listingId: id});
    }

    if(route == "comments") {

      $state.go('tab.comments', {listingId: id});
    }
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

    for (i = 0; i < $scope.posts.length; i++) {
      if ($scope.posts[i].description == desc)
        return $scope.descriptions[i];
    }
    return false;
  };

  // click to like or unlike a listing
  $scope.likeListing = function(listing) {
    Like.likeAction(listing._id).success(function(result) {
      // console.log(result);
      // check if the current user has liked the item
      listing.liked = !listing.liked;
      listing.likes= result.likes;
    });
  };

  $scope.postTitle = function(title) {
    if (title.length > 35) {
      return title.slice(1, 34) + "...";
    } else {
      return title;
    }
  }

});
