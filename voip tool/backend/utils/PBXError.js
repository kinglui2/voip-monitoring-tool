class PBXError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'PBXError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date();
    }
}

// Error codes
const ERROR_CODES = {
    // Connection errors
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    SSL_ERROR: 'SSL_ERROR',
    TIMEOUT: 'TIMEOUT',
    
    // API errors
    API_ERROR: 'API_ERROR',
    INVALID_RESPONSE: 'INVALID_RESPONSE',
    RATE_LIMIT: 'RATE_LIMIT',
    
    // Configuration errors
    INVALID_CONFIG: 'INVALID_CONFIG',
    MISSING_FIELDS: 'MISSING_FIELDS',
    
    // System errors
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR'
};

module.exports = {
    PBXError,
    ERROR_CODES
}; 