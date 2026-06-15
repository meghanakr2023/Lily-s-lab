require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    await User.create({
      name: 'Lily Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isEmailVerified: true
    });

    console.log('✅ Admin created successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });