const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        // First, remove existing supervisor user if it exists
        await User.deleteOne({ username: 'supervisor1' });

        // Create a new supervisor user
        const supervisorUser = new User({
            username: 'supervisor1',
            email: 'supervisor1@example.com',
            password: 'supervisor123',
            role: 'Supervisor'
        });

        await supervisorUser.save();
        console.log('Supervisor user created successfully.');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
})(); 