const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to check if user is authenticated
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Access denied. Invalid token.' });
    }
};

// Middleware to check if user has admin role
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
};

// Admin-only route
router.get('/admin', authenticateToken, isAdmin, (req, res) => {
    res.json({ message: 'Admin access granted' });
});

// General route (accessible to all authenticated users)
router.get('/general', authenticateToken, (req, res) => {
    res.json({ message: 'General access granted' });
});

module.exports = router;
