const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        // Find all users
        const users = await User.find({}, 'username email role');
        
        console.log('Users in database:');
        users.forEach(user => {
            console.log(`Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
})(); 