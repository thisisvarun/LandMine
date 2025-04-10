var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
  },
  contact: { type: String, required: true },
  privateKey: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);  // Updated collection name
