angular.module('Stylefnf')
.controller('searchController', function($scope, Search, $state, $location, $ionicModal, Like, $ionicPosition, $ionicScrollDelegate) {

  // category dictionaries
  $scope.category_dict = {
    availableOptions: [
      {label: 'All Categories', val:""},
      {label: 'Tops', val:'tops'},
      {label: 'Dresses', val:'dresses'},
      {label: 'Jeans', val:'jeans'},
      {label: 'Outerwear', val:'outerwear'},
      {label: 'Bottoms', val:'bottoms'},
      {label: 'Sports', val:'sports'},
      {label: 'Formal', val:'formal'},
      {label: 'Bags', val:'bags'},
      {label: 'Shoes', val:'shoes'},
      {label: 'Jewelry', val:'jewelry'},
      {label: 'Wallets', val:'wallets'},
      {label: 'Hats', val:'hats'},
      {label: 'Accessories', val:'accessories'},
      {label: 'Miscellaneous', val:'miscellaneous'}
    ],
    selectedOption: {val:""} //This sets the default value of the select in the ui
  };


  $scope.furnitureCategory_dict = {
    availableOptions: [
      {label: 'All Categories', val:""},
      {label: 'Sofas', val:'sofas'},
      {label: 'Chairs', val:'chairs'},
      {label: 'Tables', val:'tables'},
      {label: 'Dressers', val:'dressers'},
      {label: 'Beds', val:'beds'},
      {label: 'Storage', val:'storage'},
      {label: 'Accessories', val:'accessories'},
      {label: 'Miscellaneous', val:'miscellaneous'}
    ],
    selectedOption: {val: ''}
  };

  $scope.homeKitchenCategory_dict = {
    availableOptions: [
      {label: 'All Categories', val:''},
      {label: 'Decor', val:'decor'},
      {label: 'Cleaning & Waste', val:'waste'},
      {label: 'Lighting', val:'lighting'},
      {label: 'Bathroom', val:'bathroom'},
      {label: 'Outdoors', val:'outdoors'},
      {label: 'Electronics', val:'electronics'},
      {label: 'Cookware', val:'cookware'},
      {label: 'Appliances', val:'appliances'},
      {label: 'Kitchen Appliances', val:'kappliances'},
      {label: 'Miscellaneous', val:'miscellaneous'}
    ],
    selectedOption: {val: ""}
  };

  $scope.sort_dict = {
    availableOptions: [
      {label: 'Newest', val:'newest'},
      {label: 'Popular', val:'popular'},
      {label: 'Price (High to Low)', val:'pricehightolow'},
      {label: 'Price (Low to High)', val:'pricelowtohigh'},
      {label: 'Trending', val:'trending'},
    ],
    selectedOption: {val: "newest"}
  };

  $scope.macro_dict = {
    availableOptions: [
      {label: 'All', val:''},
      {label: 'Fashion', val:'fashion'},
      {label: 'Home & Furniture', val:'homefurniture'},
      {label: 'Electronics', val:'electronics'},
      {label: 'Other', val:'other'}
      // {label: 'Furniture', val:'furniture'},
      // {label: 'Home & Kitchen', val:'homekitchen'},
    ],
    selectedOption: {val: ""}
  };

  $scope.gender_dict = {
    availableOptions: [
      {label: 'Everyone', val:''},
      {label: 'Men', val:'Men'},
      {label: 'Women', val:'Women'},
    ],
    selectedOption: {val: ""}
  };

  // search variables
  $scope.currIndex = 0;
  $scope.isSearch = false;
  $scope.searchData = {};
  $scope.searchTerm;
  $scope.posts = [];
  $scope.total_listings = 0;

  $scope.people = [];
  $scope.total_people = 0;

  $scope.allPostsLoaded = false;
  $scope.currSearchQuery = '';
  var seenids = "";
  var seenidsArray = [];

  $scope.isFashion = false;

  $scope.isHomeFurniture = false;
  $scope.isElectronics = false;
  $scope.isTextbooks = false;
  $scope.isOther = false;

  // category modal
  $ionicModal.fromTemplateUrl('category-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.showCategories = function() {
    // console.log('show modal');
    // $ionicSlideBoxDelegate.slide(0);
    $scope.modal.show();
    // $ionicSlideBoxDelegate.slide($scope.index);
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.checkIsFashion = function(){

    if($scope.macro_dict.selectedOption.val == "fashion"){
      return true;
    } else {
      return false;
    }
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hide', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
  $scope.$on('modal.shown', function() {
    // console.log('Modal is shown!');
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

  // actually load the search
  function loadSearchResults(searchTerm, seenids, callback) {
    // console.log(seenids);

    Search.getAll(searchTerm, seenids)
      .success(function(data) {

        // save the current search query
        $scope.currSearchQuery = searchTerm;

        //console.log(data);
        var posts = [];
        angular.forEach(data['results'], function(child) {
          posts.push(child);
        });
        callback(posts, data['total_items']);
    });

  }

  // actually load the search
  function loadPeopleSearchResults(searchTerm, callback) {
    // console.log(seenids);

    Search.getAllUsers(searchTerm)
      .success(function(data) {

        // save the current search query
        $scope.currSearchQuery = searchTerm;

        // console.log(data);
        var people = [];
        angular.forEach(data['results'], function(child) {
          people.push(child);
        });
        callback(people, people.length);
    });

  }

  function createSeachQuery(query) {
    for (var key in $scope.currSearchQuery) {
      // if the key exists, change the value
      if (key == typeOfParam && addQuery != "") {
        $scope.currSearchQuery[key] = addQuery;
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
  }

  $scope.onSearchClick = function() {
    $scope.isSearch = true;
  };


  $scope.searchFilterResults = function(){

    var userInput = "";
    var macro = "";
    var category = "";
    var gender = "";

    if($scope.searchData.searchText != undefined){
      userInput = 'term=' + $scope.searchData.searchText;
    }

    if($scope.macro_dict.selectedOption.val != ""){
      macro = "&macro=" + $scope.macro_dict.selectedOption.val;
    }

    if($scope.category_dict.selectedOption.val != ""){
      category = "&category=" + $scope.category_dict.selectedOption.val;
    }

    if($scope.gender_dict.selectedOption.val != ""){
      // console.log("j");
      gender = "&gender=" + $scope.gender_dict.selectedOption.val;
    }

    $scope.modal.hide();

    var searchTerm = userInput + "&sort=" + $scope.sort_dict.selectedOption.val + macro + category + gender;


    seenids = "";
    seenidsArray = [];

    // execute listing search
    loadSearchResults(searchTerm, seenids, function(newPosts, total_items) {

        $scope.posts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
        $scope.total_listings = total_items;
        // console.log($scope.posts);
        // if (total_items == 0) {
        //   $scope.allPostsLoaded = true;
        // }
      });

  }
  $scope.change = function(){

    var searchTerm = 'term=' + $scope.searchData.searchText;
    // $scope.userSearchTerm = input;
    // var searchTerm = '';
    seenids = "";
    seenidsArray = [];

    // execute listing search
    loadSearchResults(searchTerm, seenids, function(newPosts, total_items) {


        $scope.posts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
        $scope.total_listings = total_items;
        // if (total_items == 0) {
        //   $scope.allPostsLoaded = true;
        // }
      });

    // execute people search
    loadPeopleSearchResults(searchTerm, function(newPeople, total_items) {

        $scope.people = newPeople;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPeopleLoaded = false;
        $scope.total_people = total_items;
    });
  };

  $scope.loadMore = function() {
    if ($scope.posts.length > 0) {
      for (var i in $scope.posts) {
          seenidsArray.push($scope.posts[i]['_id']);
          seenids = seenids + $scope.posts[i]['_id'] + " ";
      }
    }
    loadSearchResults($scope.currSearchQuery, seenids, function(olderPosts, total_items) {

      $scope.posts = $scope.posts.concat(olderPosts);
      $scope.$broadcast('scroll.infiniteScrollComplete');

      if (total_items == 0) {
        $scope.allPostsLoaded = true;
      }
    });
  };

  $scope.loadImages = function() {

      // fashion posts
      Search.getAll('macro=fashion&sort=newest')
        .success(function(data) {
          $scope.fashionPosts = data['results'].slice(0,9);
      });

      // home furniture posts
      Search.getAll('macro=homefurniture&sort=newest')
        .success(function(data) {
          $scope.homeFurniturePosts = data['results'].slice(0,9);
      });

      // electronics posts
      Search.getAll('macro=electronics&sort=newest')
        .success(function(data) {
          $scope.electronicsPosts = data['results'].slice(0,9);
      });

      // textbooks posts
      Search.getAll('macro=textbooks&sort=newest')
        .success(function(data) {
          $scope.textbooksPosts = data['results'].slice(0,9);
      });

      // other posts
      Search.getAll('macro=other&sort=newest')
        .success(function(data) {
          $scope.otherPosts = data['results'].slice(0,9);
      });

      $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.testfeed = function(){
    var pos = $ionicPosition.position(angular.element(document.getElementById('e')));
    console.log(pos);
     $ionicScrollDelegate.$getByHandle('search-feed').scrollTo(0,900,true);
  }
  $scope.seeMoreFashion = function(index) {
    
    $scope.currIndex = index;
    $scope.isFashion = true;

    var searchTerm = 'macro=fashion&sort=newest';

    seenids = "";
    seenidsArray = [];

    loadSearchResults(searchTerm, seenids, function(newPosts, total_items) {

        $scope.posts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
        $scope.total_listings = total_items;

      });
  };

  $scope.seeMoreHomeFurniture = function(index) {
    $scope.currIndex = index;
    $scope.isHomeFurniture = true;

    var searchTerm = 'macro=homefurniture&sort=newest';

    seenids = "";
    seenidsArray = [];

    loadSearchResults(searchTerm, seenids, function(newPosts, total_items) {

        $scope.posts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
        $scope.total_listings = total_items;

      });
  };

  $scope.seeMoreElectronics = function(index) {
    $scope.currIndex = index;
    $scope.isElectronics = true;

    var searchTerm = 'macro=electronics&sort=newest';

    seenids = "";
    seenidsArray = [];

    loadSearchResults(searchTerm, seenids, function(newPosts, total_items) {

        $scope.posts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
        $scope.total_listings = total_items;

      });
  };

  $scope.seeMoreTextbooks = function(index) {
    $scope.currIndex = index;
    $scope.isTextbooks = true;

    var searchTerm = 'macro=textbooks&sort=newest';

    seenids = "";
    seenidsArray = [];

    loadSearchResults(searchTerm, seenids, function(newPosts, total_items) {

        $scope.posts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
        $scope.total_listings = total_items;

      });
  };

  $scope.seeMoreOther = function(index) {
    $scope.currIndex = index;
    $scope.isOther = true;

    var searchTerm = 'macro=other&sort=newest';

    seenids = "";
    seenidsArray = [];

    loadSearchResults(searchTerm, seenids, function(newPosts, total_items) {

        $scope.posts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
        $scope.total_listings = total_items;

      });
  };

  function loadPosts(seenids, searchTerm, callback) {
    // console.log(seenids);
    Search.getAll(searchTerm, seenids)
      .success(function(data) {
        var posts = [];
        //console.log(data);

        angular.forEach(data['results'], function(child) {
          // add a field to the listing
          // to check if the current user has liked it
          child['liked'] = Like.hasLiked(child['likes']);
          posts.push(child);
        });
        callback(posts, data['total_items']);
    });
  };

  $scope.getOlderPosts = function() {

    var searchTerm = 'sort=newest';
    if($scope.isFashion) {
      searchTerm = 'macro=fashion&sort=newest';
    } else if($scope.isHomeFurniture) { 
      searchTerm = 'macro=homefurniture&sort=newest';
    } else if($scope.isElectronics){
      searchTerm = 'macro=electronics&sort=newest';
    } else if($scope.isTextbooks) {
      searchTerm = 'macro=textbooks&sort=newest';
    } else if($scope.isOther) {
      searchTerm = 'macro=other&sort=newest';
    }

    if ($scope.posts.length > 0) {
      for (var i in $scope.posts) {
          seenidsArray.push($scope.posts[i]['_id']);
          seenids = seenids + $scope.posts[i]['_id'] + " ";
      }
    }

    console.log(searchTerm);
    loadPosts(seenids, searchTerm, function(olderPosts, total_items) {
      $scope.posts = $scope.posts.concat(olderPosts);
      $scope.$broadcast('scroll.infiniteScrollComplete');

      if (total_items == 0) {
        $scope.allPostsLoaded = true;
      }
    });
    
  };

  $scope.getNewerPosts = function() {

    seenids = "";
    seenidsArray = [];

    // if(topPost != undefined) {
    //   $scope.posts.push(topPost);
    //   seenids = seenids + topPost['_id'] + " ";
    //   seenidsArray.push(topPost['_id']);
    // }

    loadPosts(seenids, 'sort=newest', function(newPosts, total_items) {
        if(topPost != undefined) {
          $scope.posts = $scope.posts.concat(newPosts);
        }
        else {
          $scope.posts = newPosts;
        }
        $scope.$broadcast('scroll.refreshComplete');
        $scope.allPostsLoaded = false;
      });
      
  };

  // this function takes a route, which is the area to go to and the id of where to go
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

    if (route == "likes") {

      $state.go('tab.likes', {listingId: id});
    }
  };

  $scope.clearSearch = function() {
    $scope.searchData.searchText = "";
    $scope.posts = [];
    $scope.total_listings = 0;
    $scope.people = [];
    $scope.total_people = 0;
  };


  $scope.goBackToExplore = function() {
    $scope.isSearch = false;
    $scope.isFashion = false;
    $scope.isHomeFurniture = false;
    $scope.isElectronics = false;
    $scope.isTextbooks = false;
    $scope.isOther = false;

    $scope.clearSearch();
    $scope.loadImages();
  };

  $scope.$on('$locationChangeStart', function(event, next) {
    if ($scope.currearchQuery == "") {
      $scope.isSearch = false;
    }
  });

  $scope.likeListing = function(listing) {
    Like.likeAction(listing._id).success(function(result) {
      // console.log(result);
      // check if the current user has liked the item
      listing.liked = !listing.liked;
      listing.likes= result.likes;
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

  function loadMacroPosts(seenids, callback) {
    Search.getAll('sort=newest' + '&macro=other', seenids)
      .success(function(data) {
        var posts = [];
        angular.forEach(data['results'], function(child) {
          // add a field to the listing
          // to check if the current user has liked it
          child['liked'] = Like.hasLiked(child['likes']);
          posts.push(child);
        });
        callback(posts, data['total_items']);
    });
  };

  $scope.searchMacro = function() {
    seenids = "";
    loadMacroPosts(seenids, function(newPosts, total_items) {
        $scope.allPostsLoaded = false;
        $scope.testPosts = newPosts;
        $scope.$broadcast('scroll.refreshComplete');
      });
  }

});
