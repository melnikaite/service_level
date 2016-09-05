var mongoose = require('mongoose');

module.exports = mongoose.Schema({
  upvotes: Number,
  positive: Boolean,
  text: String,
  country: Number,
  language: Number
});
