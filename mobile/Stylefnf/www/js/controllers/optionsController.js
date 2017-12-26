angular.module('Stylefnf')
.controller('optionsController', function($scope, $state, $auth, $window, $rootScope, $state, $auth, Profile, currentUser) {

  if(!$rootScope.currentUser){
    if ($auth.isAuthenticated()) {
      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
    }
    else {
      
    }
  }

  $scope.goTo = function(route,id){
    if(route == "changePwd"){

      $state.go('tab.change-password');
    }

    if(route == "purchased-listings"){
      console.log("purchased-listings");
      $state.go('tab.purchased-listings');
    }
    if(route == "sold-listings"){
      console.log("sold-listings");
      $state.go('tab.sold-listings');
    }
  };

  $scope.goBack = function() {
    $state.go('tab.account');
  };

  $scope.logout = function() {
    // currentUser.setCurrentUser({});
    $rootScope.currentUser = undefined;
    $auth.logout();
    $auth.removeToken();

    // Profile.updateDeviceToken("")
    //   .success(function(data){
        
    //   });
    delete $window.localStorage.currentUser;
    delete $window.cookies;
   
    $state.go("eventFeed");
    // $route.reload();
    //toaster.pop('success', "Logged out successfully.");
  };
});
