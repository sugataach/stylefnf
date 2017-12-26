angular.module('Haberdashery')
  .controller('FAQsController', function($scope, $window, $location, $rootScope, $auth, toaster, Socket, Profile) {

  	$scope.scroller = function(section) {

  		//in place for now, would like to implement a smooth scroll later
  		//lots of code involved if jquery is not used.
  		//document.getElementById(section).scrollIntoView({behaviour: "smooth"});
  		var ele = document.getElementById(section);

  		//very hacky right now
  		window.scrollTo(ele.offsetLeft,ele.offsetTop-70);
  	};

  });
