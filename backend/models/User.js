const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  privateKey: { type: String, required: true }, // Store private key here
});

const User = mongoose.model('User', userSchema);
module.exports = User;
