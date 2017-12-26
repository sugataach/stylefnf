angular.module('Stylefnf')
.controller('soldListingsController', function($scope, Profile, $state, $rootScope, $window, currentUser) {
	
	$rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
	
	$scope.loadSoldListings = function(){
		Profile.getUserProfile($rootScope.currentUser._id)
      .success(function(data) {

      $scope.soldListings = data.soldPosts;

      $scope.$broadcast('scroll.refreshComplete');
  	});
	}

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
	$scope.goBack = function(){
		$state.go('tab.options');
	}

	$scope.goTo = function(route,id){
    if(route == "listing"){
      $state.go('tab.listing-detail', {listingId: id});
    }
  }
});
