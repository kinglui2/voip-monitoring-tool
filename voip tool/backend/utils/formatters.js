/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - The currency code
 * @param {string} [locale='en-US'] - The locale to use for formatting
 * @returns {string} The formatted currency string
 */
exports.formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
};

/**
 * Formats a duration in seconds to a human-readable string
 * @param {number} seconds - The duration in seconds
 * @returns {string} The formatted duration string
 */
exports.formatDuration = (seconds) => {
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
};

/**
 * Formats a date to a standard string format
 * @param {Date|number|string} date - The date to format
 * @param {string} [format='short'] - The format type ('short', 'long', 'iso')
 * @param {string} [locale='en-US'] - The locale to use for formatting
 * @returns {string} The formatted date string
 */
exports.formatDate = (date, format = 'short', locale = 'en-US') => {
    const dateObj = new Date(date);

    switch (format) {
        case 'long':
            return dateObj.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'iso':
            return dateObj.toISOString();
        case 'short':
        default:
            return dateObj.toLocaleDateString(locale);
    }
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - The size in bytes
 * @returns {string} The formatted size string
 */
exports.formatFileSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
};

/**
 * Formats a phone number to a standard format
 * @param {string} phoneNumber - The phone number to format
 * @param {string} [format='international'] - The format type ('international', 'national')
 * @returns {string} The formatted phone number
 */
exports.formatPhoneNumber = (phoneNumber, format = 'international') => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

    if (format === 'national' && digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    // Default to international format
    if (digits.length === 10) {
        return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    if (digits.length === 11 && digits[0] === '1') {
        return `+${digits[0]} ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    // If the format doesn't match known patterns, return the original number
    return phoneNumber;
};

/**
 * Formats a percentage value
 * @param {number} value - The value to format as percentage
 * @param {number} [decimals=1] - The number of decimal places
 * @returns {string} The formatted percentage string
 */
exports.formatPercentage = (value, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
}; 