const logger = require('../logger'); // Import the logger

const roleMiddleware = (allowedRoles) => {
    logger.info('Role middleware triggered'); // Log middleware trigger
    return (req, res, next) => {
        const userRole = req.user.role; // Assuming the user role is stored in the JWT payload
        logger.info('User role retrieved: ' + userRole); // Log user role retrieval
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            logger.error('Access denied. Insufficient permissions.'); // Log error
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
    };
};

module.exports = roleMiddleware;
