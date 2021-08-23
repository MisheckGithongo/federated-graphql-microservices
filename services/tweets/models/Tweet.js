const mongoose = require('mongoose');

const {Schema} = mongoose;

const tweetSchema = new Schema({
  text: {type: String, required: true},
  userId: {type: String, required: true},
});

module.exports = mongoose.model('tweet', tweetSchema);
