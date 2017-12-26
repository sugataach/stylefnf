// use module.exports to expose our Post mongoose model to the file that needs it whenever it is loaded using require

// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: { type: String, lowercase: true, required: true, unique: true },
  password: { type: String, select: false, required: true},
  // email: { type: String, lowercase: true, unique: true },
  // password: { type: String, select: false },
  username: String,
  fullName: String,
  picture: String,
  profilePictures: [{
    type: String,
    default: null
  }],
  mobileProfileAvatars: [{
    type: String,
    default: null
  }],
  mobileProfileDisplay: [{
    type: String,
    default: null
  }],
  socketIDs: [{
    type: String,
    default: null
  }],
  aliasEmail: String,
  gender: String,
  accessToken: String,
  instagramId: { type: String, index: true },
  instagramUsername: String,
  instagramName: String,
  instagramPicture: String,
  instagramAccessToken: String,
  facebook: { type: String, index: true },
  facebookPicture: String,
  facebookName: String,
  facebookDisplayName: String,
  firstName: String,
  lastName: String,
  education: {
    type: String,
    default: 'University of Toronto'
  }, 
  deviceToken: [{
    type: String,
    default: ''
  }], 
  major: String,
  status: String,
  joined: {
    type: Date,
    default: Date.now
  },
  work: {
    type: String,
    default: 'student'
  },
  location: {
    type: String,
    default: 'Toronto, ON'
  },
  hometown: {
    type: String,
    default: 'Toronto, ON'
  },
  about: {
    type: String,
    default: 'No description given.'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  style : [{
      type : String
  }],
  myPosts:[{
      type: Schema.ObjectId,
      ref: 'Post'
  }],
  offeredPosts:[{
      type: Schema.ObjectId,
      ref: 'Offer'
  }],
  likedPosts:[{
      type: Schema.ObjectId,
      ref: 'Like'
  }],
  messageNotifications: [{
    type: Schema.ObjectId,
    ref: 'Chat'
  }],
  notifications: [{
    type: Schema.ObjectId,
    ref: 'Notification'    
  }],
  unseenNotifications: [{
    type: Schema.ObjectId,
    ref: 'Notification'
  }],
  myActivity: [{
    type: Schema.ObjectId,
    ref: 'Activity'
  }],
  chats: [{
    type: Schema.ObjectId,
    ref: 'Chat',
    default: []
  }],
  followers: [{
    type: Schema.ObjectId,
    ref: 'User',
    default: []
  }],
  following: [{
    type: Schema.ObjectId,
    ref: 'User',
    default: []
  }],
  socketID: {
    type: String,
    default: ""
  },
  viewedPosts: [{
    type: Schema.ObjectId,
    ref: 'Post',
    default: []
  }],
  signupToken: {
    type: String
  },
  signupTokenExpires: {
    type: Date
  },
  signupRequest: {
    type: Number,
    default: 0
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  purchasedPosts:[{
    type: Schema.ObjectId,
    ref: 'Post',
    default: []
  }],
  soldPosts:[{
    type: Schema.ObjectId,
    ref: "Post",
    default: []
  }]
  // likedPosts:[{
  //     type: Schema.ObjectId,
  //     ref: 'Post'
  // }],
  // facebook: is a a json and parse the json individually
  // instagram: same as facebook
});

userSchema.index({ 
  firstName: 'text',
  lastName: 'text' 
});

userSchema.set('autoIndex', true);

// db.nutrition.ensureIndex({ facebookDisplayName : "text" });

module.exports = mongoose.model('User', userSchema);