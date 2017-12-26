var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Chat', {
    messages: [{
      type: Schema.ObjectId,
      ref: 'Message',
      default: []
    }],
    status: {
      type:Boolean,
      default: true
    },
    created:{
      type:Date,
      default:Date.now
    },
    lastUpdated: {
      type: Date,
      default:Date.now
    },
    lastMessage: {
      type: String,
      default: ''
    },
    participants: [{
      type: Schema.ObjectId,
      ref: 'User',
      default: []
    }],
    hasUnseenMessages: {
      type: Boolean,
      default: false
    },
    lastSentUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
});
