const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
require('dotenv').config(); // Load environment variables

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    // Create a new agent user
    const agentUser = new User({
        email: 'agentuser@example.com', // Add email for the agent user
        username: 'agentuser',
        password: await bcrypt.hash('agentpassword', 10), // Hash the password
        role: 'Agent' // Set the role to Agent
    });

    await agentUser.save(); // Save the new agent user
    console.log('Agent user created successfully.');

    await mongoose.connection.close();
})();
