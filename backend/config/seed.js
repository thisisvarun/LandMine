const Government = require('../models/Government');
const bcrypt = require('bcrypt');

async function seedGovernmentUser() {
  const existing = await Government.findOne({ username: 'admin' });
  if (existing) return;

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const govtUser = new Government({
    username: 'admin',
    password: hashedPassword,
    address: '0x383E286EA48E1626605e349C6a72c11e10CC46F1',
    contact: '1234567890',
    city: 'Surampalem', // Add a city to match schema
  });

  await govtUser.save();
  console.log('✅ Government user seeded.');
}

module.exports = seedGovernmentUser;
