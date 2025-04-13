const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const GovernmentSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [12, 'Government passwords must be at least 12 characters'],
    select: false
  },
  address: { 
    type: String,
    required: [true, 'Ethereum address is required'],
    validate: {
      validator: (v) => /^0x[a-fA-F0-9]{40}$/.test(v),
      message: 'Invalid Ethereum address'
    },
    unique: true
  },
  contact: { 
    type: String,
    validate: {
      validator: (v) => /^[0-9]{10,15}$/.test(v),
      message: 'Invalid phone number'
    }
  },
  city: { 
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['govt_admin', 'govt_supervisor'],
    default: 'govt_admin'
  },
  lastAccess: {
    type: Date
  }
});

// Password hashing (same as User model)
GovernmentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

GovernmentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

GovernmentSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes
GovernmentSchema.index({ address: 1 }, { unique: true });
GovernmentSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('Government', GovernmentSchema);