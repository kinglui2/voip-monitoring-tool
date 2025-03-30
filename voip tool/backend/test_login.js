const request = require('supertest');
const User = require('./models/User'); // Import User model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const app = express();
require('dotenv').config(); // Load environment variables

app.use(express.json());
app.use('/api/auth', authRoutes);

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    // Create Admin user if it doesn't exist
    const existingAdmin = await User.findOne({ username: 'adminuser' });
    if (!existingAdmin) {
        const adminUser = new User({
            username: 'adminuser',
            password: await bcrypt.hash('adminpassword', 10),
            email: 'admin@example.com',
            role: 'Admin'
        });
        await adminUser.save();
    }

    // Login as Admin
    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
            username: 'adminuser',
            password: 'adminpassword'
        });

    console.log('Login Response:', loginResponse.body); // Log the entire response for debugging
    console.log('Admin Token:', loginResponse.body.token); // Log the token
    await mongoose.connection.close();
})();
