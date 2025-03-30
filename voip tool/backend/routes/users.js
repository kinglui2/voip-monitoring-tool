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

module.exports = router;
