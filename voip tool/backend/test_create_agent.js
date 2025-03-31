const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model
require('dotenv').config(); // Load environment variables

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // First, remove existing agent user if it exists
        await User.deleteOne({ username: 'agentuser' });

        // Create a new agent user with plain password
        const agentUser = new User({
            username: 'agentuser',
            email: 'agentuser@example.com',
            password: 'agentpassword',
            role: 'Agent'
        });

        // Let the User model's pre-save hook handle the password hashing
        await agentUser.save();
        console.log('Agent user created successfully.');

        // Verify the user was created
        const createdUser = await User.findOne({ username: 'agentuser' });
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
