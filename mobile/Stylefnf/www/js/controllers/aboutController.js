angular.module('Stylefnf')
.controller('aboutController', function($scope, $state, $auth, $window, $rootScope, $ionicSlideBoxDelegate) {
  
  $scope.tutorials = [ {link:"tutorial1", brand:"hi"}, {link:"tutorial2", brand:"hi"}, {link:"tutorial3", brand:"hi"} ]
  console.log($scope.tutorials);

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };

  $scope.goTo = function(link){
  	console.log(link);
  	if(link == "gettingStarted"){
  		$state.go('gettingStarted');
  	} else if(link == "howToList"){
  		$state.go('howToList');
  	} else if(link == "howToBuy"){
  		$state.go('howToBuy');
  	}
  }

  $scope.goBack = function(){
  	$state.go('login');
  }

})

.controller('gettingStartedController', function($scope, $state, $ionicSlideBoxDelegate) {
 
  // Called to navigate to the main app

  $scope.gettingStarted = {}
  $scope.gettingStarted.navTitle = "Signup";
  $scope.startTutorial = function() {
    $state.go('about');
  };
  $scope.next = function() {

    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    if(index == 0){
      $scope.gettingStarted.navTitle = "Signup";
    } else if(index == 1){
      $scope.gettingStarted.navTitle = "Activate";
    } else if(index == 2){
      $scope.gettingStarted.navTitle = "Finish";
    }
    $scope.slideIndex = index;
  };
})

.controller('howToListController', function($scope, $state, $ionicSlideBoxDelegate) {
 
  $scope.howToList = {}
  $scope.howToList.navTitle = "Listing Type";
  // Called to navigate to the main app
  $scope.startTutorial = function() {
    $state.go('about');
  };
  $scope.next = function() {

    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    if(index == 0){
      $scope.howToList.navTitle = "Listing Type";
    } else if(index == 1){
      $scope.howToList.navTitle = "Create";
    } else if(index == 2){
      $scope.howToList.navTitle = "List Now";
    }
    $scope.slideIndex = index;
  };
})

.controller('howToBuyController', function($scope, $state, $ionicSlideBoxDelegate) {
 
  // Called to navigate to the main app
  $scope.howToBuy = {}
  $scope.howToBuy.navTitle = "Offer";

  $scope.startTutorial = function() {
    $state.go('about');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    if(index == 0){
      $scope.howToBuy.navTitle = "Offer";
    } else if(index == 1){
      $scope.howToBuy.navTitle = "Wait";
    } else if(index == 2){
      $scope.howToBuy.navTitle = "Pay";
    }
    $scope.slideIndex = index;
  };
});
