const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const governmentSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  privateKey: {  // DEMO ONLY
    type: String,
    required: [true, 'Private key is required for demo'],
    select: false,
    validate: {
      validator: (v) => /^0x[a-fA-F0-9]{64}$/.test(v),
      message: 'Invalid private key format'
    }
  },
  publicAddress: {  // Derived from private key
    type: String,
    required: true,
    validate: {
      validator: (v) => /^0x[a-fA-F0-9]{40}$/.test(v),
      message: 'Invalid Ethereum address'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Modified pre-save hook for government
governmentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  
  // DEMO ONLY: Update public address if private key changes
  if (this.isModified('privateKey')) {
    const web3 = new Web3();
    const account = web3.eth.accounts.privateKeyToAccount(this.privateKey);
    this.publicAddress = account.address;
  }
  
  next();
});

// Keep the existing comparePassword method
// Add getPrivateKey method if needed (same as user model)

module.exports = mongoose.model('Government', governmentSchema);