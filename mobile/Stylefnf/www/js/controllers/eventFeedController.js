angular.module('Stylefnf')
.controller('eventFeedController', function($scope, $auth, Search, $timeout, $state, $rootScope, currentUser, Like, Chat, $window, Socket) {

  if ($auth.isAuthenticated()) {
    $state.go('tab.feed');
  }

  $scope.pageTitle = "<div ng-click=\"goToChats()\" class=\"row row-center feed-row thin-row\"><img src=\"img/stylefnf.png\" class=\"top-logo\"><span style=\"flex: auto\"></span><i class=\"icon ion-android-mail positive badge-container\" style=\"font-size:30px;\"><span class=\"badge badge-assertive notif-badge\">{{newMessages}}</span></i></div>";

  // console.log(currentUser.getCurrentUser());


  $scope.posts = [];
  $scope.allPostsLoaded = false;
  var seenids = "";
  var seenidsArray = [];

  // get the most up to date user

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
      $scope.allPostsLoaded = true;
      // if (total_items == 0) {
      //   $scope.allPostsLoaded = true;
      // }
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

  $scope.getProfileAvatar = function(person) {
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


  $scope.goToLogin = function() {
    // $state.go('tab.chats');
    $state.go('login');
    // $location.path('/chats');
  };

  $scope.goToSignup = function() {
    // $state.go('tab.chats');
    $state.go('signup');
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

});
