angular.module('Stylefnf', ['ionic', 'ngCordova', 'satellizer', 'ionicLazyLoad','angularMoment', 'ionic.closePopup', 'btford.socket-io', 'angulartics.google.analytics'])

// ---------------IMPORTANT-----------------------------
// FOR TESTING:
// Uncomment the following line to run on dev
// .constant('serverURL', 'http://52.6.185.124:3000')
// .constant('serverURL', 'http://localhost:3000')
// ---------------IMPORTANT-----------------------------

// ---------------IMPORTANT-----------------------------
// FOR PRODUCTION:
// Uncomment the following line to run on prod
.constant('serverURL', 'http://52.4.54.223:3000')
// ---------------IMPORTANT-----------------------------


// ---------------IMPORTANT-----------------------------
// FOR TESTING:
// Uncomment the following line to run on dev
// .constant('s3serverURL', 'http://52.6.185.124:3000' + '/api/sign_s3')
// .constant('s3serverURL', 'http://localhost:3000' + '/api/sign_s3')
// ---------------IMPORTANT-----------------------------


.constant('paypalMerchantID', 'Z4UNUJHSVQD7A')


// ---------------IMPORTANT-----------------------------
// FOR PRODUCTION:
// Uncomment the following line to run on prod
.constant('s3serverURL', 'http://52.4.54.223:3000' + '/api/sign_s3')
// ---------------IMPORTANT-----------------------------

.value('THROTTLE_MILLISECONDS', 250)

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $authProvider, $compileProvider, $analyticsProvider) {

  // turn off debugging for performance increase
  $compileProvider.debugInfoEnabled(false);

  // $analyticsProvider.developerMode(true);


  moment.lang('en', {
      relativeTime : {
          future: "in %s",
          past:   "%s",
          s:  "%ds",
          m:  "1m",
          mm: "%dm",
          h:  "1h",
          hh: "%dh",
          d:  "1d",
          dd: "%dd",
          M:  "1mon",
          MM: "%dm",
          y:  "1y",
          yy: "%dy"
      }
  });

  $ionicConfigProvider.scrolling.jsScrolling(false);

  $ionicConfigProvider.views.maxCache(5);

  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show')
        return config;
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response;
      }
    }
  });

  // force tabs to the bottom of screen
  $ionicConfigProvider.tabs.position('bottom');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('eventFeed', {
    url: "/eventFeed",
    templateUrl: "templates/eventFeed.html",
    controller: 'eventFeedController'
  })

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'loginController'
  })

  .state('about', {
    url: "/about",
    templateUrl: "templates/about.html",
    controller: 'aboutController'
  })

  .state('gettingStarted', {
    url: '/gettingStarted',
    templateUrl: 'templates/partials/gettingStarted.html',
    controller: 'gettingStartedController'
  })

  .state('howToList', {
    url: '/howToList',
    templateUrl: 'templates/partials/howToList.html',
    controller: 'howToListController'
  })

  .state('howToBuy', {
    url: '/howToBuy',
    templateUrl: 'templates/partials/howToBuy.html',
    controller: 'howToBuyController'
  })

  .state('signup', {
    url: "/signup",
    templateUrl: "templates/signup2.html",
    controller: 'signupController'
  })

  .state('forgotPassword', {
    url: "/forgotPassword",
    templateUrl: "templates/forgotPassword.html",
    controller: 'forgotPasswordController'
  })

  .state('forgotPasswordVerify', {
    url: "/forgot-password/:token",
    templateUrl: "templates/forgotPasswordVerify.html",
    controller: 'forgotPasswordVerifyController'
  })

  .state('verify', {
    url: "/verify/:token",
    templateUrl: "templates/verify.html",
    controller: "verifyController"
  })
  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '',
    abstract: true,
    templateUrl: 'templates/tabs.html',
  })

  // Each tab has its own nav history stack:

  .state('tab.feed', {
    url: '/feed',
    views: {
      'tab-feed': {
        templateUrl: 'templates/tab-feed.html',
        controller: 'feedController'
      }
    }
  })

  .state('tab.newListing', {
    url: '/newListing',
    views: {
      'tab-newListing': {
        templateUrl: 'templates/newListing.html',
        controller: 'newListingController'
      }
    }
  })

  .state('tab.editListing', {
    url: '/editListing/:listingId',
    views: {
      'tab-editListing': {
        templateUrl: 'templates/editListing.html',
        controller: 'editListingController'
      }
    }
  })

  .state('tab.notifications', {
    url: '/notifications',
    views: {
      'tab-notifications': {
        templateUrl: 'templates/tab-notifications.html',
        controller: 'notificationsController'
      }
    }
  })

  .state('tab.comments', {
    url: '/comments/:listingId',
    views: {
      'tab-comments': {
        templateUrl: 'templates/tab-comments.html',
        controller: 'commentsController'
      }
    }
  })
  .state('tab.testurl', {
    url: '/testurl',
    views: {
        'testurl':{
        templateUrl: 'templates/testurl.html',
        controller: 'testurlController'
      }
    }
  })

  .state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'templates/tab-search.html',
        controller: 'searchController'
      }
    }
  })

  .state('tab.search-results', {
    url: '/search-results',
    views: {
      'search-results': {
        templateUrl: 'templates/search-results.html',
        controller: 'searchResultsController'
      }
    }
  })

  .state('tab.listing-detail', {
    url: '/detail/:listingId',
    views: {
      'tab-listings': {
        templateUrl: 'templates/listing-detail.html',
        controller: 'listingDetailController'
      }
    }
  })

  .state('tab.likes', {
    url: '/likes/:listingId',
    views: {
      'tab-likes': {
        templateUrl: 'templates/tab-likes.html',
        controller: 'likesController'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'chatController'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'chatDetailController'
        }
      }
    })

  .state('tab.profile-detail', {
    url: '/profile/:profileId',
    views: {
      'tab-profiles': {
        templateUrl: 'templates/profile-detail.html',
        controller: 'profileDetailController'
      }
    }
  })

  .state('tab.following', {
    url: '/profile/:profileId/following',
    views: {
      'tab-following': {
        templateUrl: 'templates/tab-following.html',
        controller: 'followingController'
      }
    }
  })

  .state('tab.follower', {
    url: '/profile/:profileId/follower',
    views: {
      'tab-follower': {
        templateUrl: 'templates/tab-follower.html',
        controller: 'followerController'
      }
    }
  })

  .state('tab.edit-account', {
      url: '/edit-account/:profileId',
      views: {
        'tab-edit-account': {
          templateUrl: 'templates/tab-edit-account.html',
          controller: 'editAccountController'
        }
      }
    })

  .state('tab.options', {
      url: '/options',
      views: {
        'tab-options': {
          templateUrl: 'templates/tab-options.html',
          controller: 'optionsController'
        }
      }
    })


  .state('tab.change-password', {
      url: '/change-password',
      views: {
        'tab-change-password': {
          templateUrl: 'templates/tab-change-password.html',
          controller: 'changePasswordController'
        }
      }
    })
  .state('tab.purchased-listings', {
      url: '/purchased-listings',
      views: {
        'tab-purchased-listings': {
          templateUrl: 'templates/tab-purchased-listings.html',
          controller: 'purchasedListingsController'
        }
      }
    })
  .state('tab.sold-listings', {
      url: '/sold-listings',
      views: {
        'tab-sold-listings': {
          templateUrl: 'templates/tab-sold-listings.html',
          controller: 'soldListingsController'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'accountController'
      }
    }
  });




  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/eventFeed');

  // ---------------IMPORTANT-----------------------------
  // FOR TESTING:
  // Uncomment the following line to run on dev
  // var serverURL = 'http://52.6.185.124:3000'; // dev server
  // var serverURL = 'http://localhost:3000'; // local server
  // ---------------IMPORTANT-----------------------------


  // ---------------IMPORTANT-----------------------------
  // FOR PRODUCTION:
  // Uncomment the following line to run on prod
  var serverURL = 'http://52.4.54.223:3000';
  // ---------------IMPORTANT-----------------------------

  $authProvider.signupUrl = serverURL + '/auth/signup';
  $authProvider.loginUrl = serverURL + '/auth/login';

})

