'use strict';

angular.module('Stylefnf')
  .directive('showLoading', function($rootScope) {
    return {
      restrict:'E',
      template:"<ion-spinner icon='spiral'></ion-spinner>",
      link:function(scope, elem, attrs){
        scope.isRouteLoading = false;

        $rootScope.$on('$routeChangeStart', function(){
          scope.isRouteLoading = true;
        });

        $rootScope.$on('$routeChangeSuccess', function(){
          scope.isRouteLoading = false;
        });
      }
    };
  });
