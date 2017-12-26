angular.module('Stylefnf')
.controller('editAccountController', function($scope, $state, $auth, $window, $rootScope, Profile, currentUser, $ionicPopup) {
  

  $scope.user = JSON.parse($window.localStorage.currentUser);

  // if($scope.user.gender == "male")
  //   $scope.gender = {label: 'Male', value: 'male'};
  // else
  //   $scope.gender = {label: 'Female', value: 'female'};

  // $scope.password = "", $scope.confirmPassword = "";

  $scope.currentUser = {

      firstName: $scope.user.firstName,
      lastName: $scope.user.lastName,
      email: $scope.user.email,
      gender: $scope.user.gender,
      about: $scope.user.about,
  };

  //console.log($rootScope);

	/*if($scope.currentUser == undefined){
    $rootScope.currentUser = currentUser.getCurrentUser();
  }*/

  $scope.genderStatuses = {
    availableOptions: [
      {val:'male', label:'Male'},
      {val:'female', label: 'Female'},
    ],
    selectedOption: {val: $scope.user.gender} //This sets the default value of the select in the ui
  };

  $scope.loadProfile = function() {

  	Profile.getUserProfile($scope.user._id)
      .success(function(data) {

      $scope.user = data;
      console.log($scope.user);
      $scope.$broadcast('scroll.refreshComplete');
  	});
  };

  $scope.updateProfile = function() {

    Profile.updateProfile($scope.currentUser)
      .success(function(response) {
        
        $window.localStorage.currentUser = JSON.stringify(response.user);
        $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

        $scope.currentUser = {
          firstName: $rootScope.currentUser.firstName,
          lastName: $rootScope.currentUser.lastName,
          email: $rootScope.currentUser.email,
          about: $rootScope.currentUser.about,
          gender: $rootScope.currentUser.gender,
        };
        $state.go('tab.account');
      });
  };

  $scope.goBack = function() {
    $state.go('tab.account');
  };

  // $scope.verify = function(warning) {

  //   $scope.verifyPopup = $ionicPopup.show({
  //     //template: '<input type="number" ng-model="offerData.offerPrice">',
  //     title: warning,
  //     scope: $scope,
  //     buttons: [
  //       { text: 'Cancel' },
  //       {
  //         text: '<b>Yes</b>',
  //         type: 'button-positive',
  //         onTap: function(e) {
  //           if (warning == "Are you sure you want to save these changes?") {

  //             // send the info to the backend
  //             Profile.updateProfile($scope.currentUser)
  //             .success(function(response) {

  //               //console.log(response.user);

  //               $window.localStorage.currentUser = JSON.stringify(response.user);
  //               $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
  //               $scope.user = $rootScope.currentUser;

  //               $scope.currentUser.firstName = $rootScope.currentUser.firstName;
  //               $scope.currentUser.lastName = $rootScope.currentUser.lastName;
  //               $scope.currentUser.email = $rootScope.currentUser.email;
  //               $scope.currentUser.gender = $rootScope.currentUser.gender;
  //             });
  //           }
  //           else if (warning == "Are you sure you want to exit? Any changes you make will not be saved.")
  //             $scope.goBack();
  //         }
  //       }
  //     ]
  //   });
  // };

  $scope.isValidEmail = function(email) {

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

});
