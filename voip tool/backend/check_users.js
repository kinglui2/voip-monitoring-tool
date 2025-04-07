const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('Connected to MongoDB successfully');

        // Find all users
        const users = await User.find({}, 'username email role');
        
        console.log('\nUsers in database:');
        if (users.length === 0) {
            console.log('No users found in the database');
        } else {
            users.forEach(user => {
                console.log(`Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
            });
        }

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})(); 