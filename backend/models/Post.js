// use module.exports to expose our Post mongoose model to the file that needs it whenever it is loaded using require

// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    brand : {
      type: String,
      default: "No Brand"
    },
    macro : {
      type: String,
      default: "Fashion"
    },
    return: {
      type: String,
      default: "No"
    },
    title : String,
    imageUrl : String,
    price : Number,
    retail : Number,
    category : String,
    condition : String,
    location : String,
    colour : {
      type: String,
      default: "No colour given"
    },
    size : String,
    room : {
      type: String
    },
    description : {
      type: String,
      default: "No description given."
    },
    seller: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    seller_id: String,
    seller_name : String,
    seller_pic : String,
    isFeatured: {
      type: Boolean,
      default: false
    },
    tags : {
      type : String,
      default: "#cool #cute"
    },
    imageUrls : [{
      type : String
    }],
    mobileImageUrls : [{
      type : String,
      default: ''
    }],
    mobileImageUrlsAvatar: [{
      type: String,
      default: null
    }],
    gender : {
      type : String
    },
    datetime: Number,
    status: String,
    created:{
      type:Date,
      default:Date.now
    },
    updated: [{
      type:Date,
      default:Date.now
    }],
    comments:[{
      type: Schema.ObjectId,
      ref: 'Comment'
    }],
    likes: [{
      type: Schema.ObjectId,
      ref: 'Like'
    }],
    offers: [{
      type: Schema.ObjectId,
      ref: 'Offer'
    }],
    views : {
      type:Number,
      default:0
    },
    buyer: {
      type: String,
      default: ''
    },
    holder: {
      type: String,
      default: ''
    },
    viewedBy: [{
      type: Schema.ObjectId,
      ref: 'User'
    }],
    locations: [{
      type: Schema.Types.Mixed,
      default: []
    }],
    ifTryOn: {
      type: String,
      default: 'No'
    },
});

postSchema.index({ 
  brand: 'text', 
  title: 'text', 
  description: 'text',
  colour: 'text', 
  category: 'text',
  tags: 'text',
});

// may need to enable for prod
postSchema.set('autoIndex', true);

module.exports = mongoose.model('Post', postSchema);
