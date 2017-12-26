angular.module('Haberdashery', [
               'ngRoute',
               'ngMaterial',
               'ui.bootstrap',
               'ngAnimate',
               'vTabs',
               'ngSanitize',
               'slick',
               'ngResource',
               'ngCookies',
               'ngMessages',
               'satellizer',
               'toaster',
               'angularMoment',
               'btford.socket-io',
               'xeditable',
               'infinite-scroll',
               'luegg.directives',
               'popoverToggle',
               'ngImgCrop',
               'viewhead',
               'ngMap',
               'angulartics',
               'angulartics.google.analytics',
               'yaru22.hovercard',
               'imageCropper'
               ])
  
  // ---------------IMPORTANT-----------------------------
  // FOR TESTING PURPOSES:
  // Uncomment the following line to run locally
  // .constant('serverURL', 'http://52.6.185.124:3000')
  // .constant('serverURL', 'http://localhost:3000') 
  // ---------------END IMPORTANT-----------------------------
  
  // Comment this line
  .constant('serverURL', 'http://52.4.54.223:3000') 



  // ---------------IMPORTANT-----------------------------
  // FOR TESTING PURPOSES:
  // Uncomment the following line to run locally
  // .constant('s3serverURL', 'http://52.6.185.124:3000' + '/api/sign_s3')
  // ---------------END IMPORTANT-----------------------------

  // Comment this line
  .constant('s3serverURL', 'http://52.4.54.223:3000' + '/api/sign_s3') 

  // .value('THROTTLE_MILLISECONDS', 250)
  
  .config(function($routeProvider, $httpProvider, $locationProvider, $authProvider, $mdThemingProvider, $analyticsProvider) {

    // $locationProvider.hashPrefix('!');

    // $analyticsProvider.developerMode(true);

    $mdThemingProvider.theme("success-toast")

    //Reset headers to avoid OPTIONS request (aka preflight)
    // $httpProvider.defaults.headers.common = {};
    // $httpProvider.defaults.headers.get = {};
    // $httpProvider.defaults.headers.post = {};
    // $httpProvider.defaults.headers.put = {};
    // $httpProvider.defaults.headers.patch = {};
    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    $httpProvider.defaults.headers.common['Pragma'] = 'no-cache';
    $httpProvider.defaults.headers.common['Expires'] = '0'; 
    

    $routeProvider
      // .when('/', {
      //   templateUrl: 'views/about2.html',
      //   // controller: 'homeController'
      // })
      .when('/', {
        templateUrl: 'views/landing.html',
        controller: 'landingController'
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'homeController'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'loginController'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'signupController'
      })
      .when('/verify/:token', {
        templateUrl: 'views/verify.html',
        controller: 'verifyController'
      })
      .when('/browse/', {
        redirectTo: '/browse/sort=newest'
      })
      .when('/browse/:searchQuery', {
        templateUrl: 'views/browse2.html',
        controller: 'browseController'
      })
      .when('/messages/', {
        templateUrl: 'views/chat.html',
        controller: 'chatController'
      })
      .when('/detail/:detailId', {
        templateUrl: 'views/detail.html',
        controller: 'detailController'
      })
      .when('/profile/:profileId', {
        templateUrl: 'views/profile.html',
        controller: 'profileController'
      })
      .when('/terms', {
        templateUrl: 'views/terms.html'
      })
      .when('/privacy', {
        templateUrl: 'views/privacy.html'
      })
      .when('/email-sent', {
        templateUrl: 'views/email-sent.html'
      })
      .when('/help', {
        templateUrl: 'views/help.html',
        controller: 'helpController'
      })
      .when('/help/getting-started', {
        templateUrl: 'views/getting-started.html'
      })
      .when('/help/how-to-list', {
        templateUrl: 'views/how-to-list.html'
      })
      .when('/help/how-to-buy', {
        templateUrl: 'views/how-to-buy.html'
      })
      .when('/help/FAQs', {
        templateUrl: 'views/FAQs.html',
        controller: 'FAQsController'
      })
      .when('/help/aboutUs', {
        templateUrl: 'views/aboutUs.html'
      })
      .when('/help/trust-and-safety', {
        templateUrl: 'views/trust-and-safety.html'
      })
      .when('/help/payments-and-getting-paid', {
        templateUrl: 'views/payments-and-getting-paid.html'
      })
      .when('/help/refunds-and-returns', {
        templateUrl: 'views/refunds-and-returns.html'
      })
      .when('/createlisting', {
        templateUrl: 'views/create-listing.html',
        controller: 'createListingController'
      })
      .when('/account', {
        templateUrl: 'views/my-account.html',
        controller: 'accountController'
      })
      .when('/jobs', {
        templateUrl: 'views/jobs.html'
      })
      .when('/forgot-password', {
        templateUrl: 'views/forgot-password.html',
        controller: 'forgotPasswordController'
      })
      .when('/forgot-password/:token', {
        templateUrl: 'views/forgot-password-verify.html',
        controller: 'forgotPasswordVerifyController'
      })
      .when('/users', {
        templateUrl: 'views/users.html',
        controller: 'usersController'
      })
      // .when('/help/buy', {
      //   templateUrl: 'views/buy-item.html'
      // })
      // .when('/help/list', {
      //   templateUrl: 'views/list-item.html'
      // })
      //change to /brand/:brandId
      // .when('/brands', {
      //   templateUrl: 'views/brand.html',
      //   controller: 'brandController'
      // })
      .when('/about', {
        templateUrl: 'views/about2.html',
        controller: 'aboutController'
      })
      .otherwise({
        redirectTo: '/'
      });

    

    // enable html5Mode for pushstate ('#'-less URLs)
    // $locationProvider.html5Mode(true);

    // ---------------IMPORTANT-----------------------------
    // FOR TESTING PURPOSES:
    // Uncomment the following line to run locally
    // var serverURL = 'http://52.6.185.124:3000';
    // var serverURL = 'http://localhost:3000';
    // --------------END IMPORTANT-------------------------

    // Comment this line
    var serverURL = 'http://52.4.54.223:3000';

    $authProvider.signupUrl = serverURL + '/auth/signup';
    $authProvider.loginUrl = serverURL + '/auth/login';
    // $authProvider.registerUrl = serverURL + '/auth/register';
    $authProvider.oauth2({
      name: 'instagram',
      url: serverURL + '/auth/instagram',
      redirectUri: serverURL + ':80',
      clientId: '4c38ac8228ae4a39b478950ef1ef9561',
      requiredUrlParams: ['scope'],
      scope: ['likes'],
      scopeDelimiter: '+',
      authorizationEndpoint: 'https://api.instagram.com/oauth/authorize'
    });

    $authProvider.facebook({
      clientId: '920265221354650',
      url: serverURL + '/auth/facebook',
      redirect_uri: 'http://haberdashery.me/'
    });
  })
  .run(function($rootScope, $anchorScroll, $window, $auth, editableOptions, editableThemes, $location, $route, $templateCache, Socket) {

    $location.hash('search-results');

    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if (typeof(current) !== 'undefined'){
            $templateCache.remove(current.templateUrl);
        }
    });

    $rootScope.isLanding = function() {
      return $location.path() == "/";
    }


    editableThemes.bs3.inputClass = 'input-sm';
    editableThemes.bs3.buttonsClass = 'btn-sm';
    editableOptions.theme = 'bs3';
    
    if ($auth.isAuthenticated()) {
      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
      Socket.on("connection",function() {
        Socket.emit('active', {id: $rootScope.currentUser._id} );
      });
    }
  });

