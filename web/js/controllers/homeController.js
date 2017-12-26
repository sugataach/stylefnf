angular.module('Haberdashery')
  .controller('homeController', function($scope, $animate, $mdDialog, $sce, $auth, $route, Socket, Search, Like, $location, $rootScope, $filter, HoverProfile) {

  // staff picks
  Search.getFeaturedPosts()
    .success(function(data) {
      $scope.featuredPost = data;
  });

  // popular posts
  Search.getAll('sort=popular')
    .success(function(data) {
        $scope.popularPosts = data['results'].slice(0,3);
  });

  // trending posts
  Search.getAll('sort=trending')
    .success(function(data) {
        $scope.trendingPosts = data['results'].slice(0,3);
  });

  // trending users
  Search.getFeaturedUsers()
    .success(function(data) {
      $scope.featuredUsers = data;
      // console.log(data);
  });

  $scope.isAuthenticated = function() {
    // check if logged in
    return ($auth.isAuthenticated() && $rootScope.currentUser.isComplete);
  };

  if (!$auth.isAuthenticated()) {
    $location.path('/');
  }

  $scope.logout = function() {
    $auth.logout();
    delete $window.localStorage.currentUser;
    delete $window.cookies;
    // $location.path('#/');
    $route.reload();
    toaster.pop('success', "Logged out successfully.");
  };

  $scope.hovercardURL = '../../views/partials/hoverProfile.html';

  $scope.hoverProfileIn = function(seller) {
    // console.log('hoverIn');
    $rootScope.hoverProfile = seller;
  };

  $scope.hoverProfileOut = function() {
    console.log('hoverOut');
    $rootScope.hoverProfile = undefined;
  };

  function getElementOffset(element)
  {
      var de = document.documentElement;
      var box = element.getBoundingClientRect();
      var top = box.top + window.pageYOffset - de.clientTop;
      var left = box.left + window.pageXOffset - de.clientLeft;
      return { top: top, left: left };
  }

  // console.log($scope.isAuthenticated());

  $scope.myInterval = 5000;
  var slides = $scope.slides = [
    {
      hero: 'Share your style.',
      // text: 'Buy and sell at U of T',
      // image: 'img/clothes2-compressed2.jpeg',
      // image: 'img/uoft_media.jpg',
      image: 'img/main_page2.jpg',
      text: 'Buy and sell fashion with students at U of T.',
      style: '{}}',
      // image: 'img/shoes-comp2.jpg',
      button: 'Sign Up Now',
      link: '#/signup'
    },
    {
      hero: 'Now available for U of T students and alumni.',
      // text: 'Buy and sell at U of T',
      // image: 'img/clothes2-compressed2.jpeg',
      // image: 'img/uoft_media.jpg',
      image: 'img/mega_uoftCOM.jpg',
      text: 'Sign up using your UToronto email.',
      // image: 'img/shoes-comp2.jpg',
      button: 'Sign Up Now',
      link: '#/signup'
    },
    // {
    //   image: 'img/phone-comp.jpg',
    //   hero: 'Share clothing on the go.',
    //   text: 'Available for U of T students and alumni',
    //   button: 'Download it Now',
    //   link: 'https://play.google.com/store/apps/details?id=com.ionicframework.haberdashery311580&hl=en'
    // }
  ];

  $scope.verticalTabs = {
    active: 0
  };


  $scope.likePost = function(post, typeOfPost) {

    Like.likeAction(post._id).success(function(result) {

      if (typeOfPost == "trending") {
        for (var i = 0; i < $scope.trendingPosts.length; i++) {
          var currPost = $scope.trendingPosts[i];
          if (currPost._id == post._id) {
            // console.log('result and currPost are identical');
            // console.log(currPost._id == result._id);
            $scope.trendingPosts[i] = result;
            // console.log('foundit');
            // console.log(i);
            // console.log($scope.posts);
            return $scope.trendingPosts;
          }
        }
      }
      else if (typeOfPost == "popular"){
        for (var i = 0; i < $scope.popularPosts.length; i++) {
          var currPost = $scope.popularPosts[i];
          if (currPost._id == post._id) {
            // console.log('result and currPost are identical');
            // console.log(currPost._id == result._id);
            $scope.popularPosts[i] = result;
            // console.log('foundit');
            // console.log(i);
            // console.log($scope.posts);
            return $scope.popularPosts;
          }
        }
      }
      else if (typeOfPost == "featured"){
        for (var i = 0; i < $scope.featuredPost.length; i++) {
          var currPost = $scope.featuredPost[i];
          if (currPost._id == post._id) {
            // console.log('result and currPost are identical');
            // console.log(currPost._id == result._id);
            $scope.featuredPost[i] = result;
            // console.log('foundit');
            // console.log(i);
            // console.log($scope.posts);
            return $scope.featuredPost;
          }
        }
      }
      // console.log($scope.search_posts);
    });
  };

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

  $scope.myLike = function(likes) {
    // console.log(likes);
    // console.log(likes);
    return Like.hasDetailLiked(likes);
  };

  $scope.usersLiked = function(likes) {
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

  $scope.goToPath = function(name) {
    $location.path('/help/' + name);
  };

  $scope.showLiked = function(ev, post) {
    // when you click the update my listing button, you set the post to a global var
    // console.log('post');
    // console.log(post);
    /* ------------SUPER HACK-----------------
    Don't use rootScope to save a variable
    TODO: Change to service
    -----------------------------------------*/
    $rootScope.selectedHomePost = post;
    // console.log('clicked show likes');
    // console.log($scope.selectedBrowsePost.likes);

    if ($auth.isAuthenticated()) {
      // $scope.selectedBrowsePost = post;
        $mdDialog.show({
          controller: PostCtrl,
          templateUrl: '../../views/partials/homeLiked.html',
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
          // $scope.alert = 'You cancelled the dialog.';
        });
    }
    else {
      $location.path('/login');
    }
  };

  $scope.goToLink = function(postID, type) {
    // console.log(postID);
    if (type == "post") {
      $location.path('/detail/' + postID);
    }
    else {
      console.log(postID);
      $location.path('/profile/' + postID._id);
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

  $scope.showCondition = function(cond) {

    var conditions = [
      {value: 'used', text: 'Gently Used'},
      {value: 'new', text: 'New (with tags)'},
      {value: 'likenew', text: 'Like New (no tags)'},
    ];
    var selected = $filter('filter')(conditions, {value: cond});
    return (cond && selected.length) ? selected[0].text : 'Not set';
  };

  // SEO REQUIREMENT: 
  // PhantomJS pre-rendering workflow requires the page to declare, through htmlReady(), that
  // we are finished with this controller. 
  // $scope.htmlReady();

});