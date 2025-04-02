const ExcelJS = require('exceljs');
const { formatDate, formatCurrency, formatDuration } = require('./formatters');

/**
 * Generates an Excel file from the provided data
 * @param {Object|Array} data - The data to convert to Excel format
 * @returns {Promise<Buffer>} A buffer containing the Excel file
 */
exports.generateExcel = async (data) => {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'VoIP Monitoring Tool';
        workbook.lastModifiedBy = 'VoIP Monitoring Tool';
        workbook.created = new Date();
        workbook.modified = new Date();

        if (Array.isArray(data)) {
            // Handle single sheet data
            await createSheet(workbook, 'Data', data);
        } else {
            // Handle multiple sections in separate sheets
            for (const [section, sectionData] of Object.entries(data)) {
                if (sectionData && (Array.isArray(sectionData) || typeof sectionData === 'object')) {
                    await createSheet(workbook, section, sectionData);
                }
            }
        }

        // Apply general formatting
        applyWorkbookStyles(workbook);

        return await workbook.xlsx.writeBuffer();
    } catch (error) {
        console.error('Error generating Excel file:', error);
        throw new Error('Failed to generate Excel file');
    }
};

/**
 * Creates a worksheet with the provided data
 * @private
 */
async function createSheet(workbook, name, data) {
    const worksheet = workbook.addWorksheet(name.charAt(0).toUpperCase() + name.slice(1));

    if (Array.isArray(data)) {
        if (data.length === 0) {
            worksheet.addRow(['No data available']);
            return;
        }

        // Add headers
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);

        // Add data rows
        data.forEach(item => {
            const row = headers.map(header => formatExcelValue(item[header]));
            worksheet.addRow(row);
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = Math.max(
                headers[column.number - 1].length,
                ...data.map(item => String(item[headers[column.number - 1]]).length)
            );
        });
    } else if (typeof data === 'object') {
        // Handle object data
        Object.entries(data).forEach(([key, value]) => {
            worksheet.addRow([key, formatExcelValue(value)]);
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = 20;
        });
    }

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
}

/**
 * Formats a value for Excel
 * @private
 */
function formatExcelValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    if (value instanceof Date) {
        return formatDate(value, 'iso');
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return value;
}

/**
 * Applies general styling to the workbook
 * @private
 */
function applyWorkbookStyles(workbook) {
    workbook.eachSheet(worksheet => {
        // Add borders to all cells
        worksheet.eachRow(row => {
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Freeze the header row
        worksheet.views = [
            { state: 'frozen', xSplit: 0, ySplit: 1 }
        ];
    });
}

/**
 * Formats billing data for Excel export
 * @param {Object} data - The billing data to format
 * @returns {Object} Formatted data for Excel export
 */
exports.formatBillingData = (data) => {
    const sheets = {};

    // Format invoices
    if (data.invoices && data.invoices.length > 0) {
        sheets.Invoices = data.invoices.map(invoice => ({
            'Invoice ID': invoice.id,
            'Date': formatDate(invoice.date, 'iso'),
            'Amount': formatCurrency(invoice.amount),
            'Status': invoice.status,
            'Due Date': formatDate(invoice.dueDate, 'iso'),
            'Customer': invoice.customer,
            'Items': invoice.items ? invoice.items.length : 0
        }));
    }

    // Format payments
    if (data.payments && data.payments.length > 0) {
        sheets.Payments = data.payments.map(payment => ({
            'Payment ID': payment.id,
            'Date': formatDate(payment.date, 'iso'),
            'Amount': formatCurrency(payment.amount),
            'Method': payment.method,
            'Status': payment.status,
            'Invoice ID': payment.invoiceId,
            'Transaction ID': payment.transactionId
        }));
    }

    // Format usage data
    if (data.usage && data.usage.length > 0) {
        sheets.Usage = data.usage.map(usage => ({
            'Date': formatDate(usage.date, 'iso'),
            'Extension': usage.extension,
            'Duration': formatDuration(usage.duration),
            'Type': usage.type,
            'Cost': formatCurrency(usage.cost),
            'Quality Score': usage.qualityScore,
            'Destination': usage.destination
        }));
    }

    // Add summary sheet
    sheets.Summary = {
        'Total Invoices': data.invoices ? data.invoices.length : 0,
        'Total Payments': data.payments ? data.payments.length : 0,
        'Total Usage Records': data.usage ? data.usage.length : 0,
        'Generated At': formatDate(new Date(), 'iso'),
        'Report Period': `${formatDate(data.startDate, 'iso')} to ${formatDate(data.endDate, 'iso')}`
    };

    return sheets;
}; 