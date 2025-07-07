const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User').default;
const connectDB = require('../config/db').default;

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@ekonsulta.com' });

    if (adminExists) {
      console.log('Administrator already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Administrator',
      username: 'admin_konsulta',
      email: 'admin@ekonsulta.com',
      password: 'admin123',
      role: 'administrator',
      phone: '09123456789',
      address: 'eKonsulta Admin Office'
    });

    console.log('Administrator created successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

// Run the function
createAdminUser();