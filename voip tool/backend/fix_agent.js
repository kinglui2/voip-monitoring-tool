const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fixAgentPassword = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('Connected to MongoDB successfully');

        // Find the agent user
        const agent = await User.findOne({ username: 'luiz' });
        
        if (!agent) {
            console.log('Agent user not found');
            return;
        }

        console.log('\nFixing password for agent');
        console.log('Current password:', agent.password);
        
        // Hash the password directly
        const hashedPassword = await bcrypt.hash('luiz123', 10);
        
        // Update the agent's password
        await User.updateOne(
            { _id: agent._id },
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

fixAgentPassword(); 