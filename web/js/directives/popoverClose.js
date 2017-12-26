'use strict';

angular.module('Haberdashery')
  .directive('popoverClose', function($timeout) {
    return{
      scope: {
        excludeClass: '@'
      },
      link: function(scope, element, attrs) {

        function closeTrigger(trigger, i) {
          $timeout(function(){
            $("#"+trigger[0].id).triggerHandler('click');
            $("#"+trigger[0].id).removeClass('popovr-trigger')
          });
        }

        element.on('click', function(event){
          var trigger = document.getElementsByClassName('popovr-trigger'),
              etarget = angular.element(event.target),
              tlength = trigger.length;
          if(!etarget.hasClass('popovr-trigger') && !etarget.hasClass(scope.excludeClass)) {
            for(var i=0; i<tlength; i++) {
              closeTrigger(trigger, i)
            }
          }
        });
      }
    };
});