.run(function($ionicPlatform, $rootScope, $state, $ionicLoading, $auth, currentUser, $window, Profile, $interval, Socket, currentUser) {
  $ionicPlatform.ready(function() {

    // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    //   if (!$auth.isAuthenticated()) {
    //     $state.go('eventFeed');
    //   }
    // });

    $rootScope.unseenNotifications = [];
    $rootScope.new_msg_chats = [];

    Socket.on('update.notifs', function(notifications, unseenNotifications) {
      console.log('unseenNotifications are ', unseenNotifications);
      $rootScope.unseenNotifications = unseenNotifications;
    });

    // MESSAGE NOTIFICATION
    Socket.on('new.message.received', function(sender, chatID) {
      console.log('received new message');

      if ($auth.isAuthenticated()) {
        // we add our message if the chat thread isn't already there
        if ($rootScope.new_msg_chats.indexOf(chatID) == -1) {
          $rootScope.new_msg_chats.push(chatID);
        }
      }

    });

    $rootScope.showChats = function() {
      if ($rootScope.new_msg_chats.length > 0) {
        return $rootScope.new_msg_chats.length;
      }
      else {
        return "";
      }
    };

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      window.cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    //cordova plugin add phonegap-plugin-push --variable SENDER_ID="1063814232556"
    if (window.cordova) {
      // running on device/emulator
      var push = PushNotification.init({
        android: {
            senderID: "1063814232556"
        },
        ios: {
            alert: "true",
            badge: "true",
            sound: "true"
        },
        windows: {}
      });

      // var push = currentUser.getPushObj();
      // alert(push);

      push.on('registration', function(data) {

        $rootScope.deviceToken = data.registrationId;
        //console.log(data.registrationId);
        //alert(data.registrationId);

      });


      push.on('notification', function(data) {
        if(data.additionalData.foreground == false){
          if(data.additionalData.objType == "comment"){
            $state.go('tab.comments', {listingId: data.additionalData.objID});
          } else if(data.additionalData.objType == "like" || data.additionalData.objType== "offer"){
            $state.go('tab.listing-detail', {listingId: data.additionalData.objID});
          } else if(data.additionalData.objType == "chat"){
            $state.go('tab.chat-detail', {chatId: data.additionalData.objID});
          } else if(data.additionalData.objType == "follow"){
            $state.go('tab.profile-detail', {profileId: data.additionalData.objID});
          } else if(data.additionalData.objType == "pay"){
            $state.go('tab.listing-detail', {listingId: data.additionalData.objID});
          }
        }
      });
    }


    // set the currentuser if token is available
    if ($window.localStorage.currentUser) {
      var user = JSON.parse($window.localStorage.currentUser);

      Socket.emit('active', {id: user['_id']} );

      Profile.getUserProfile(user['_id'])
        .success(function(data) {
          currentUser.setCurrentUser(data);
          // save to rootScope as well
          $rootScope.currentUser = user;

          var myNotificationsPromise = Profile.getNotifications(user['_id']);
          myNotificationsPromise.then(function(result) {
             // this is only run after getData() resolves
             currentUser.setNotifications = result['notifications'];
             $rootScope.unseenNotifications = result['unseenNotifications'];
             //console.log(currentUser.getNotifications());
          });
        });
    }

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
});
//
