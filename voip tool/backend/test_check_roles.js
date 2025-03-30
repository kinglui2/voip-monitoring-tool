const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model
require('dotenv').config(); // Load environment variables

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    // Find the admin and agent users
    const adminUser = await User.findOne({ username: 'adminuser' });
    const agentUser = await User.findOne({ username: 'agentuser' });

    if (adminUser) {
        console.log('Admin User Role:', adminUser.role); // Log the admin user role
    } else {
        console.log('Admin user not found.');
    }

    if (agentUser) {
        console.log('Agent User Role:', agentUser.role); // Log the agent user role
    } else {
        console.log('Agent user not found.');
    }

    await mongoose.connection.close();
})();
