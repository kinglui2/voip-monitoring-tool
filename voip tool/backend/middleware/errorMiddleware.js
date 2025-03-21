const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.Console()
    ]
});

// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
    logger.error(err.message, { metadata: err });
    res.status(500).json({ error: 'An unexpected error occurred.' });
};

module.exports = errorMiddleware;
