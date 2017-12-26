'use strict';

// load the post model
var Post = require('../models/Post');
var User = require('../models/User');
var Comment = require('../models/Comment');
var Like = require('../models/Like');
var Offer = require('../models/Offer');
var express = require('express');
var moment = require('moment');
var router = express.Router();
var config = require('../config/config');
var querystring = require('querystring');
var ObjectId = require('mongoose').Types.ObjectId;

/*
 |--------------------------------------------------------------------------
 | SEARCH POSTS
 |--------------------------------------------------------------------------
 */

router.route('/:search_param').options(function(req,res) {
  res.send('hello');
});

router.route('/:search_param').post(function(req,res) {
  
  // create a hashmap of the separate search terms
  var map = querystring.parse(req.body.query);
  // console.log(req.body);

  // console.log(map);
  
  // var used for getting all items
  var total_items;

  // var used to keep track of seen items
  var seen_ids;

  // var used for iterating
  var x;

  // construct a basic query
  var query = Post.find( 
      // { _id   : { $nin: seenIds } } 
  );

  // start building the query

  // if the search param contains: 

  // a term to search for, reconstruct the initial query to search for the query
  if (map.term) {
    query = Post.find(
        { $text : { $search : map.term } }, 
        { score : { $meta: "textScore" } }
        // { "_id" : { $nin: seenIds } },
        // { status: { $nin: [ 'cancelled' ] } }
    );
  }

  // // macro to limit the search to
  // var search_macros = [];

  // if (!map.macro && !map.term) {
  //   map['macro'] = "fashion";
  //   search_macros.push('fashion');
  //   query.where('macro').in(search_macros);
  // }
  // else if (map.macro) {
  //   var split_macros = map.macro.split(" ");

  //   for (x in split_macros) {
  //     search_macros.push(split_macros[x].toLowerCase());
  //   }
  //   // console.log(search_categories);

  //   query.where('macro').in(search_macros);
  // }

  // macro to limit the search to
  if (map.macro) {

    var search_macro = [];
    var split_macro = map.macro.split(" ");

    for (x in split_macro) {
      search_macro.push(split_macro[x]);
    }
    search_macro.push('Any');
    // console.log(search_categories);

    query.where('macro').in(search_macro);
    // query.where('gender').in(['Any']);
  }


  // console.log(map.term);
  // console.log(query);

  query.where('status').nin(['cancelled', 'Paid', 'Sold']);

  // gender to limit the search to
  if (map.gender) {

    var search_gender = [];
    var split_gender = map.gender.split(" ");

    for (x in split_gender) {
      search_gender.push(split_gender[x]);
    }
    search_gender.push('Any');
    // console.log(search_categories);

    query.where('gender').in(search_gender);
    // query.where('gender').in(['Any']);
  }


  // categories to limit the search to
  if (map.category) {

    var search_categories = [];
    var split_categories = map.category.split(" ");

    for (x in split_categories) {
      search_categories.push(split_categories[x].toLowerCase());
    }
    // console.log(search_categories);

    query.where('category').in(search_categories);
  }

  // condition to limit the search to
  if (map.condition) {

    var search_condition = [];
    var split_condition = map.condition.split(" ");

    for (x in split_condition) {
      search_condition.push(split_condition[x]);
    }
    // console.log(search_condition);

    query.where('condition').in(search_condition);
  }

  // sizes to limit the search to
  if (map.sizes) {

    var search_sizes = [];
    var split_sizes = map.sizes.split(" ");

    for (x in split_sizes) {
      search_sizes.push(split_sizes[x]);
    }
    // console.log(search_sizes);

    query.where('size').in(search_sizes);
  }

  // price to limit the search to
  if (map.pricegt && map.pricelt) {

    query.where('price').gt(map.pricegt).lt(map.pricelt);
  
  }

  // sort the results
  if (map.sort) {
    var search_sort = '-' + map.sort;
    // var search_sort;

    if (map.sort == "newest") {
      search_sort = "-created";
    }

    if (map.sort == "pricehightolow") {
      // search_sort = "-created -price";
      search_sort = "-price";
    }

    if (map.sort == "pricelowtohigh") {
      // search_sort = "-created price";
      search_sort = "price";
    }

    if (map.sort == "popular") {
      // search_sort = "-created -views";
      search_sort = "-views";
    }

    if (map.sort == "trending") {
      // most views within a 72hr period
      var today = moment().startOf('day');
      var FiveDaysAgo = moment(today).subtract(5, 'days');

      query.where('created').gt(FiveDaysAgo.toDate());

      //replace with likes?
      search_sort = '-created -views';
    }

    query.sort(search_sort);
  }

  // var used for ids of posts that have already been seen
  var seenIds = [];

  // on load more don't show the already seen ids
  if (req.body.seenids) {

    // prolly won't be needed once we use bodyparser
    // console.log(req.headers.seenids.split(" "));
    var temp = req.body.seenids.split(" ")

    for (x in temp) {
      if (temp[x].length != 0) {
        // console.log(temp[x].length);
        // seenIds.push(new ObjectId(temp[x]));
        seenIds.push(temp[x]);
      }
    }

    // console.log(seenIds.length);
    query.where('_id').nin(seenIds);
  }

  // console.log('seenIds: ' + seenIds.length);


  // // This is SUPER DIRTY, 2 queries per db call FIX!!!
  // query.exec(function(err, raw_results) {
  //   if (raw_results) {
  //     total_items = raw_results.length;
  //     console.log(total_items);
  //     console.log('blah blah blah');
  //   }
  // });

  // populate the likes for the posts
  query.populate('likes', null, { status: { $in: [ 'true' ] } });

  query.populate('seller');

  // limit the query to 9 results per fetch
  // query.limit(9);
  // query.limit(9);

  // execute the query
  query.exec(function(err, results) {

        // console.log(results);
        // callback
        // console.log(results);

        // for the posts in the results, populate the likes and the users in the likes
        User.populate(results, {
          path:'likes.user'
        }, function(err, results) {    
          // console.log(results.length);   

            var send_result = {}
            if (results) {
              send_result['results'] = results.slice(0,9);
              send_result['query_map'] = map;
              send_result['total_items'] = results.length;
            }
            // send_result['seen_ids'] = seen_ids;
            // console.log('haha');
            // console.log(send_result.total_items);
            res.json(send_result);
        });
        // res.json(results);
  });
});

