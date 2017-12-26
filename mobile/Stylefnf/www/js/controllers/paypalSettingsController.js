angular.module('Stylefnf')
.controller('paypalSettingsController', function($scope, Profile, $state, $rootScope, $window) {
	
	$scope.goBack = function() {
		$state.go('tab.options');
	};
});
