angular.module('Stylefnf')
.directive('endOfRepeatDirective', function($location, $anchorScroll, $ionicScrollDelegate) {
  return function(scope, element, attrs) {
    

  	//if last in posts from ng-repeat
  	//if index is not zero
  	//if posts have more than 1 item
  	//if posts length < 9
    if (scope.$last && scope.$index != 0 && scope.posts.length != 1 && 
    	scope.posts.length <= 9 ){

   		var newHash = 'feed-' + scope.currIndex;
      if ($location.hash() !== newHash) {
      	
        // set the $location.hash to `newHash` and
        // $anchorScroll will automatically scroll to it
        $location.hash('feed-' + scope.currIndex);
      } else {
      	
        // call $anchorScroll() explicitly,
        // since $location.hash hasn't changed
        $anchorScroll();
      }
   		

    }
  };
})