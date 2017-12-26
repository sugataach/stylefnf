app.module('Haberdashery')
    .directive('hoverPopover', function ($compile, $templateCache, $timeout, $rootScope) {
        var getTemplate = function (contentType) {
            return $templateCache.get('popoverTemplate.html');
        };
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var content = getTemplate();
                $rootScope.insidePopover = false;
                $(element).popover({
                    content: content,
                    placement: 'top',
                    html: true
                });
                $(element).bind('mouseenter', function (e) {
                    $timeout(function () {
                        if (!$rootScope.insidePopover) {
                            $(element).popover('show');
                            scope.attachEvents(element);
                        }
                    }, 200);
                });
                $(element).bind('mouseleave', function (e) {
                    $timeout(function () {
                        if (!$rootScope.insidePopover)
                            $(element).popover('hide');
                    }, 400);
                });
            },
            controller: function ($scope, $element) {
                $scope.attachEvents = function (element) {
                    $('.popover').on('mouseenter', function () {
                        $rootScope.insidePopover = true;
                    });
                    $('.popover').on('mouseleave', function () {
                        $rootScope.insidePopover = false;
                        $(element).popover('hide');
                    });
                }
            }
        };
});