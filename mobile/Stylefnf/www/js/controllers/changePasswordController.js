angular.module('Stylefnf')
.controller('changePasswordController', function($scope, currentUser, Profile, $state, $rootScope, $window, $ionicPopup, $http) {
	
	
// 	var message = new gcm.Message();
 
// //API Server Key
// 	var sender = new gcm.Sender('AIzaSyD-uejveEuLf1i7F5bxrT20Oi-y8KmrtPk');
// 	message.addData('message',"fdsafdsafdsa");

// 	registrationIds.push("fpv_V4pK5TY:APA91bF6788bPbwlHNbwjLS7zv6vEGsjz8duh3ZI0YRwU6H5VMSc9vZQufA_AN6oaHH_AUDB-kNVTzwFIq_hCxqeGxhGHJrhjqoKz9OZHD5PG6hKey_v6BmDaAzny8BTAquMO9aD7XhJ");
 	$scope.passwordObj = {};
	$scope.confirmPasswordObj = {};

	if(!$rootScope.currentUser){
	  $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
	}

	
  

	$scope.changePassword = function(){
		
		if (($scope.passwordObj.password == $scope.confirmPasswordObj.password)
			&& ($scope.passwordObj.password != undefined || $scope.confirmPasswordObj.password != undefined)){ 
			$scope.currentUser = {
		    firstName: $rootScope.currentUser.firstName,
		    lastName: $rootScope.currentUser.lastName,
		    email: $rootScope.currentUser.email,
		    password: $scope.passwordObj.password,
		    gender: $rootScope.currentUser.gender,
		  };

		  Profile.updateProfile($scope.currentUser)
	      .success(function(response) {
	        console.log(response);
	        $window.localStorage.currentUser = JSON.stringify(response.user);
	        $rootScope.currentUser = JSON.parse($window.localStorage.currentUser); 

	        $scope.currentUser = {
	          firstName: $rootScope.currentUser.firstName,
	          lastName: $rootScope.currentUser.lastName,
	          email: $rootScope.currentUser.email,
	          gender: $rootScope.currentUser.gender,
	        };
      });

	    var alertPopup = $ionicPopup.alert({
       title: 'Success!',
       template: 'Your password has been changed!'
      });

      alertPopup.then(function(res) {
        $state.go('tab.options');
      });
		} else if ($scope.passwordObj.password != $scope.confirmPasswordObj.password) {
				var alertPopup = $ionicPopup.alert({
	        title: 'Passwords do not match'
	      });
		}	else if ($scope.passwordObj.password == undefined || $scope.confirmPasswordObj.password == undefined) {
				var alertPopup = $ionicPopup.alert({
	        title: 'One or more fields are missing'
	      });
		}
	} 

	$scope.goBack = function() {
		$scope.passwordObj.password = "";
		$scope.confirmPasswordObj.password = "";
		$state.go('tab.options');
	};

});
