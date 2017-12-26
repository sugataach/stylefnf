var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Comment', {
    content : [{
      type: String,
    }],
    status: {
      type:Boolean,
      default: true
    },
    name : String,
    picture: String,
    created:{
      type:Date,
      default:Date.now
    },
    post: {
      type: Schema.ObjectId,
      ref: 'Post'
    },
    poster: {
      type: Schema.ObjectId,
      ref: 'User'
    }
});
