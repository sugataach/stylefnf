// 'use strict';

angular.module('Haberdashery')
  .controller('helpController', function($scope, $window, $location, $rootScope, $auth, toaster, Socket, Profile) {

    // if($auth.isAuthenticated()) {
    //   $location.path('/');
    // }

    // Profile.getTeam()
    //   .then(function(response) {
    //     $scope.team = response.data;
    //     // console.log($scope.team);
    //     for (var user in $scope.team) {
    //       // console.log($scope.team[user]);
    //     }
    //   })
    //   .catch(function(response) {
    //     // console.log(response);
    // });

    $scope.goToLink = function(name) {
      $location.path('/help/' + name);
    };
    
  });