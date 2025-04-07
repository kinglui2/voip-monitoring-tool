const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const testLogin = async (username, password) => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('Connected to MongoDB successfully');

        // Find user
        console.log(`Looking for user: ${username}`);
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`User found with role: ${user.role}`);
        console.log('Stored password hash:', user.password);
        
        // Test password using both methods
        console.log('\nTesting password using model method...');
        const isMatch = await user.comparePassword(password);
        console.log(`Password match result (model method): ${isMatch}`);

        console.log('\nTesting password using bcrypt directly...');
        const isMatchDirect = await bcrypt.compare(password, user.password);
        console.log(`Password match result (direct bcrypt): ${isMatchDirect}`);

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
};

// Test login for agent user
testLogin('luiz', 'luiz123'); 