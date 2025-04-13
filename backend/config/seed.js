const Government = require('../models/Government');
const bcrypt = require('bcrypt');

async function seedGovernmentUser() {
  const existing = await Government.findOne({ username: 'admin' });
  if (existing) return;

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const govtUser = new Government({
    username: 'admin',
    password: hashedPassword,
    address: '0x4335BdD13cB56abf4542b841a0e7ca9fb7f4CBFc',
    contact: '1234567890',
    city: 'Surampalem', // Add a city to match schema
  });

  await govtUser.save();
  console.log('✅ Government user seeded.');
}

module.exports = seedGovernmentUser;