router.route('/:search_param').get(function(req, res) {

  // create a hashmap of the separate search terms
  var map = querystring.parse(req.params.search_param);

  // console.log(map);
  
  // var used for getting all items
  var total_items;

  // var used to keep track of seen items
  var seen_ids;

  // var used for iterating
  var x;

  // construct a basic query
  var query = Post.find( 
      // { _id   : { $nin: seenIds } } 
  );

  // start building the query

  // if the search param contains: 

  // a term to search for, reconstruct the initial query to search for the query
  if (map.term) {
    query = Post.find(
        { $text : { $search : map.term } }, 
        { score : { $meta: "textScore" } }
        // { "_id" : { $nin: seenIds } },
        // { status: { $nin: [ 'cancelled' ] } }
    );
  }

  // // macro to limit the search to
  // var search_macros = [];

  // if (!map.macro && !map.term) {
  //   map['macro'] = "fashion";
  //   search_macros.push('fashion');
  //   query.where('macro').in(search_macros);
  // }
  // else if (map.macro) {
  //   var split_macros = map.macro.split(" ");

  //   for (x in split_macros) {
  //     search_macros.push(split_macros[x].toLowerCase());
  //   }
  //   // console.log(search_categories);

  //   query.where('macro').in(search_macros);
  // }

  // macro to limit the search to
  if (map.macro) {

    var search_macro = [];
    var split_macro = map.macro.split(" ");

    for (x in split_macro) {
      search_macro.push(split_macro[x]);
    }
    search_macro.push('Any');
    // console.log(search_categories);

    query.where('macro').in(search_macro);
    // query.where('gender').in(['Any']);
  }


  // console.log(map.term);
  // console.log(query);

  query.where('status').nin(['cancelled']);

  // gender to limit the search to
  if (map.gender) {

    var search_gender = [];
    var split_gender = map.gender.split(" ");

    for (x in split_gender) {
      search_gender.push(split_gender[x]);
    }
    search_gender.push('Any');
    // console.log(search_categories);

    query.where('gender').in(search_gender);
    // query.where('gender').in(['Any']);
  }


  // categories to limit the search to
  if (map.category) {

    var search_categories = [];
    var split_categories = map.category.split(" ");

    for (x in split_categories) {
      search_categories.push(split_categories[x].toLowerCase());
    }
    // console.log(search_categories);

    query.where('category').in(search_categories);
  }

  // condition to limit the search to
  if (map.condition) {

    var search_condition = [];
    var split_condition = map.condition.split(" ");

    for (x in split_condition) {
      search_condition.push(split_condition[x]);
    }
    // console.log(search_condition);

    query.where('condition').in(search_condition);
  }

  // sizes to limit the search to
  if (map.sizes) {

    var search_sizes = [];
    var split_sizes = map.sizes.split(" ");

    for (x in split_sizes) {
      search_sizes.push(split_sizes[x]);
    }
    // console.log(search_sizes);

    query.where('size').in(search_sizes);
  }

  // price to limit the search to
  if (map.pricegt && map.pricelt) {

    query.where('price').gt(map.pricegt).lt(map.pricelt);
  
  }

  // sort the results
  if (map.sort) {
    var search_sort = '-' + map.sort;
    // var search_sort;

    if (map.sort == "newest") {
      search_sort = "-created";
    }

    if (map.sort == "pricehightolow") {
      // search_sort = "-created -price";
      search_sort = "-price";
    }

    if (map.sort == "pricelowtohigh") {
      // search_sort = "-created price";
      search_sort = "price";
    }

    if (map.sort == "popular") {
      // search_sort = "-created -views";
      search_sort = "-views";
    }

    if (map.sort == "trending") {
      // most views within a 72hr period
      var today = moment().startOf('day');
      var FiveDaysAgo = moment(today).subtract(5, 'days');

      query.where('created').gt(FiveDaysAgo.toDate());

      //replace with likes?
      search_sort = '-created -views';
    }

    query.sort(search_sort);
  }

  // var used for ids of posts that have already been seen
  var seenIds = [];

  // on load more don't show the already seen ids
  if (req.headers.seenids) {

    // prolly won't be needed once we use bodyparser
    // console.log(req.headers.seenids.split(" "));
    var temp = req.headers.seenids.split(" ")

    for (x in temp) {
      // console.log(temp[x]);
      // seenIds.push(new ObjectId(temp[x]));
      seenIds.push(temp[x]);
    }

    // console.log(seenIds.length);
    query.where('_id').nin(seenIds);
  }

  // console.log('seenIds: ' + seenIds.length);


  // // This is SUPER DIRTY, 2 queries per db call FIX!!!
  // query.exec(function(err, raw_results) {
  //   if (raw_results) {
  //     total_items = raw_results.length;
  //     console.log(total_items);
  //     console.log('blah blah blah');
  //   }
  // });

  // populate the likes for the posts
  query.populate('likes', null, { status: { $in: [ 'true' ] } });

  query.populate('seller');

  // limit the query to 9 results per fetch
  // query.limit(9);
  // query.limit(9);

  // execute the query
  query.exec(function(err, results) {

        // console.log(results);
        // callback
        // console.log(results);

        // for the posts in the results, populate the likes and the users in the likes
        User.populate(results, {
          path:'likes.user'
        }, function(err, results) {       

            var send_result = {}
            if (results) {
              send_result['results'] = results.slice(0,9);
              send_result['query_map'] = map;
              send_result['total_items'] = results.length;
            }
            // send_result['seen_ids'] = seen_ids;
            // console.log(send_result);
            res.json(send_result);
        });
        // res.json(results);
  });

});

