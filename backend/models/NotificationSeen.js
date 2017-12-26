var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('NotificationSeen', {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: Boolean, 
      default: true
    }
});
