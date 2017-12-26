var app = require('../server'); //Require our app

var express = require('express'),
    http = require('http'),
    // https = require('https'),
    socketio = require('socket.io');

var fs = require('fs');
// var createServer = require("auto-sni");

// var options = {
//   key: fs.readFileSync('file.pem'),
//   cert: fs.readFileSync('file.crt')
// };
 
// Attach Socket.io
var server = http.createServer(app);
// var server = https.createServer(options, app);
// var server = createServer({
//     email: 'sugata.a@gmail.com', // Emailed when certificates expire.
//     agreeTos: true, // Required for letsencrypt.
//     debug: true, // Add console messages and uses staging LetsEncrypt server. (Disable in production)
//     domains: ["", ["test.com", "www.test.com"]], // List of accepted domain names. (You can use nested arrays to register bundles with LE).
//     forceSSL: false, // Make this false to disable auto http->https redirects (default true).
//     ports: {
//         // http: 444, // Optionally override the default http port.
//         https: 443 // // Optionally override the default https port.
//     }
// });
var io = socketio(server);

var socketIOExpressSession = require('socket.io-express-session');
io.use(socketIOExpressSession(app.session)); // session support

var setEvents = require('../events');
setEvents(io);


// var users = [];
// var uid = "";

// io.on('connection', function(socket) {

//   // var uIdSocket = socket.request.session.uid;
//   console.log('connection');

//   //
//   socket.on('disconnect', function() {
//     // console.log(socket);
//   });

// });

app.set('port', process.env.PORT || 3000);
app.set('socketio', io);
app.set('server', server);
 
app.get('server').listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});