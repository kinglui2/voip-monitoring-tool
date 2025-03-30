const jwt = require('jsonwebtoken');

const logger = require('../logger'); // Import the logger

const authMiddleware = (req, res, next) => {
    logger.info('Authentication middleware triggered'); // Log middleware trigger
    const token = req.header('Authorization')?.replace('Bearer ', ''); 
    if (!token) {
        logger.error('Access denied. No token provided.'); // Log error
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        logger.info('User authenticated:', req.user); // Log authenticated user information
        logger.info('Decoded user:', decoded); // Log the decoded user information
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        logger.error('Invalid token.'); // Log error
        res.status(400).json({ error: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
