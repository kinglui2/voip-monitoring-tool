const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        // First, remove existing supervisor user if it exists
        await User.deleteOne({ username: 'supervisor1' });

        // Create a new supervisor user with plain password
        const supervisorUser = new User({
            username: 'supervisor1',
            email: 'supervisor1@example.com',
            password: 'supervisor123',
            role: 'Supervisor'
        });

        // Let the User model's pre-save hook handle the password hashing
        await supervisorUser.save();
        console.log('Supervisor user created successfully.');

        // Verify the user was created and password was hashed
        const createdUser = await User.findOne({ username: 'supervisor1' });
        console.log('Created user:', {
            username: createdUser.username,
            email: createdUser.email,
            role: createdUser.role
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
})(); 