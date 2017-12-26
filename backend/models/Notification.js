var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Notification', {
    notifModel: {
      type: String,
      default: ''
    },
    notifBody: {
      type: String,
      default: ''
    },
    notifBodyAlternate: {
      type: String,
      default: ''
    },
    created: {
      type: Date,
      default: Date.now
    },
    updated: {
      type: Date,
      default: Date.now
    },
    post: {
      type: Schema.ObjectId,
      ref: 'Post',
      default: null,
    },
    participants: [{
      type: Schema.ObjectId,
      ref: 'User',
      default: []
    }],
    sender: {
      type: Schema.ObjectId,
      ref: 'User',
      default: null
    },
    seen: [{
      type: Schema.ObjectId,
      ref: 'User',
      default: []
    }],
    activity: [{
      type: Schema.ObjectId,
      ref: 'Activity',
      default: []
    }]
});
