const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
require('dotenv').config(); // Load environment variables

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    // Find the admin user
    const user = await User.findOne({ username: 'adminuser' });
    expect(user).toBeTruthy(); // Ensure the user exists

    // Hash the new password
    const newPassword = 'newadminpassword';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword; // Update the password
    await user.save(); // Save the updated user

    // Verify the password update
    const updatedUser = await User.findOne({ username: 'adminuser' });
    expect(await bcrypt.compare(newPassword, updatedUser.password)).toBe(true); // Check if the new password matches
    if (user) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash('adminpassword', 10);
        user.password = hashedPassword; // Update the password
        await user.save(); // Save the updated user
        console.log('Admin password updated to hashed version.');
    } else {
        console.log('Admin user not found.');
    }

    await mongoose.connection.close();
})();
