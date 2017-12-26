var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Offer', {
    total : Number,
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
    title: String,
    poster: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      default: 'active'
    },
    accepted: {
      type: Boolean,
      default: false
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    sellerFee: {
      type: Number,
      default: 0
    },
    cancellationReason: {
      type: String,
      default: ""
    }
    /*
    location: [{
       type: Schema.ObjectId,
       ref: 'Location'
    }],
    offerDate: 
    */
});
