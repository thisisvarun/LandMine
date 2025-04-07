var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
  },
  contact: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  privateKey: { 
    type: String, 
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  governmentId: {
    type: String,
    required: true,
    unique: true
  },
  city: { type: String, required: true },
  postalCode: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: props => `${props.value} is not a valid postal code!`
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'government'],
    default: 'user'
  }
}, { timestamps: true });

module.exports = mongoose.model('users', userSchema);