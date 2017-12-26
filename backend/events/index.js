'use strict';

var redis = require('redis');
var redisWorker = redis.createClient();

// we store socketids in db 2
redisWorker.select(2, function() {
  // on db start, flush all socket connections
  redisWorker.flushdb();
});

module.exports = function(io) {
  io.on('connection', function(socket) {

    console.log('connection');

    // this event is emitted from the client on a successful login
    socket.on('active', function(id) {
      // we store the socket ids in a set (since all sockets are unique)
      // K-V pair -> currentUserID : socketID
      redisWorker.sadd(id["id"], socket.id);

      // give the current socket the user's id, so we can reference it
      socket.currentUser = id["id"];
    });

    // on disconnect, remove the socket from the user's active socket list
    socket.on('disconnect', function() {
      if (socket.currentUser) {
        redisWorker.srem(socket.currentUser, socket.id);
      }
    });

  });
}