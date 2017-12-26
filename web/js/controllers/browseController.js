'use strict';

angular.module('Haberdashery')
  .controller('browseController', function(
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
              Like,
              Search,
              $animate,
              $mdDialog,
              HoverProfile,
              $mdToast,
              $anchorScroll,
              $filter
  ) {

    $scope.goToTop = function() {
      $location.hash('search-results');
      $anchorScroll();
    };

    $scope.isLoading = false;

    $scope.categoryPopoverOpen = false;
    $scope.homeFurnitureCategoryPopoverOpen = false;
    $scope.electronicsCategoryPopoverOpen = false;
    $scope.textbooksCategoryPopoverOpen = false;
    $scope.sortPopoverOpen = false;
    $scope.macroPopoverOpen = false;
    $scope.genderPopoverOpen = false;

    $scope.category_dict = {
      "All Categories": {label: 'All Categories', link:""},
      "tops": {label: 'Tops', link:'tops'},
      "dresses": {label: 'Dresses', link:'dresses'},
      "jackets": {label: 'Jackets', link:'jackets'},
      "bottoms": {label: 'Bottoms', link:'bottoms'},
      "athletic": {label: 'Athletic', link:'athletic'},
      "bags": {label: 'Bags', link:'bags'},
      "shoes": {label: 'Shoes', link:'shoes'},
      "jewelry": {label: 'Jewelry', link:'jewelry'},
      "beauty": {label: 'Beauty', link:'beauty'},
      "hats": {label: 'Hats', link:'hats'},
      "accessories": {label: 'Accessories', link:'accessories'},
      "other": {label: 'Other', link:'other'},
    };

    $scope.homeFurnitureCategory_dict = {
      "All Categories": {label: 'All Categories', link:""},
      "sofaschairs": {label: 'Sofas & Chairs', link:'sofaschairs'},
      "tables": {label: 'Tables', link:'tables'},
      "dresserswardrobes": {label: 'Dressers', link:'dresserswardrobes'},
      "bedroom": {label: 'Bedroom', link:'bedroom'},
      "lighting": {label: 'Lighting', link:'lighting'},
      "bathroom": {label: 'Bathroom', link:'bathroom'},
      "outdoors": {label: 'Outdoors', link:'outdoors'},
      "cookware": {label: 'Cookware', link:'cookware'},
      "accessories": {label: 'Accessories', link:'accessories'},
      "kitchenapps": {label: 'Appliances', link:'kitchenapps'},
      "laundry": {label: 'Laundry', link:'laundry'},
      "other": {label: 'Other', link:'other'}
    };

    $scope.electronicsCategory_dict = {
      "All Categories": {label: 'All Categories', link:""},
      "phones": {label: 'Phones', link:'phones'},
      "computers": {label: 'Computers', link:'computers'},
      "tvsmonitors": {label: 'TVs & Monitors', link:'tvsmonitors'},
      "audio": {label: 'Audio & Headphones', link:'audio'},
      "gaming": {label: 'Gaming', link:'gaming'},
      "caracc": {label: 'Car Accessories', link:'caracc'},
      "cables": {label: 'Cables & Adapters', link:'cables'},
      "photography": {label: 'Photography', link:'photography'},
      "other": {label: 'Other', link:'other'}
    };

    $scope.textbooksCategory_dict = {
      "All Categories": {label: 'All Categories', link:""},
      "arts": {label: 'Arts', link:'arts'},
      "science": {label: 'Science', link:'science'},
      "commerce": {label: 'Commerce', link:'Commerce'},
      "engineering": {label: 'Engineering', link:'engineering'},
      "kinesiology": {label: 'Kinesiology', link:'kinesiology'},
      "medicine": {label: 'Medicine', link:'medicine'},
      "law": {label: 'Law', link:'law'},
      "music": {label: 'Music', link:'music'},
      "nursing": {label: 'Nursing', link:'nursing'},
      "pharmacy": {label: 'Pharmacy', link:'pharmacy'},
      "other": {label: 'Other', link:'other'}
    };

    $scope.sort_dict = {
      "newest": {label: 'Newest', link:"newest"},
      "popular": {label: 'Popular', link:'popular'},
      "pricehightolow": {label: 'Price (High to Low)', link:'pricehightolow'},
      "pricelowtohigh" : {label: 'Price (Low to High)', link:'pricelowtohigh'},
      "trending": {label: 'Trending', link:'trending'},
    };

    $scope.macro_dict = {
      "All": {label: 'All', link:""},
      "fashion": {label: 'Fashion', link:'fashion'},
      "homefurniture": {label: 'Home & Furniture', link:'homefurniture'},
      "electronics": {label: 'Electronics', link:'electronics'},
      "textbooks": {label: 'Textbooks', link:'textbooks'},
      "other" : {label: 'Other', link:'other'}
    };

    $scope.gender_dict = {
      "Any": {label: 'Everyone', link:""},
      "Men": {label: 'Men', link:'Men'},
      "Women": {label: 'Women', link:'Women'},
    };

    $scope.categoryPopover = {
      templateUrl: 'categoryDropdown.html',
    };

    $scope.homeFurnitureCategoryPopover = {
      templateUrl: 'homeFurnitureCategoryDropdown.html',
    };

    $scope.electronicsCategoryPopover = {
      templateUrl: 'electronicsCategoryDropdown.html',
    };

    $scope.textbooksCategoryPopover = {
      templateUrl: 'textbooksCategoryDropdown.html',
    };

    $scope.sortPopover = {
      templateUrl: 'sortDropdown.html',
    };

    $scope.macroPopover = {
      templateUrl: 'macroDropdown.html',
    };

    $scope.genderPopover = {
      templateUrl: 'genderDropdown.html',
    };

    $scope.isAuthenticated = function() {
      // check if logged in
      return ($auth.isAuthenticated() && $rootScope.currentUser.isComplete);
    };

    // $scope.isAvailable = function(post) {
    //   return Post.isAvailable(post);
    // };

    // $scope.isBuyer = function(post) {
    //   return Post.isBuyer(post);
    // };

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

    $scope.goToLink = function(postID, type) {
      // console.log(postID);
      if (type == "post") {
        $location.path('/detail/' + postID);
      }
      else {
        // console.log(postID);
        $location.path('/profile/' + postID._id);
      }
    };

    $scope.toggleLeft = buildToggler('left');
    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
              .then(function () {
                $log.debug("toggle " + navID + " is done");
              });
          },300);
      return debounceFn;
    }

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









    $scope.searchPost = '';
    $scope.seeMore = false;
    $scope.morePosts = [];
    $scope.itemsOnScreen;
    $scope.isEmptyResults = false;
    $scope.displayMorePosts = [];
    $scope.totalItems = 0;
    var searchQuery = $routeParams.searchQuery;
    $scope.currQuery = $routeParams.searchQuery;

    // On page load
    if(searchQuery) {
      console.log('execute the initial search');
      Search.getAll(searchQuery)
        .success(function(data) {
            // $scope.posts = data;
            // console.log(data);
            $scope.posts = data['results'];
            $scope.currQuery = data['query_map'];
            $scope.totalItems = data["total_items"];

            $scope.isFashion = function() {
              // console.log($scope.currQuery.macro);
              return ($scope.currQuery.macro == 'fashion');
            };

            $scope.isHomeFurniture = function() {
              // console.log($scope.currQuery.macro);
              return ($scope.currQuery.macro == 'homefurniture');
            };

            $scope.isElectronics = function() {
              // console.log($scope.currQuery.macro);
              return ($scope.currQuery.macro == 'electronics');
            };

            $scope.isTextbooks = function() {
              // console.log($scope.currQuery.macro);
              return ($scope.currQuery.macro == 'textbooks');
            };
            
            // reset infinite scroll
            $scope.morePosts = [];
            $scope.seeMore = false;
            $scope.itemsOnScreen = $scope.posts.length;

            // console.log('all items on screen : ' + $scope.itemsOnScreen);
            // console.log('all items from query: ' + $scope.totalItems);

            // make the current category "All Categories"
            // use reverse lookup
            if (!$scope.currQuery.hasOwnProperty("category")) {
              if ($scope.isFashion()) {
                $scope.currCategory = $scope.category_dict["All Categories"]["label"];
              }
              else if ($scope.isHomeFurniture()) {
                $scope.currCategory = $scope.homeFurnitureCategory_dict["All Categories"]["label"];
              }
              else if ($scope.isElectronics()) {
                $scope.currCategory = $scope.electronicsCategory_dict["All Categories"]["label"];
              }
              else if ($scope.isTextbooks()) {
                $scope.currCategory = $scope.textbooksCategory_dict["All Categories"]["label"];
              }
            }
            else if ($scope.currQuery["category"] != undefined) {
              if ($scope.isFashion()) {
                $scope.currCategory = $scope.category_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isHomeFurniture()) {
                $scope.currCategory = $scope.homeFurnitureCategory_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isElectronics()) {
                $scope.currCategory = $scope.electronicsCategory_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isTextbooks()) {
                $scope.currCategory = $scope.textbooksCategory_dict[$scope.currQuery["category"]]["label"];
              }
              // console.log($scope.currQuery);
            }

            if (!$scope.currQuery.hasOwnProperty("macro")) {
              $scope.currMacro = $scope.macro_dict["All"]["label"];
            }
            else if ($scope.currQuery["macro"] != undefined) {
              $scope.currMacro = $scope.macro_dict[$scope.currQuery["macro"]]["label"];
              // console.log($scope.currQuery);
            }

            if (!$scope.currQuery.hasOwnProperty("gender")) {
              $scope.currGender = $scope.gender_dict["Any"]["label"];
            }
            else if ($scope.currQuery["gender"] != undefined) {
              $scope.currGender = $scope.gender_dict[$scope.currQuery["gender"]]["label"];
              // console.log($scope.currQuery);
            }

            // $scope.currMacro = $scope.macro_dict[$scope.currQuery["macro"]]["label"];
            $scope.currSort = $scope.sort_dict[$scope.currQuery["sort"]]["label"];
        });
    }
    else {
      $location.path("/browse/macro=fashion&sort=newest");
    }


    // helper function to check if query has a search term
    $scope.queryHasTerm = function() {
      if ($scope.currQuery) {
        return $scope.currQuery.hasOwnProperty('term');
      }
      return false;
    };

    // function to remove a term from the search query
    // reason it's called "removeTerm" is because it was originally used to remove the search term, extended it to include any term
    $scope.removeTerm = function(removeQuery) {
      var newSearchQuery = "";

      // remove the term from the search query
      for (var key in $scope.currQuery) {
        if (key != removeQuery) {
          if (newSearchQuery.length > 0) {
            newSearchQuery = newSearchQuery + "&";
          }
          newSearchQuery = newSearchQuery.concat(key.toString() + "=" + $scope.currQuery[key]);
        }
      }
      // console.log(newSearchQuery);

      // search again and update the results
      Search.getAll(newSearchQuery)
        .success(function(data) {
            $scope.posts = data['results'];
            $scope.currQuery = data['query_map'];
            $scope.totalItems = data["total_items"];

            // reset infinite scroll
            $scope.morePosts = [];
            $scope.seeMore = false;
            $scope.itemsOnScreen = $scope.posts.length;


            if (!$scope.currQuery.hasOwnProperty("category")) {
              if ($scope.isFashion()) {
                $scope.currCategory = $scope.category_dict["All Categories"]["label"];
              }
              else if ($scope.isHomeFurniture()) {
                $scope.currCategory = $scope.homeFurnitureCategory_dict["All Categories"]["label"];
              }
              else if ($scope.isElectronics()) {
                $scope.currCategory = $scope.electronicsCategory_dict["All Categories"]["label"];
              }
              else if ($scope.isTextbooks()) {
                $scope.currCategory = $scope.textbooksCategory_dict["All Categories"]["label"];
              }
            }
            else if ($scope.currQuery["category"] != undefined) {
              if ($scope.isFashion()) {
                $scope.currCategory = $scope.category_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isHomeFurniture()) {
                $scope.currCategory = $scope.homeFurnitureCategory_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isElectronics()) {
                $scope.currCategory = $scope.electronicsCategory_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isTextbooks()) {
                $scope.currCategory = $scope.textbooksCategory_dict[$scope.currQuery["category"]]["label"];
              }
              // console.log($scope.currQuery);
            }

            if (!$scope.currQuery.hasOwnProperty("macro")) {
              $scope.currMacro = $scope.macro_dict["All"]["label"];
            }
            else if ($scope.currQuery["macro"] != undefined) {
              $scope.currMacro = $scope.macro_dict[$scope.currQuery["macro"]]["label"];
              // console.log($scope.currQuery);
            }

            if (!$scope.currQuery.hasOwnProperty("gender")) {
              $scope.currGender = $scope.gender_dict["Any"]["label"];
            }
            else if ($scope.currQuery["gender"] != undefined) {
              $scope.currGender = $scope.gender_dict[$scope.currQuery["gender"]]["label"];
              // console.log($scope.currQuery);
            }

            // $scope.currMacro = $scope.macro_dict[$scope.currQuery["macro"]]["label"];
            $scope.currSort = $scope.sort_dict[$scope.currQuery["sort"]]["label"];
      });

      // console.log('all items on screen : ' + $scope.itemsOnScreen);
      // console.log('all items from query: ' + $scope.totalItems);

      // update the URL
      $location.path('/browse/' + newSearchQuery, false);
    }


    // function to help change the query from a dropdown select
    $scope.changeQuery = function(typeOfParam, addQuery) {
      console.log(addQuery);
      console.log(typeOfParam);
      var newSearchQuery = "";

      if (addQuery == "") {
        $scope.removeTerm(typeOfParam);
      }
      else {
        // check through the keys of current search query
        for (var key in $scope.currQuery) {

          // if the key exists, change the value
          if (key == typeOfParam && addQuery != "") {
            $scope.currQuery[key] = addQuery;
            // console.log('added stuff!');
          }

          if (typeOfParam == "macro" && key == "category") {
            continue
          }
          else {
            // keep adding the keys to form search query
            // console.log(newSearchQuery.length > 0);
            if (newSearchQuery.length > 0) {
              newSearchQuery = newSearchQuery + "&";
            }
            newSearchQuery = newSearchQuery.concat(key.toString() + "=" + $scope.currQuery[key]);
          }
        }

        // if the new search query doesn't have the search param in it, keep
        if (newSearchQuery.indexOf(typeOfParam) == -1 && addQuery != "") {
          if (newSearchQuery.length > 0) {
            newSearchQuery = newSearchQuery + "&";
          }
          newSearchQuery = newSearchQuery.concat(typeOfParam + "=" + addQuery);
        }

        // if (typeOfParam == 'macro') {
        //   // if (addQuery = "") {
        //   //   console.log('empty addQuery');
        //   // }
        //   newSearchQuery = typeOfParam + "=" + addQuery;
        //   console.log('changing query');
        //   console.log(newSearchQuery);
        // }
        // console.log(newSearchQuery);

        // search again and update the results
        Search.getAll(newSearchQuery)
          .success(function(data) {
            $scope.posts = data['results'];
            $scope.currQuery = data['query_map'];
            $scope.totalItems = data["total_items"];

            // reset infinite scroll
            $scope.morePosts = [];
            $scope.seeMore = false;
            $scope.itemsOnScreen = $scope.posts.length;
            
            if (!$scope.currQuery.hasOwnProperty("category")) {
              if ($scope.isFashion()) {
                $scope.currCategory = $scope.category_dict["All Categories"]["label"];
              }
              else if ($scope.isHomeFurniture()) {
                $scope.currCategory = $scope.homeFurnitureCategory_dict["All Categories"]["label"];
              }
              else if ($scope.isElectronics()) {
                $scope.currCategory = $scope.electronicsCategory_dict["All Categories"]["label"];
              }
              else if ($scope.isTextbooks()) {
                $scope.currCategory = $scope.textbooksCategory_dict["All Categories"]["label"];
              }
            }
            else if ($scope.currQuery["category"] != undefined) {
              if ($scope.isFashion()) {
                $scope.currCategory = $scope.category_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isHomeFurniture()) {
                $scope.currCategory = $scope.homeFurnitureCategory_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isElectronics()) {
                $scope.currCategory = $scope.electronicsCategory_dict[$scope.currQuery["category"]]["label"];
              }
              else if ($scope.isTextbooks()) {
                $scope.currCategory = $scope.textbooksCategory_dict[$scope.currQuery["category"]]["label"];
              }
              // console.log($scope.currQuery);
            }

            if (!$scope.currQuery.hasOwnProperty("macro")) {
              $scope.currMacro = $scope.macro_dict["All"]["label"];
            }
            else if ($scope.currQuery["macro"] != undefined) {
              $scope.currMacro = $scope.macro_dict[$scope.currQuery["macro"]]["label"];
              // console.log($scope.currQuery);
            }

            if (!$scope.currQuery.hasOwnProperty("gender")) {
              $scope.currGender = $scope.gender_dict["Any"]["label"];
            }
            else if ($scope.currQuery["gender"] != undefined) {
              $scope.currGender = $scope.gender_dict[$scope.currQuery["gender"]]["label"];
              // console.log($scope.currQuery);
            }

            // $scope.currMacro = $scope.macro_dict[$scope.currQuery["macro"]]["label"];
            $scope.currSort = $scope.sort_dict[$scope.currQuery["sort"]]["label"];
        });

        // console.log('all items on screen : ' + $scope.itemsOnScreen);
        // console.log('all items from query: ' + $scope.totalItems);

        // update the URL
        $location.path('/browse/' + newSearchQuery, false);
      }
    };

    $scope.clickedLoadMore = function() {
      $scope.seeMore = true;
      // console.log('clicked clickedLoadMore');
    };

    $scope.loadMore = function() {
      // console.log('loading more');
      $scope.isLoadingPosts = false;
      $scope.finishedLoadingAll = true;

      $scope.itemsOnScreen = $scope.posts.length + $scope.displayMorePosts.length;
      // console.log($scope.itemsOnScreen);
      
      // if all the items have not been loaded
      // posts will always contain 9 items
      // morePosts will have   
      if ($scope.itemsOnScreen < $scope.totalItems && $scope.finishedLoadingAll) {

        // console.log('execute updating items, ')
        // reconstruct the search query
        var oldQuery = "";

        // iterate thorugh currQuery map and build string
        for (var key in $scope.currQuery) {
            if (oldQuery.length > 0) {
              oldQuery = oldQuery + "&";
            }
            oldQuery = oldQuery.concat(key.toString() + "=" + $scope.currQuery[key]);
        }

        // add the seen ids
        var seenids = "";
        var seenidsArray = [];

        if ($scope.displayMorePosts.length > 0) {
          for (var i in $scope.displayMorePosts) {
            seenidsArray.push($scope.displayMorePosts[i]['_id']);
            seenids = seenids + $scope.displayMorePosts[i]['_id'] + " ";
          }
        }
        // console.log('seenids displayMorePosts ' + seenidsArray.length);

        for (var i in $scope.posts) {
            seenidsArray.push($scope.posts[i]['_id']);
            seenids = seenids + $scope.posts[i]['_id'] + " ";
        }
        // console.log('seenids after posts ' + seenidsArray.length);

        // console.log(seenids);
        // console.log(oldQuery);

        // search again and update the results
        Search.getAll(oldQuery, seenids)
          .success(function(data) {
            console.log(data);
            $scope.morePosts = data['results'];
            // $scope.finishedLoadingAll = false;
            $scope.finishedLoadingAll = false;
        });
      }
      else {
        $scope.finishedLoadingAll = true;
      }
      // return;
      
      if ($scope.morePosts) {

        if ($scope.displayMorePosts.length > 0) {
          // console.log('has displayposts ', $scope.morePosts);

          // add only items that haven't been added
          for (var v in $scope.morePosts) {

            var displayIds = getAllIds($scope.displayMorePosts);

            // if the item is not in the seenids array
            if (displayIds.indexOf($scope.morePosts[v]._id) == -1) {
              $scope.displayMorePosts.push($scope.morePosts[v]);
            }
          }
          // }
          // $scope.displayMorePosts = $scope.displayMorePosts.concat($scope.morePosts.slice(0, 9));
          
          $scope.itemsOnScreen = $scope.displayMorePosts.length + $scope.posts.length;
        }
        else {
          $scope.finishedLoadingAll = true;
          // console.log('no displayposts ', $scope.morePosts);
          console.log($scope.morePosts.length);
          $scope.displayMorePosts = $scope.displayMorePosts.concat($scope.morePosts);
          // $scope.displayMorePosts = $scope.displayMorePosts.concat($scope.morePosts.slice(0, 9));
          $scope.itemsOnScreen = $scope.displayMorePosts.length + $scope.posts.length;
        }





        // console.log('before render');
        // $scope.morePosts =  $scope.morePosts.slice(0, 9);

        // console.log($scope.itemsOnScreen);
        // console.log('render displayposts ', $scope.displayMorePosts);
      }
      $scope.isLoadingPosts = false;
    };

    function getAllIds(obj) {
      var Ids = [];
      for (var i = 0; i < obj.length; i++) {
        Ids.push(obj[i]._id);
      }
      return Ids;
    }











    $scope.likePost = function(post, isDisplayMore) {
      if (isDisplayMore === undefined) isDisplayMore = false;

      Like.likeAction(post._id).success(function(result) {
        // console.log('the result')
        // console.log(result);
        // console.log('result and post are identical');
        // console.log(post._id == result._id);

        if (isDisplayMore) {
          for (var i = 0; i < $scope.displayMorePosts.length; i++) {
            var currPost = $scope.displayMorePosts[i];
            if (currPost._id == post._id) {
              // console.log('result and currPost are identical');
              // console.log(currPost._id == result._id);
              $scope.displayMorePosts[i] = result;
              // console.log('foundit');
              // console.log(i);
              // console.log($scope.posts);
              return $scope.displayMorePosts;
            }
          }
        }
        else {
          for (var i = 0; i < $scope.posts.length; i++) {
            var currPost = $scope.posts[i];
            if (currPost._id == post._id) {
              // console.log('result and currPost are identical');
              // console.log(currPost._id == result._id);
              $scope.posts[i] = result;
              // console.log('foundit');
              // console.log(i);
              // console.log($scope.posts);
              return $scope.posts;
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

    $scope.hovercardURL = '../../views/partials/hoverProfile.html';

    $scope.hoverProfileIn = function(seller) {
      // console.log('hoverIn');
      $rootScope.hoverProfile = seller;
    };

    $scope.hoverProfileOut = function() {
      console.log('hoverOut');
      $rootScope.hoverProfile = undefined;
    };

    $scope.linkInstagram = function() {
      $auth.link('instagram')
      // connect email account with instagram
        .then(function(response) {
          $window.localStorage.currentUser = JSON.stringify(response.data.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          // API.getFeed().success(function(data) {
          //   $scope.photos = data;
          // });
        });
    };

    $scope.linkFacebook = function() {
      $auth.link('facebook')
      // connect email account with facebook
        .then(function(response) {
          $window.localStorage.currentUser = JSON.stringify(response.data.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          // API.getFeed().success(function(data) {
          //   $scope.photos = data;
          // });
        });
    };

    $scope.$on('$locationChangeStart', function(event) {
      $mdDialog.hide();
    });

    $scope.returnPolicies = [
      {value: 'No', text: 'No Returns'},
      {value: 'Maybe', text: 'Conditional Return'},
      {value: 'Hour', text: 'Within 24 hours'},
      {value: 'Day', text: 'Within 3 days'},
    ];

    $scope.showReturn = function(post) {
      var selected = $filter('filter')($scope.returnPolicies, {value: post.return});
      return (post.return && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.tryOnOptions = [
      {text: 'Yes', value: "Yes"},
      {text: 'No', value: "No"}
    ];

    $scope.showTryOnOptions = function(post) {
      if (post.ifTryOn == "Yes") {
        return "Yes";
      }
      else {
        var selected = $filter('filter')($scope.tryOnOptions, {value: post.ifTryOn});
        return (post.ifTryOn && selected.length) ? selected[0].text : 'Not set';
      }
    };

    $scope.genders = [
      {text: 'Women', value: "Women"},
      {text: 'Men', value: "Men"},
      {text: 'Any', value: "Any"}
    ];

    $scope.showGender = function(post) {
      if (post.gender == "Men") {
        return "Men";
      }
      else {
        var selected = $filter('filter')($scope.genders, {value: post.gender});
        return (post.gender && selected.length) ? selected[0].text : 'Not set';
      }
    };

    $scope.showLiked = function(ev, post) {
      // when you click the update my listing button, you set the post to a global var
      // console.log('post');
      // console.log(post);
      /* ------------SUPER HACK-----------------
      Don't use rootScope to save a variable
      TODO: Change to service
      -----------------------------------------*/
      $rootScope.selectedBrowsePost = post;
      // console.log('clicked show likes');
      // console.log($scope.selectedBrowsePost.likes);

      if ($auth.isAuthenticated()) {
        // $scope.selectedBrowsePost = post;
          $mdDialog.show({
            controller: PostCtrl,
            templateUrl: '../../views/partials/browseliked.html',
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



    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };

    $scope.categories = [
      'New Arrivals',
      'Dresses',
      'Tops',
      'Denim',
      'Bottoms',
      'Sweater',
      'Outerwear',
      'Shoes',
      'Handbags',
      'Accessories',
    ];

    $scope.categoryData = [
      { label: 'New Arrivals', value: "cat=newarrivals" },
      { label: 'Dresses', value: "cat=dresses" },
      { label: 'Tops', value: "cat=tops" },
      { label: 'Denim', value: "cat=denim" },
      { label: 'Bottoms', value: "cat=bottoms" },
      { label: 'Sweaters', value: "cat=sweaters" },
      { label: 'Outerwear', value: "cat=outerwear" },
      { label: 'Shoes', value: "cat=shoes" },
      { label: 'Bags', value: "cat=bags" },
    ];

    $scope.sizes = [
      'XS',
      'S',
      'M',
      'L',
      'XL',
      'XXL',
    ];

    $scope.sizeData = [
      { label: 'XS', value: "sz=xs" },
      { label: 'S', value: "sz=s" },
      { label: 'M', value: "sz=m" },
      { label: 'L', value: "sz=l" },
      { label: 'XL', value: "sz=xl" },

    ];

    $scope.priceData = [
      { label: 'Under $25', value: "pgt=5&plt=25" },
      { label: '$25 to $50', value: "pgt=25&plt=50" },
      { label: '$50 to $100', value: "pgt=50&plt=100" },
      { label: '$100 to $200', value: "pgt=100&plt=200" },
      { label: '$200 and up', value: "pgt=200&plt=5000" }
    ];

    $scope.conditionData = [
      { label: 'New with tags', value: "con=new"},
      { label: 'Like New', value: "con=likenew"},
      { label: 'Gently Used', value: "con=used"}
    ];

    $scope.discountData = [
      { label: '30% Off or More', value: {gt: 5, lt: 25 }},
      { label: '50% Off or More', value: {gt: 25, lt: 50 }},
      { label: '75% Off or More', value: {gt: 50, lt: 100 }},
      { label: '90% Off or More', value: {gt: 100, lt: 200 } }
    ];

    $scope.conditionData = [
      { label: 'Men', value: "gender="},
      { label: 'Women', value: "Women"}
    ];

    $scope.selected = [];
    
    $scope.toggle = function (item, list) {
      var idx = list.indexOf(item);
      if (idx > -1) list.splice(idx, 1);
      else list.push(item);
      // console.log(list);
    };

    $scope.exists = function (item, list) {
      // console.log(list);
      return list.indexOf(item) > -1;
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
  // .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {


  //   $scope.close = function () {
  //     $mdSidenav('left').close()
  //       .then(function () {
  //         $log.debug("close RIGHT is done");
  //       });
  //   };

    
  // });

function PostCtrl($scope, $mdDialog) {

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