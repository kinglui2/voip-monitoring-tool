const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(), // Log to console
        new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log errors to a file
        new winston.transports.File({ filename: 'combined.log' }) // Log all messages to a file
    ]
});

// Export the logger
module.exports = logger;
