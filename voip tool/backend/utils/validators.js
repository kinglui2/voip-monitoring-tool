/**
 * Validates a date range object
 * @param {Object} dateRange - The date range to validate
 * @param {Date|number|string} dateRange.start - Start date
 * @param {Date|number|string} dateRange.end - End date
 * @throws {Error} If the date range is invalid
 */
exports.validateDateRange = (dateRange) => {
    if (!dateRange || !dateRange.start || !dateRange.end) {
        throw new Error('Date range must include both start and end dates');
    }

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
    }

    if (start > end) {
        throw new Error('Start date must be before end date');
    }

    const maxRange = 365; // Maximum range of one year
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (daysDiff > maxRange) {
        throw new Error(`Date range cannot exceed ${maxRange} days`);
    }
};

/**
 * Validates currency amount
 * @param {number} amount - The amount to validate
 * @throws {Error} If the amount is invalid
 */
exports.validateAmount = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        throw new Error('Amount must be a valid number');
    }

    if (amount < 0) {
        throw new Error('Amount cannot be negative');
    }

    // Check if amount has more than 2 decimal places
    if (Math.round(amount * 100) / 100 !== amount) {
        throw new Error('Amount cannot have more than 2 decimal places');
    }
};

/**
 * Validates payment status
 * @param {string} status - The status to validate
 * @throws {Error} If the status is invalid
 */
exports.validatePaymentStatus = (status) => {
    const validStatuses = ['paid', 'pending', 'failed'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid payment status');
    }
};

/**
 * Validates export format
 * @param {string} format - The format to validate
 * @throws {Error} If the format is invalid
 */
exports.validateExportFormat = (format) => {
    const validFormats = ['csv', 'xlsx', 'pdf'];
    if (!validFormats.includes(format)) {
        throw new Error('Invalid export format');
    }
};

/**
 * Validates grouping option
 * @param {string} groupBy - The grouping option to validate
 * @throws {Error} If the grouping option is invalid
 */
exports.validateGroupBy = (groupBy) => {
    const validOptions = ['none', 'day', 'week', 'month', 'quarter', 'year'];
    if (!validOptions.includes(groupBy)) {
        throw new Error('Invalid grouping option');
    }
};

/**
 * Validates custom fields
 * @param {string[]} fields - The custom fields to validate
 * @throws {Error} If any field is invalid
 */
exports.validateCustomFields = (fields) => {
    const validFields = ['callDuration', 'callQuality', 'extension'];
    
    if (!Array.isArray(fields)) {
        throw new Error('Custom fields must be an array');
    }

    const invalidFields = fields.filter(field => !validFields.includes(field));
    if (invalidFields.length > 0) {
        throw new Error(`Invalid custom fields: ${invalidFields.join(', ')}`);
    }
}; 