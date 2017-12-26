var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Like', {
    name: String,
    created:{
      type:Date,
      default:Date.now
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {type: Boolean, default: true}
});
