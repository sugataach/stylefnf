'use strict';

angular.module('Haberdashery')
  .controller('navController', function(
              $scope, 
              $location, 
              $auth, 
              $window, 
              $cookies, 
              toaster, 
              Socket, 
              $animate, 
              $mdDialog, 
              $mdToast, 
              $route, 
              $mdSidenav, 
              $mdUtil,
              Post, 
              Like,
              Search,
              Chat,
              Profile,
              $anchorScroll,
              $timeout,
              $interval,
              $rootScope,
              $log,
              $templateCache,
              $filter) {

    // dump the template cache when the user exits the page
    function exitHandler() {
      // console.log('executehandler');
      // $window.localStorage.clear();
      $templateCache.removeAll();
    };
    angular.element($window).bind("beforeunload", exitHandler);

    if ($auth.isAuthenticated()) {
      Socket.emit('active', {id: $rootScope.currentUser._id} );
    }

    $scope.isAuthenticated = function() {

      // console.log($location.path());

      if ($location.path().indexOf('/forgot-password') > -1) {
        return false;
      }
      else {
        return ($auth.isAuthenticated() && $rootScope.currentUser.isComplete);
      }

      // console.log($auth.isAuthenticated());
      // console.log($rootScope.currentUser);
    };

    $rootScope.viewNotifs = function() {

      var titleString = '';
      var totalNotifs = 0;
      
      if ($scope.isAuthenticated()) {
        if ($rootScope.currentUser.unseenNotifications) {
          totalNotifs = $rootScope.currentUser.unseenNotifications.length
        } 
        if ($rootScope.new_msg_chats != undefined) {
          // console.log($rootScope.currentUser.unseenNotifications.length);
          // console.log($rootScope.currentUser.messageNotifications.length);

          totalNotifs += $rootScope.new_msg_chats.length;
          // console.log('totalNotifs = ' + totalNotifs);
        }
        if (totalNotifs > 0) {
            titleString = '(' + totalNotifs + ') ';
        }
      }

      return titleString;

      // if ($location.path().indexOf('/browse') > -1) {
      //   titleString = 'Browse Listings';
      // }
      // else if ($location.path().indexOf('/detail') > -1) {
      //   titleString = 'Browse Listings';
      // }
      // else if ($location.path().indexOf('/profile') > -1) {
      //   titleString = 'Browse Listings';
      // }

    };

    // console.log($scope.isAuthenticated());
    $scope.checkForChat = function(chat) {

      for(var i = 0; i < $rootScope.new_msg_chats.length; i++) {
        if(chat._id == $rootScope.new_msg_chats[i]._id)
          return i;
      }
      return -1;
    };    

    // MESSAGE NOTIFICATION
    Socket.on('new.message.received', function(sender, chatID) {

      if ($scope.isAuthenticated()) {
        // if there isn't a notifications array, we make one
        if ($rootScope.new_msg_chats == undefined) {
          $rootScope.new_msg_chats = [];
        }
        // we add our message if the chat thread isn't already there
        var exists_index = $scope.checkForChat(chat);
        if(exists_index == -1) {
        // if ($rootScope.new_msg_chats.indexOf(chatID) == -1) {
          $rootScope.new_msg_chats.push(chatID);
        }

        // TOAST STUFF
        $scope.messageSender = sender;
        $scope.goToMsg = function() {
          $location.path('/messages');
          $mdToast.hide();
        };
        $scope.closeNotif = function() {
          $mdToast.hide();
        };
        $mdToast.show({
          // controller: 'navController',
          scope: $scope,
          preserveScope: true,
          templateUrl: '../../views/partials/messageNotification.html',
          hideDelay: 3200,
        });
      }

    });

    // AN OFFER WAS MADE ON YOUR LISTING
    Socket.on('offer.made.notif', function(offer) {
      // console.log('offer made');
      // console.log(offer);

      if ($scope.isAuthenticated()) {

        // TOAST STUFF
        $scope.notifPic = offer.poster.profilePictures[0];

        // message body should be like this
        // Sugata commented on your listing Adidas White Shoes: "Awesome...".
        if ($rootScope.currentUser._id == offer.post.seller) {
          $scope.notifBody = offer.poster.firstName + ' made a $' + offer.total + ' offer on ' + offer.post.title + '.';
        }
        else {
          $scope.notifBody = offer.poster.firstName + ' made an offer on ' + offer.post.title + '.'
        }

        $scope.goToMsg = function() {
          $location.path('/detail/' + offer.post._id);
          $mdToast.hide();
        };
        $scope.closeNotif = function() {
          $mdToast.hide();
        };
        $mdToast.show({
          // controller: 'navController',
          scope: $scope,
          preserveScope: true,
          templateUrl: '../../views/partials/notification.html',
          hideDelay: 3200,
        });
      }

    });

    // LIKE MADE
    Socket.on('like.made.notif', function(like) {
      // console.log('like made');
      // console.log(like);

      if ($scope.isAuthenticated()) {

        // TOAST STUFF
        $scope.notifPic = like.user.profilePictures[0];

        // message body should be like this
        // Sugata commented on your listing Adidas White Shoes: "Awesome...".
        $scope.notifBody = like.user.firstName + ' liked ' + like.post.title + '.'

        $scope.goToMsg = function() {
          $location.path('/detail/' + like.post._id);
          $mdToast.hide();
        };
        $scope.closeNotif = function() {
          $mdToast.hide();
        };
        $mdToast.show({
          // controller: 'navController',
          scope: $scope,
          preserveScope: true,
          templateUrl: '../../views/partials/notification.html',
          hideDelay: 3200,
        });
      }
    });

    // NEW FOLLOWER
    Socket.on('new.follower.notif', function(follower) {
      // console.log('like made');
      // console.log(like);

      if ($scope.isAuthenticated()) {

        console.log(follower);

        // TOAST STUFF
        $scope.notifPic = follower.profilePictures[0];

        // message body should be like this
        // Sugata commented on your listing Adidas White Shoes: "Awesome...".
        $scope.notifBody = follower.firstName + ' started following you.';

        $scope.goToMsg = function() {
          $location.path('/profile/' + follower._id);
          $mdToast.hide();
        };
        $scope.closeNotif = function() {
          $mdToast.hide();
        };
        $mdToast.show({
          // controller: 'navController',
          scope: $scope,
          preserveScope: true,
          templateUrl: '../../views/partials/notification.html',
          hideDelay: 3200,
        });
      }
    });

    // COMMENT MADE
    Socket.on('comment.made.notif', function(comment) {
      // console.log('comment made');
      // console.log(comment);

      if ($scope.isAuthenticated()) {

        // TOAST STUFF
        var minifiedComment;

        if (comment.content[0].length > 20) {
          minifiedComment = comment.content[0].slice(0,20) + '...';
        }
        else {
          minifiedComment = comment.content[0];
        }

        $scope.notifPic = comment.poster.profilePictures[0];

        // message body should be like this
        // Sugata commented on your listing Adidas White Shoes: "Awesome...".
        $scope.notifBody = comment.poster.firstName + ' commented on ' + comment.post.title + ': ' + minifiedComment + ' .';

        $scope.goToMsg = function() {
          $location.path('/detail/' + comment.post._id);
          $mdToast.hide();
        };
        $scope.closeNotif = function() {
          $mdToast.hide();
        };
        $mdToast.show({
          // controller: 'navController',
          scope: $scope,
          preserveScope: true,
          templateUrl: '../../views/partials/notification.html',
          hideDelay: 3200,
        });
      }

    });

    // YOUR OFFER ACCEPTED
    Socket.on('yourOffer.accepted.notif', function(offer) {
      // console.log('offer accepted');
      // console.log(offer);

      // TOAST STUFF
      $scope.notifPic = offer.post.imageUrls[0];

      // message body should be like this
      // Sugata commented on your listing Adidas White Shoes: "Awesome...".
      $scope.notifBody = 'Your offer for ' + offer.post.title + ' was accepted!';

      $scope.goToMsg = function() {
        $location.path('/detail/' + offer.post._id);
        $mdToast.hide();
      };
      $scope.closeNotif = function() {
        $mdToast.hide();
      };
      $mdToast.show({
        // controller: 'navController',
        scope: $scope,
        preserveScope: true,
        templateUrl: '../../views/partials/notification.html',
        hideDelay: 3200,
      });
    });

    // THE LISTING WAS PLACED ON HOLD
    // AKA AN ITEM YOU OFFERED ON WAS TAKEN BY SOMEONE ELSE
    Socket.on('listing.held.notif', function(offer) {
      // console.log('listing held');
      // console.log(offer);

      // TOAST STUFF
      $scope.notifPic = offer.post.imageUrls[0];

      // message body should be like this
      // Sugata commented on your listing Adidas White Shoes: "Awesome...".
      $scope.notifBody = offer.post.title + ' was placed on hold.';

      $scope.goToMsg = function() {
        $location.path('/detail/' + offer.post._id);
        $mdToast.hide();
      };
      $scope.closeNotif = function() {
        $mdToast.hide();
      };
      $mdToast.show({
        // controller: 'navController',
        scope: $scope,
        preserveScope: true,
        templateUrl: '../../views/partials/notification.html',
        hideDelay: 3200,
      });
    });

    // YOUR OFFER REMOVED
    Socket.on('yourOffer.removed.notif', function(offer) {
      // console.log('offer removed');
      // console.log(offer);

      // TOAST STUFF
      $scope.notifPic = offer.post.imageUrls[0];

      // message body should be like this
      // Sugata commented on your listing Adidas White Shoes: "Awesome...".
      if (offer.poster._id == $rootScope.currentUser._id) {
        $scope.notifBody = 'Your offer for ' + offer.post.title + ' was cancelled.';
      }
      else {
        $scope.notifBody = offer.poster.firstName + ' cancelled their offer for ' + offer.post.title + '.';
      }

      $scope.goToMsg = function() {
        $location.path('/detail/' + offer.post._id);
        $mdToast.hide();
      };
      $scope.closeNotif = function() {
        $mdToast.hide();
      };
      $mdToast.show({
        // controller: 'navController',
        scope: $scope,
        preserveScope: true,
        templateUrl: '../../views/partials/notification.html',
        hideDelay: 3200,
      });
    });

    // LISTING AVAILABLE
    Socket.on('listing.available.notif', function(offer) {
      // console.log('listing available');
      // console.log(offer);

      // TOAST STUFF
      $scope.notifPic = offer.post.imageUrls[0];

      // message body should be like this
      // Sugata commented on your listing Adidas White Shoes: "Awesome...".
      $scope.notifBody = offer.post.title + ' just became available again.';

      $scope.goToMsg = function() {
        $location.path('/detail/' + offer.post._id);
        $mdToast.hide();
      };
      $scope.closeNotif = function() {
        $mdToast.hide();
      };
      $mdToast.show({
        // controller: 'navController',
        scope: $scope,
        preserveScope: true,
        templateUrl: '../../views/partials/notification.html',
        hideDelay: 3200,
      });
    });

    // make sure the user and db are in snc when it comes to socketID
    Socket.on('socketID.updated', function(response) {
      // console.log(response);
      $rootScope.currentUser.socketID = response;
    });

    // ACTIVITY NOTIFICATION

    // YOUR OFFER WAS REJECTED
    Socket.on('offer.rejected.notif', function(offer, post) {
      // console.log('offer rejected');
      // console.log(offer);

      // TOAST STUFF
      $scope.notifPic = offer.poster.profilePictures[0];

      // message body should be like this
      // Sugata commented on your listing Adidas White Shoes: "Awesome...".
      $scope.notifBody = offer.poster.firstName + ' made an offer on ' + like.post.title + '.'

      $scope.goToMsg = function() {
        $location.path('/detail/' + like.post._id);
        $mdToast.hide();
      };
      $scope.closeNotif = function() {
        $mdToast.hide();
      };
      $mdToast.show({
        // controller: 'navController',
        scope: $scope,
        preserveScope: true,
        templateUrl: '../../views/partials/notification.html',
        hideDelay: 3200,
      });
    });

    // YOUR HOLD WAS REMOVED
    Socket.on('hold.removed.notif', function(offer, post) {
      // console.log('offer removed');
      // console.log(offer);

      // TOAST STUFF
      $scope.notifPic = offer.poster.profilePictures[0];

      // message body should be like this
      // Sugata commented on your listing Adidas White Shoes: "Awesome...".
      $scope.notifBody = offer.poster.firstName + ' made an offer on ' + like.post.title + '.'

      $scope.goToMsg = function() {
        $location.path('/detail/' + like.post._id);
        $mdToast.hide();
      };
      $scope.closeNotif = function() {
        $mdToast.hide();
      };
      $mdToast.show({
        // controller: 'navController',
        scope: $scope,
        preserveScope: true,
        templateUrl: '../../views/partials/notification.html',
        hideDelay: 3200,
      });
    });

    // OFFER MAKER CANCELLED THEIR OFFER
    // Socket.on('offer.removed.notif', function(offer, post) {
    //   console.log('offer removed');
    //   console.log(offer);

    //   // TOAST STUFF
    //   $scope.notifPic = offer.poster.facebookPicture;

    //   // message body should be like this
    //   // Sugata commented on your listing Adidas White Shoes: "Awesome...".
    //   $scope.notifBody = offer.poster.facebookDisplayName + ' made an offer on ' + like.post.brand + ' ' + like.post.title + '.'

    //   $scope.goToMsg = function() {
    //     $location.path('/detail/' + like.post._id);
    //     $mdToast.hide();
    //   };
    //   $scope.closeNotif = function() {
    //     $mdToast.hide();
    //   };
    //   $mdToast.show({
    //     // controller: 'navController',
    //     scope: $scope,
    //     preserveScope: true,
    //     templateUrl: '../../views/partials/notification.html',
    //     hideDelay: 3200,
    //   });
    // });

    // UPDATE THE NOTIFICATIONS
    Socket.on('update.notifs', function(notifications, unseenNotifications) {
      // console.log('notifications received');

      $rootScope.currentUser.notifications = notifications;
      $rootScope.currentUser.unseenNotifications = unseenNotifications;

      // console.log(notifications);
      // console.log(unseenNotifications);



    });

    // Notification Popover

    $scope.notifPopover = {
      templateUrl: 'notifDropdown.html',
    };
    $scope.notifPopoverOpen = false;
    $rootScope.scrollLock = false;

    $scope.triggerNotifPopover = function() {
      // change the rootScope
      $rootScope.scrollLock = !$rootScope.scrollLock;
      // change the thing
      $scope.notifPopoverOpen = !$scope.notifPopoverOpen;

      $rootScope.currentUser.unseenNotifications = [];
      
      // send an event to the backend to dump the unseen notifications
      Profile.removeUnseenNotifications();
    };

    $scope.closeNotifPopover = function() {
      $rootScope.scrollLock = false;
      $scope.notifPopoverOpen = false;
      // console.log($rootScope.scrollLock);
    };

    $scope.browse_menu = [
      {label: 'Fashion', link:"macro=fashion&", icon: '../img/svg/fashion.svg'},
      {label: 'Home & Furniture', link:'macro=homefurniture&', icon: '../img/svg/duplex-house.svg'},
      {label: 'Electronics', link:'macro=electronics&', icon: '../img/svg/smartphone.svg'},
      {label: 'Textbooks', link:'macro=textbooks&', icon: '../img/svg/science-book.svg'},
      {label: 'Other', link:'macro=other&', icon: '../img/svg/question-mark-cursor.svg'}
    ];



    // Menu Popover

    $scope.menuPopover = {
      templateUrl: 'menuDropdown.html',
    };
    $scope.menuPopoverOpen = false;
    // $rootScope.scrollLock = false;

    $scope.triggerMenuPopover = function() {
      // change the rootScope
      $rootScope.scrollLock = !$rootScope.scrollLock;
      // change the thing
      $scope.menuPopoverOpen = !$scope.menuPopoverOpen;

      // $rootScope.currentUser.unseenNotifications = [];
      
      // send an event to the backend to dump the unseen notifications
      // Profile.removeUnseenNotifications();
    };

    $scope.closeMenuPopover = function() {
      $rootScope.scrollLock = false;
      $scope.menuPopoverOpen = false;
      // console.log($rootScope.scrollLock);
    };






    $scope.items = [
      // {label: 'Getting Started Guide', link:'#/getting-started'},
      {label: 'About Us', link:'#/about'}
    ];
    
    $scope.fashion_menu = [
      {label: 'New', link:"macro=fashion", icon: '../img/svg/used.svg'},
      {label: 'Tops', link:'macro=fashion&category=tops&', icon: '../img/svg/tops.svg'},
      {label: 'Dresses', link:'macro=fashion&category=dresses&', icon: '../img/svg/dresses.svg'},
      {label: 'Jeans', link:'macro=fashion&category=jeans&', icon: '../img/svg/jeans.svg'},
      {label: 'Outerwear', link:'macro=fashion&category=outerwear&', icon: '../img/svg/outerwear.svg'},
      {label: 'Bottoms', link:'macro=fashion&category=bottoms&', icon: '../img/svg/bottoms.svg'},
      {label: 'Sports', link:'macro=fashion&category=sports&', icon: '../img/svg/sports.svg'},
      {label: 'Formal', link:'macro=fashion&category=formal&', icon: '../img/svg/formal.svg'},
      {label: 'Bags', link:'macro=fashion&category=bags&', icon: '../img/svg/bags.svg'},
      {label: 'Shoes', link:'macro=fashion&category=shoes&', icon: '../img/svg/shoes.svg'},
      {label: 'Jewelry', link:'macro=fashion&category=jewelry&', icon: '../img/svg/jewelry.svg'},
      {label: 'Wallets', link:'macro=fashion&category=wallets&', icon: '../img/svg/wallets.svg'},
      {label: 'Hats', link:'macro=fashion&category=hats&', icon: '../img/svg/hats.svg'},
      {label: 'Accessories', link:'macro=fashion&category=accessories&', icon: '../img/svg/accessories.svg'},
      {label: 'Misc', link:'macro=fashion&category=miscellaneous&', icon: '../img/svg/miscellaneous.svg'},
      {label: 'See All', link:'macro=fashion', icon: '../img/svg/fashion.svg'}
    ];

    $scope.furniture_menu = [
      {label: 'New', link:"macro=furniture", icon: '../img/svg/used.svg'},
      {label: 'Decor', link:'macro=furniture&category=decor&', icon: '../img/svg/decor.svg'},
      {label: 'Sofas', link:'macro=furniture&category=sofas&', icon: '../img/svg/sofa.svg'},
      {label: 'Chairs', link:'macro=furniture&category=chairs&', icon: '../img/svg/chair.svg'},
      {label: 'Tables', link:'macro=furniture&category=tables&', icon: '../img/svg/table.svg'},
      {label: 'Dressers', link:'macro=furniture&category=dressers&', icon: '../img/svg/dresser.svg'},
      {label: 'Beds', link:'macro=furniture&category=beds&', icon: '../img/svg/bed.svg'},
      {label: 'Storage', link:'macro=furniture&category=storage&', icon: '../img/svg/storage.svg'},
      {label: 'Misc', link:'macro=furniture&category=miscellaneous&', icon: '../img/svg/miscellaneous.svg'},
      {label: 'See All', link:'macro=furniture', icon: '../img/svg/furniture.svg'}
    ];

    $scope.home_kitchen_menu = [
      {label: 'New', link:"macro=homekitchen", icon: '../img/svg/used.svg'},
      {label: 'Decor', link:'macro=homekitchen&category=decor&', icon: '../img/svg/carpet.svg'},
      {label: 'Cleaning & Waste', link:'macro=homekitchen&category=waste&', icon: '../img/svg/garbage.svg'},
      {label: 'Lighting', link:'macro=homekitchen&category=lighting&', icon: '../img/svg/lighting.svg'},
      {label: 'Bathroom', link:'macro=homekitchen&category=bathroom&', icon: '../img/svg/toilet.svg'},
      {label: 'Outdoors', link:'macro=homekitchen&category=outdoors&', icon: '../img/svg/bbq.svg'},
      {label: 'Electronics', link:'macro=homekitchen&category=electronics&', icon: '../img/svg/tv.svg'},
      {label: 'Cookware', link:'macro=homekitchen&category=cookware&', icon: '../img/svg/cookware.svg'},
      {label: 'Appliances', link:'macro=homekitchen&category=appliances&', icon: '../img/svg/heat.svg'},
      {label: 'Kitchen Appliances', link:'macro=homekitchen&category=kappliances&', icon: '../img/svg/blender.svg'},
      {label: 'Misc', link:'macro=homekitchen&category=miscellaneous&', icon: '../img/svg/miscellaneous.svg'},
      {label: 'See All', link:'macro=homekitchen', icon: '../img/svg/electronics.svg'}
    ];

    $scope.toggled = function(open) {
      $log.log('Dropdown is now: ', open);
    };

    // on login
    if ($rootScope.currentUser) {

      // get the messages 
      Chat.getChats($rootScope.currentUser._id)
        .success(function(data) {
          $scope.chatThreads = data;
          
          // if there isn't an array, create one
          if ($rootScope.new_msg_chats == undefined) {
            $rootScope.new_msg_chats = [];
          }

          for (var c in $scope.chatThreads) {
            if ($scope.chatThreads[c].hasUnseenMessages) {
              $rootScope.new_msg_chats.push($scope.chatThreads[c]);
            }
          }
      });

      // get the notifications
      Profile.getNotifications();

      // get the followers
      Profile.getFollowing($rootScope.currentUser._id)
        .success(function(data) {
          console.log(data);
          $rootScope.currentUserFollowing = data;
        });

      if ((!$rootScope.currentUserFollowing) || ($rootScope.currentUserFollowing[0] == undefined)) {
        console.log('missing currentUserFollowing');
        // console.log('changing currentUserFollowing');
        // $rootScope.currentUserFollowing = [];
        // var key = "_id";
        // for (var i = 0; i < $rootScope.currentUser.following.length; i++) {
        //   console.log('/******************************************user**********************');
        //   console.log($rootScope.currentUser.following[i]);
        //   $rootScope.currentUserFollowing.push($rootScope.currentUser.following[i]);
        // }
        // // $rootScope.currentUserFollowing = $rootScope.currentUser.following;
      }
    }

    $scope.dynamicPopover = {
      templateUrl: '../../views/partials/hovercard.html'
    };

    // $scope.toggleDropdown = function($event) {
    //   $event.preventDefault();
    //   $event.stopPropagation();
    //   $scope.status.isopen = !$scope.status.isopen;
    // };

    $scope.isCollapsed = false;

    $scope.isBrowsePage = function() {
      // the string of the location URL contains the word browse
      return ($location.path().indexOf('/browse') > -1); 
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
    };

    // function checkIfSocketIsActive() {
    //   if ($scope.isAuthenticated() && (io.managers[Object.keys(io.managers)[0]].engine.id != $rootScope.currentUser.socketID)) {

    //     // console.log('its not the same socket ' + Date());
    //     // send the socket id to the server
    //     Profile.sendSocketID(io.managers[Object.keys(io.managers)[0]].engine.id)
    //       .then(function(response) {
    //         // $rootScope.currentUser.socketID = response.
    //         // console.log(response);
    //     });
    //   }
    //   else {
    //     // console.log('its the same socket ' + Date());
    //   }
    // }
    // $interval(checkIfSocketIsActive, 1000);


    $scope.goToNotif = function(notif) {

      // var seenAt = {user: $rootScope.currentUser._id, timestamp : Date.now(), notifID: notif._id};

      // if (notif.seen == undefined) {
      //   notif.seen = {};
      // }
      // else {
      //   // if this is not a seen notification
      //   if (!notif.seen.hasOwnProperty($rootScope.currentUser._id)) {

      //     console.log(notif.seen);
      //   }
      // }
      
      // // update locally
      // notif.seen[$rootScope.currentUser._id] = Date.now();

      // // send to db
      // Profile.seenNotif(seenAt);
      // console.log()

      // go to path
      if (notif.post == null) {
          $location.path('/profile/' + notif.sender._id);
      }
      else if (notif.post._id == undefined) {
          $location.path('/detail/' + notif.post);
      }
      else {
          $location.path('/detail/' + notif.post._id);
      }

    };

    /*
   |--------------------------------------------------------------------------
   | Search
   |--------------------------------------------------------------------------
   */

    $scope.isSearchResultsCollapsed = true;
    $scope.hasSearchResults = false;
    $scope.searchData = {};
    $scope.isLoadingSearch = false;
    $scope.hasUsers = false;
    $scope.search_posts = undefined;
    // $location.hash('search-results');

    // close the search div on location change
    $scope.$on('$locationChangeStart', function(event) {
        // checkIfSocketIsActive();
        $scope.menuPopoverOpen = false;
        $rootScope.scrollLock = false;

        $scope.isSearchResultsCollapsed = true;
        $scope.searchData.searchText = "";
        $scope.search_posts = undefined;
        $location.hash('search-results');
    });

    var pendingSearch;

    // on toggle close, delete the current search
    $scope.closeSearch = function() {
      // console.log('hit the X button')
      $scope.isLoadingSearch = false;
      $scope.isSearchResultsCollapsed = true;
      $scope.hasSearchResults = false;
      $scope.searchData.searchText = "";
      $scope.search_posts = undefined;
      // $timeout(function(){$scope.search_posts = {};}, 800); 
    };

    // loads results when the string in the search box changes
    $scope.change = function() {
      $location.hash('search-results');
      $anchorScroll();

      if($scope.searchData.searchText == "" || $scope.searchData.searchText == undefined) {
        // console.log('closing search');
        $scope.isSearchResultsCollapsed = true;
        $scope.search_posts = undefined;
      } else {

        if (pendingSearch && ($scope.searchData.searchText != "" || $scope.searchData.searchText != undefined)) {
          
          $scope.isSearchResultsCollapsed = true;
          $scope.hasSearchResults = false;
          $scope.search_posts = undefined;
          clearTimeout(pendingSearch);
        }

        if($scope.searchData.searchText.length >= 3) {

          // construct the search query term
          $scope.searchData.searchQuery = 'term='+ $scope.searchData.searchText;

          $scope.isSearchResultsCollapsed = true;
          pendingSearch = setTimeout(fetch, 800);
        }
      }
    };

    function fetch() {
      $scope.isLoadingSearch = true;
      if($scope.searchData.searchText != "") {

        Search.getAll($scope.searchData.searchQuery)
        .success(function(data) {

            // console.log(data);

            if (data['results'].length == 0) {
              Search.getAllUsers($scope.searchData.searchQuery)
                .success(function(data) {
                  // console.log(data);
                  $scope.isLoadingSearch = false;

                  // console.log(data);

                  // after getting the posts, show the results in the collapsable 
                  $scope.search_posts = data['results'];

                  $scope.total_search_results = undefined;
                  if ($scope.search_posts.length > 0) {
                    $scope.hasSearchResults = true;
                    $scope.hasUsers = true;
                  }

                  $scope.isSearchResultsCollapsed = false;
                });
            }
            else {
              // console.log(data);
              $scope.isLoadingSearch = false;

              // console.log(data);

              // after getting the posts, show the results in the collapsable 
              $scope.search_posts = data['results'];
              $scope.total_search_results = data['total_items'];
              if ($scope.search_posts.length > 0) {
                $scope.hasSearchResults = true;
                $scope.hasUsers = false;
              }

              $scope.isSearchResultsCollapsed = false;
            }
            // console.log($scope.hasUsers);
        });
      }
    }

    $scope.select = function(){
      // this.setSelectionRange(0, this.value.length);
      $scope.closeSearch();
    };

    /* END OF SEARCH */

    





    $scope.myLike = function(likes) {
      // console.log(likes);
      if (likes) {
        return Like.hasLiked(likes);
      }
      return;
    };

    $scope.logout = function() {
      $auth.logout();
      $auth.removeToken();
      delete $window.localStorage.currentUser;
      delete $window.cookies;
      $location.path('/');
      // $route.reload();
      toaster.pop('success', "Logged out successfully.");
    };

    $scope.alert = '';

    // show "List an Item" Dialog
    $scope.showListItem = function(ev) {

      if ($auth.isAuthenticated()) {
          $mdDialog.show({
            controller: PostCtrl,
            templateUrl: '../../views/partials/dialog1.tmpl.html',
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

    // show "Choose a Macro" Dialog
    $scope.chooseMacro = function(ev) {

      if ($scope.menuDropdown) {
        $scope.menuPopoverOpen();
      }

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

    $scope.goToLink = function(postID, type) {
      // console.log(postID);
      if (type == "post") {
        $location.path('/detail/' + postID);
      }
      else if(type == "category") {
        $location.path('/browse/' + postID); 
      }
      else {
        $location.path('/profile/' + postID);
      }
      $scope.closeSearch();
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

});

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