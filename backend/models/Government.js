const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Web3 } = require('web3');

const governmentSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8,
    select: false
  },
  privateKey: {
    type: String,
    required: true,
    select: false
  },
  publicAddress: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

governmentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);

  if (this.isModified('privateKey')) {
    const web3 = new Web3();
    const account = web3.eth.accounts.privateKeyToAccount(this.privateKey);
    this.publicAddress = account.address;
  }

  next();
});

module.exports = mongoose.model('Government', governmentSchema);
