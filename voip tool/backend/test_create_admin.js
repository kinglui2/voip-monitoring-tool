const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
require('dotenv').config(); // Load environment variables

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    // Check if admin user already exists
    const existingAdminUser = await User.findOne({ username: 'adminuser' });
    if (existingAdminUser) {
        console.log('Admin user already exists.');
        await mongoose.connection.close();
        return;
    }

    // Create a new admin user
    const adminUser = new User({
        username: 'adminuser',
        email: 'adminuser@example.com', // Add email for the admin user
        password: await bcrypt.hash('adminpassword', 10), // Hash the password
        role: 'Admin' // Set the role to Admin
    });

    await adminUser.save(); // Save the new admin user
    console.log('Admin user created successfully.');

    await mongoose.connection.close();
})();
