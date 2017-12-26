'use strict';

// server.js

// set up ======================================================== 

var express = require('express'); 
// var formidable = require('formidable');
var util = require('util');
var fs = require('fs-extra');
var qt = require('quickthumb'); 
// var multer = require("multer");
var bodyParser = require('body-parser'); // pull info from HTML POST
var mongoose = require('mongoose'); //mongoose for mongodb
var redis = require('redis');

var CookieParser = require('cookie-parser');
var SECRET = 'stylefnfRocks';
var COOKIENAME = 'stylefnfCookie';
var cookieParser = CookieParser(SECRET);

var ExpressSession = require('express-session');

var connectRedis = require('connect-redis');
var RedisStore = connectRedis(ExpressSession);
var rClient = redis.createClient();
var sessionStore = new RedisStore({client: rClient});

// on db start, flush all socket connections
rClient.select(0, function() {
  rClient.flushdb();
}); 

var app = express();  // create app w/ express  
var session = ExpressSession({
  store: sessionStore,
  secret: SECRET,
  resave: true,
  saveUninitialized: true
});

// var mongoosastic = require('mongoosastic'); // mongoosastic connection
var database = require('./config/database'); // load the db config
var config = require('./config/config');
var morgan = require('morgan') // log requests to the console
// var http = require('http');
var https = require('https');
var socketio = require('socket.io');
// var snapsearch = require('snapsearch-client-nodejs');

var methodOverride = require('method-override'); // simulate DELETE and PUT

var bcrypt = require('bcryptjs');
var cors = require('cors');
var jwt = require('jwt-simple');
var moment = require('moment');
var path = require('path');
var request = require('request');

var posts = require('./routes/Post'); // load the POST route
var users = require('./routes/User'); // load the USER route
var search = require('./routes/Search'); // load the SEARCH route
var chats = require('./routes/Chat'); // load the CHAT route


// configuration =================================================

mongoose.connect(database.url); // connect to mongodb

app.use(express.static(__dirname + '/public')); // set the static files location (i.e. /public/img will be /img for users)

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse app/x-www-form-urlencoded
app.use(bodyParser.json()); // parse app/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); //parse app/vnd.api+json as json
app.use(methodOverride());
// app.use(cors());
app.use(cors({credentials: true, origin: true}));
app.use(cookieParser);
app.use(session);

app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error('oh no'))
  }
  next();
});

// pass the session store and cookieParser
app.sessionStore = sessionStore;
app.cookieParser = cookieParser;
app.session = session;

// get the routes
app.use('/api', posts); // Posts info
app.use('/auth', users); // User info
app.use('/search', search); // searching products and people
app.use('/chat', chats); // messages

module.exports = app;