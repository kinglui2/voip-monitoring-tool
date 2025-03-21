const jwt = require('jsonwebtoken');

const logger = require('../logger'); // Import the logger

const authMiddleware = (req, res, next) => {
    // Temporarily bypass authentication for testing
    logger.info('Authentication middleware triggered'); // Log middleware trigger
    next();
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        logger.error('Access denied. No token provided.'); // Log error
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Invalid token.'); // Log error
        res.status(400).json({ error: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
