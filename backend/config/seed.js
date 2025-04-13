require('dotenv').config();
const Government = require('../models/Government');
const bcrypt = require('bcrypt');

async function seedGovernmentUser() {
  try {
    // Validate .env variables
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      throw new Error('Missing admin credentials in .env');
    }

    // Skip if already exists
    if (await Government.findOne({ username: process.env.ADMIN_USERNAME })) {
      return { success: true, message: 'Admin user already exists' };
    }

    // Create admin
    await Government.create({
      username: process.env.ADMIN_USERNAME,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), // Increased salt rounds
      address: process.env.ADMIN_ADDRESS,
      contact: process.env.ADMIN_CONTACT,
      city: process.env.ADMIN_CITY,
      role: 'superadmin'
    });

    return { success: true, message: 'Government admin seeded successfully' };
  } catch (error) {
    return { 
      success: false, 
      message: 'Seeding failed',
      error: error.message 
    };
  }
}

module.exports = seedGovernmentUser;