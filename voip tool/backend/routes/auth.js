const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Importing jsonwebtoken
const User = require('../models/User'); // Assuming User model is defined in models/User.js
const router = express.Router();

// User Registration Endpoint
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default role as 'Agent'
    const newUser = new User({
        username,
        password: hashedPassword,
        email: 'newuser@example.com', // Placeholder email
        role: 'Agent' // Default role
    });

    try {
        await newUser.save();
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// User Login Endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Log the password being checked
    console.log('Password being checked:', password);
    
    // Log the password being checked
    console.log('Password being checked:', password);
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Log the hashed password stored in the database for comparison
    console.log('Stored hashed password:', user.password);
    
    // Log the hashed password stored in the database for comparison
    console.log('Stored hashed password:', user.password);
    
    // Create and assign a token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Creating token
    res.json({ token });
});

module.exports = router;
