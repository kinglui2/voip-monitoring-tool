const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin-only Protected Route
router.get('/admin', authMiddleware, roleMiddleware(['Admin']), (req, res) => {
    res.json({ message: 'This is an admin-only route', user: req.user });
});

 // General Protected Route (accessible by Admin and Agent)
router.get('/general', authMiddleware, roleMiddleware(['Admin', 'Agent']), (req, res) => {
    res.json({ message: 'This is a general route accessible by Admin only', user: req.user });
});

module.exports = router;
