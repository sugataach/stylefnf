var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Activity', {
    activityModel: {
      type: String
    },
    created: {
      type: Date,
      default: Date.now
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    modelRef: {
      type: Schema.ObjectId
    },
    post: {
      type: Schema.ObjectId,
      ref: 'Post',
      default: null
    },
    comment: {
      type: String,
      default: ''
    }
});
