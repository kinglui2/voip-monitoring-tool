const { formatDate, formatCurrency, formatDuration } = require('./formatters');

/**
 * Generates a CSV file from the provided data
 * @param {Object|Array} data - The data to convert to CSV
 * @returns {Promise<Buffer>} A buffer containing the CSV data
 */
exports.generateCSV = async (data) => {
    try {
        let csvContent = '';
        
        if (Array.isArray(data)) {
            // Handle array of objects
            if (data.length === 0) {
                return Buffer.from('No data available', 'utf-8');
            }

            // Generate headers
            const headers = Object.keys(data[0]);
            csvContent += headers.join(',') + '\n';

            // Generate rows
            data.forEach(item => {
                const row = headers.map(header => formatField(item[header])).join(',');
                csvContent += row + '\n';
            });
        } else {
            // Handle complex object with multiple sections
            Object.entries(data).forEach(([section, sectionData]) => {
                // Add section header
                csvContent += `\n${section.toUpperCase()}\n`;

                if (Array.isArray(sectionData)) {
                    // Handle array data
                    if (sectionData.length > 0) {
                        const headers = Object.keys(sectionData[0]);
                        csvContent += headers.join(',') + '\n';

                        sectionData.forEach(item => {
                            const row = headers.map(header => formatField(item[header])).join(',');
                            csvContent += row + '\n';
                        });
                    }
                } else if (typeof sectionData === 'object') {
                    // Handle nested object data
                    Object.entries(sectionData).forEach(([key, value]) => {
                        csvContent += `${key},${formatField(value)}\n`;
                    });
                }
            });
        }

        return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
        console.error('Error generating CSV:', error);
        throw new Error('Failed to generate CSV file');
    }
};

/**
 * Formats a field value for CSV
 * @private
 */
function formatField(value) {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'object') {
        if (value instanceof Date) {
            return formatDate(value, 'iso');
        }
        return JSON.stringify(value).replace(/"/g, '""');
    }

    // Convert to string and escape quotes
    const stringValue = String(value).replace(/"/g, '""');

    // Wrap in quotes if the value contains comma, newline, or quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue}"`;
    }

    return stringValue;
}

/**
 * Formats billing data for CSV export
 * @param {Object} data - The billing data to format
 * @returns {Array} An array of formatted rows
 */
exports.formatBillingData = (data) => {
    const rows = [];

    // Add invoices
    if (data.invoices && data.invoices.length > 0) {
        rows.push(['INVOICES']);
        rows.push(['Invoice ID', 'Date', 'Amount', 'Status', 'Due Date']);
        data.invoices.forEach(invoice => {
            rows.push([
                invoice.id,
                formatDate(invoice.date, 'iso'),
                formatCurrency(invoice.amount),
                invoice.status,
                formatDate(invoice.dueDate, 'iso')
            ]);
        });
        rows.push([]);
    }

    // Add payments
    if (data.payments && data.payments.length > 0) {
        rows.push(['PAYMENTS']);
        rows.push(['Payment ID', 'Date', 'Amount', 'Method', 'Status']);
        data.payments.forEach(payment => {
            rows.push([
                payment.id,
                formatDate(payment.date, 'iso'),
                formatCurrency(payment.amount),
                payment.method,
                payment.status
            ]);
        });
        rows.push([]);
    }

    // Add usage data
    if (data.usage && data.usage.length > 0) {
        rows.push(['USAGE']);
        rows.push(['Date', 'Extension', 'Duration', 'Type', 'Cost']);
        data.usage.forEach(usage => {
            rows.push([
                formatDate(usage.date, 'iso'),
                usage.extension,
                formatDuration(usage.duration),
                usage.type,
                formatCurrency(usage.cost)
            ]);
        });
    }

    return rows.map(row => row.join(',')).join('\n');
}; 