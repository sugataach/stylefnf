// Dialog Box Function
(function () {
  'use strict';
  angular
      .module('Haberdashery')
      .controller('CustomMacroChoiceCtrl', chooseMacroController)

  function chooseMacroController (
              $scope, 
              $window,
              $mdSidenav,
              $mdUtil,
              $log,
              $rootScope, 
              $routeParams, 
              $location, 
              toaster, 
              Post, 
              $auth, 
              $route,
              $timeout, 
              Socket, 
              Comment, 
              Offer,
              Profile,
              $animate,
              $mdDialog,
              $q,
              NewListing,
              s3serverURL,
              $mdToast,
              $http) {
    

    var ctrl = this;

    $scope.clickMacro = function(data) {
      // save the selected macro
      NewListing.saveMacro(data);

      $location.path('/');

      $rootScope.changeNewListing = true;

      // hide macro
      $mdDialog.hide();

      // redirect user to "Create Listing" page
      $location.path('/createlisting');
    };

  }
})();