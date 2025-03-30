const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model
require('dotenv').config(); // Load environment variables

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    // Find the admin user
    const user = await User.findOne({ username: 'adminuser' });
    expect(user).toBeTruthy(); // Ensure the user exists
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // Check if the password is hashed
    if (user) {
        console.log('Stored Hashed Password:', user.password); // Log the stored hashed password
    } else {
        console.log('Admin user not found.');
    }

    await mongoose.connection.close();
})();
