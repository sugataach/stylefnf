var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Message', {
    content : {
      type: String,
      required: true
    },
    chat: {
      type: Schema.ObjectId,
      ref: 'Chat'
    },
    location: String,
    status: {
      type:Boolean,
      default: true
    },
    created:{
      type:Date,
      default:Date.now
    },
    sender: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true
    },
    seenTimestamp: {
      type: Date,
      default: null
    }
});
