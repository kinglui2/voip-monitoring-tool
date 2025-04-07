const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fixSupervisorPassword = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('Connected to MongoDB successfully');

        // Find the supervisor user
        const supervisor = await User.findOne({ username: 'supervisor' });
        
        if (!supervisor) {
            console.log('Supervisor user not found');
            return;
        }

        console.log('\nFixing password for supervisor');
        console.log('Current password:', supervisor.password);
        
        // Hash the password directly
        const hashedPassword = await bcrypt.hash('supervisor123', 10);
        
        // Update the supervisor's password
        await User.updateOne(
            { _id: supervisor._id },
            { $set: { password: hashedPassword } }
        );
        
        console.log('New hashed password:', hashedPassword);
        console.log('Password updated successfully');

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
};

fixSupervisorPassword(); 