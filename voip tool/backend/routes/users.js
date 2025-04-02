const express = require('express');
const User = require('../models/User'); // Assuming User model is defined in models/User.js
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users' });
    }
});

router.post('/', async (req, res) => {
    const { username, password, email, role } = req.body;

    try {
        const newUser = new User({ username, password, email, role });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
});
