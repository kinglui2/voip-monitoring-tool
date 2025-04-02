const PDFDocument = require('pdfkit');
const { formatDate, formatCurrency, formatDuration } = require('./formatters');

/**
 * Generates a PDF file from the provided data
 * @param {Object|Array} data - The data to convert to PDF format
 * @returns {Promise<Buffer>} A buffer containing the PDF file
 */
exports.generatePDF = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const chunks = [];
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });

            // Collect PDF data chunks
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Add header
            addHeader(doc, data);

            if (Array.isArray(data)) {
                // Handle single table data
                addTable(doc, 'Data', data);
            } else {
                // Handle multiple sections
                Object.entries(data).forEach(([section, sectionData], index) => {
                    if (index > 0) doc.addPage();
                    addSection(doc, section, sectionData);
                });
            }

            // Add footer
            addFooter(doc);

            // Finalize PDF
            doc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(new Error('Failed to generate PDF file'));
        }
    });
};

/**
 * Adds a header to the PDF document
 * @private
 */
function addHeader(doc, data) {
    doc.fontSize(20)
        .text('VoIP Monitoring Tool', { align: 'center' })
        .fontSize(14)
        .text('Billing Report', { align: 'center' })
        .moveDown()
        .fontSize(10)
        .text(`Generated on: ${formatDate(new Date(), 'long')}`, { align: 'right' })
        .moveDown(2);
}

/**
 * Adds a section to the PDF document
 * @private
 */
function addSection(doc, title, data) {
    doc.fontSize(16)
        .text(title.charAt(0).toUpperCase() + title.slice(1), { underline: true })
        .moveDown();

    if (Array.isArray(data)) {
        addTable(doc, title, data);
    } else if (typeof data === 'object') {
        addObjectData(doc, data);
    }

    doc.moveDown(2);
}

/**
 * Adds a table to the PDF document
 * @private
 */
function addTable(doc, title, data) {
    if (data.length === 0) {
        doc.text('No data available');
        return;
    }

    const headers = Object.keys(data[0]);
    const columnWidths = calculateColumnWidths(doc, headers, data);
    const startX = doc.page.margins.left;
    let currentY = doc.y;

    // Draw headers
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
        doc.text(
            header,
            startX + columnWidths.slice(0, i).reduce((sum, width) => sum + width, 0),
            currentY,
            { width: columnWidths[i], align: 'left' }
        );
    });

    // Draw header line
    currentY = doc.y + 5;
    doc.moveTo(startX, currentY)
        .lineTo(startX + columnWidths.reduce((sum, width) => sum + width, 0), currentY)
        .stroke();

    // Draw data rows
    doc.font('Helvetica');
    data.forEach(row => {
        currentY = doc.y + 5;
        if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = doc.page.margins.top;
        }

        headers.forEach((header, i) => {
            doc.text(
                formatPDFValue(row[header]),
                startX + columnWidths.slice(0, i).reduce((sum, width) => sum + width, 0),
                currentY,
                { width: columnWidths[i], align: 'left' }
            );
        });
    });
}

/**
 * Adds object data to the PDF document
 * @private
 */
function addObjectData(doc, data) {
    Object.entries(data).forEach(([key, value]) => {
        doc.text(`${key}: ${formatPDFValue(value)}`);
    });
}

/**
 * Adds a footer to the PDF document
 * @private
 */
function addFooter(doc) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
            .text(
                `Page ${i + 1} of ${pages.count}`,
                doc.page.margins.left,
                doc.page.height - 50,
                { align: 'center' }
            );
    }
}

/**
 * Calculates column widths for a table
 * @private
 */
function calculateColumnWidths(doc, headers, data) {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const minWidth = 50;
    const maxWidth = 200;

    // Calculate content widths
    const contentWidths = headers.map(header => {
        const headerWidth = doc.widthOfString(header);
        const maxContentWidth = Math.max(
            ...data.map(row => doc.widthOfString(formatPDFValue(row[header])))
        );
        return Math.min(maxWidth, Math.max(minWidth, headerWidth, maxContentWidth));
    });

    // Adjust widths to fit page
    const totalWidth = contentWidths.reduce((sum, width) => sum + width, 0);
    if (totalWidth > pageWidth) {
        const scale = pageWidth / totalWidth;
        return contentWidths.map(width => width * scale);
    }

    return contentWidths;
}

/**
 * Formats a value for PDF display
 * @private
 */
function formatPDFValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    if (value instanceof Date) {
        return formatDate(value, 'long');
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
}

/**
 * Formats billing data for PDF export
 * @param {Object} data - The billing data to format
 * @returns {Object} Formatted data for PDF export
 */
exports.formatBillingData = (data) => {
    const formattedData = {
        summary: {
            'Report Period': `${formatDate(data.startDate, 'long')} to ${formatDate(data.endDate, 'long')}`,
            'Total Invoices': data.invoices ? data.invoices.length : 0,
            'Total Payments': data.payments ? data.payments.length : 0,
            'Total Usage Records': data.usage ? data.usage.length : 0
        }
    };

    // Format invoices
    if (data.invoices && data.invoices.length > 0) {
        formattedData.invoices = data.invoices.map(invoice => ({
            'Invoice #': invoice.id,
            'Date': formatDate(invoice.date, 'long'),
            'Amount': formatCurrency(invoice.amount),
            'Status': invoice.status,
            'Due Date': formatDate(invoice.dueDate, 'long')
        }));
    }

    // Format payments
    if (data.payments && data.payments.length > 0) {
        formattedData.payments = data.payments.map(payment => ({
            'Payment #': payment.id,
            'Date': formatDate(payment.date, 'long'),
            'Amount': formatCurrency(payment.amount),
            'Method': payment.method,
            'Status': payment.status
        }));
    }

    // Format usage
    if (data.usage && data.usage.length > 0) {
        formattedData.usage = data.usage.map(usage => ({
            'Date': formatDate(usage.date, 'long'),
            'Extension': usage.extension,
            'Duration': formatDuration(usage.duration),
            'Type': usage.type,
            'Cost': formatCurrency(usage.cost)
        }));
    }

    return formattedData;
}; 