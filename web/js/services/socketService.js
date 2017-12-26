// 'use strict';

// socket factory that provides the socket service
angular.module('Haberdashery')

  .factory('Socket', function(socketFactory, serverURL) {
            // console.log(serverURL);
            return socketFactory({
              prefix: '',
              ioSocket: io.connect(serverURL)
            });
          }
  );