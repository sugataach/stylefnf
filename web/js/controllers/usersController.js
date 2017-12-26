angular.module('Haberdashery')
  .controller('usersController', function($scope, $rootScope, $auth, Search) {

    Search.userPhonebook()
      .success(function(err, data) {
        console.log(data);
        $scope.allUsers = data;

      });

  });