/*
 |--------------------------------------------------------------------------
 | GET USERS
 |--------------------------------------------------------------------------
 */

router.route('/users/:search_param').get(function(req, res) {
  
  // create a hashmap of the separate search terms
  var map = querystring.parse(req.params.search_param);

  // start building the query

  // if the search param contains: 

  // a term to search for, reconstruct the initial query to search for the query
  if (map.term) {
    var query = User.find(
        { $text : { $search : map.term } }, 
        { score : { $meta: "textScore" } }
        // { "_id" : { $nin: seenIds } },
        // { status: { $nin: [ 'cancelled' ] } }
    );
  }

  // console.log(map.term);
  // console.log(query);

  // This is SUPER DIRTY, 2 queries per db call FIX!!!
  // query.exec(function(err, raw_results) {
  //   if (raw_results) {
  //     total_items = raw_results.length;
  //     console.log(total_items);
  //   }
  // });

  // execute the query
  query.exec(function(err, results) {

        // console.log(results);

        var send_result = {}
        send_result['results'] = results;
        send_result['query_map'] = map;
        // send_result['seen_ids'] = seen_ids;
        // console.log(results);
        res.json(send_result);
        // callback
        // console.log(results);

        // res.json(results);
  });

});

/*
 |--------------------------------------------------------------------------
 | GET FEATURED POSTS
 |--------------------------------------------------------------------------
 */

router.route('/featured/posts').get(function(req, res) {

  // construct a basic query
  var query = Post.find( 
      { isFeatured: true } 
  );

  // populate the likes for the posts
  query.populate('likes', null, { status: { $in: [ 'true' ] } });

  // populate the seller for the posts
  query.populate('seller');

  // limit the query to 9 results per fetch
  // query.limit(9);
  // query.limit(9);

  // execute the query
  query.exec(function(err, results) {

        // console.log(results);
        // callback
        // console.log(results);

        // for the posts in the results, populate the likes and the users in the likes
        User.populate(results, {
          path:'likes.user'
        }, function(err, results) {
            // console.log(results);
            res.json(results);
        });
        // res.json(results);
  });


});

/*
 |--------------------------------------------------------------------------
 | GET FEATURED USERS
 |--------------------------------------------------------------------------
 */

router.route('/featured/users').get(function(req, res) {

  User.aggregate([
    { $match: { 'isComplete': true} },
    { $project : { _id : 1, numOfPosts : {$size: "$myPosts"} }},
    { $sort : { numOfPosts: -1 } },
    { $limit: 4 }
    // { $unwind : "$tags" },
    // { $group : { _id : {tags : "$tags"}, authors : { $addToSet : "$author" } }}
  ], function(err, result) {

    User.populate(result, {path: "_id"}, function(err, results) {
        // console.log(results);
        res.json(results);
    });

  });


});

module.exports = router;