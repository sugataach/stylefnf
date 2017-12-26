'use strict';

angular.module('Haberdashery')
  .directive('popoverElem', function() {
    return{
        link: function(scope, element, attrs) {
          element.on('click', function(){
            element.addClass('popovr-trigger');
          });
        }
    }
});