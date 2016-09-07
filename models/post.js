var mongoose = require('mongoose');

module.exports = mongoose.Schema({
  upvotes: {type: Number, index: true},
  positive: {type: Boolean, index: true},
  text: String,
  country: {type: String, index: true},
  language: {type: String, index: true},
  created_at: {type: Date, index: true}
});
