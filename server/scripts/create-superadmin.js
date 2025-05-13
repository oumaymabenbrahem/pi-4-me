require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to the database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create a superadmin user
async function createSuperAdmin() {
  try {
    // Check if a superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('A superadmin user already exists:');
      console.log(`Email: ${existingSuperAdmin.email}`);
      console.log(`Username: ${existingSuperAdmin.username}`);
      mongoose.connection.close();
      return;
    }
    
    // Default superadmin user data
    const superAdminData = {
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: 'superadmin123', // This will be hashed
      firstname: 'Super',
      lastname: 'Admin',
      address: '123 Admin St',
      phone: '+1234567890',
      role: 'superadmin'
    };
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 12);
    
    // Create the superadmin user
    const superAdmin = new User({
      ...superAdminData,
      password: hashedPassword
    });
    
    await superAdmin.save();
    
    console.log('Superadmin user created successfully:');
    console.log(`Email: ${superAdminData.email}`);
    console.log(`Username: ${superAdminData.username}`);
    console.log(`Password: ${superAdminData.password} (unhashed version)`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating superadmin user:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

createSuperAdmin(); 