const { generatePDF } = require('../utils/pdfGenerator');
const { generateExcel } = require('../utils/excelGenerator');
const { generateCSV } = require('../utils/csvGenerator');
const { calculateUsage } = require('../utils/usageCalculator');
const { formatCurrency } = require('../utils/formatters');
const { validateDateRange } = require('../utils/validators');

// Invoice Controllers
exports.getInvoices = async (req, res) => {
    try {
        const { pbxType } = req.params;
        const { startDate, endDate, status } = req.query;

        const invoices = await req.db.getInvoices(pbxType, {
            startDate,
            endDate,
            status
        });

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

exports.generateInvoice = async (req, res) => {
    try {
        const { pbxType } = req.params;
        const { startDate, endDate, extensions } = req.body;

        const usage = await calculateUsage(pbxType, startDate, endDate, extensions);
        const invoice = await req.db.createInvoice(pbxType, usage);

        res.status(201).json(invoice);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
};

exports.getInvoiceDetails = async (req, res) => {
    try {
        const { pbxType, invoiceId } = req.params;
        const invoice = await req.db.getInvoiceDetails(pbxType, invoiceId);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        res.status(500).json({ error: 'Failed to fetch invoice details' });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const { pbxType, invoiceId } = req.params;
        await req.db.deleteInvoice(pbxType, invoiceId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
};

exports.downloadInvoice = async (req, res) => {
    try {
        const { pbxType, invoiceId } = req.params;
        const invoice = await req.db.getInvoiceDetails(pbxType, invoiceId);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const pdfBuffer = await generatePDF(invoice);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error downloading invoice:', error);
        res.status(500).json({ error: 'Failed to download invoice' });
    }
};

// Payment Controllers
exports.getPayments = async (req, res) => {
    try {
        const { pbxType } = req.params;
        const { status, startDate, endDate, minAmount, maxAmount } = req.query;

        const payments = await req.db.getPayments(pbxType, {
            status,
            startDate,
            endDate,
            minAmount,
            maxAmount
        });

        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};

exports.getPaymentStats = async (req, res) => {
    try {
        const { pbxType } = req.params;
        const stats = await req.db.getPaymentStats(pbxType);

        res.json({
            totalPayments: stats.totalPayments,
            totalAmount: formatCurrency(stats.totalAmount),
            pendingPayments: stats.pendingPayments,
            failedPayments: stats.failedPayments
        });
    } catch (error) {
        console.error('Error fetching payment stats:', error);
        res.status(500).json({ error: 'Failed to fetch payment statistics' });
    }
};

exports.exportPayments = async (req, res) => {
    try {
        const { pbxType } = req.params;
        const { format, startDate, endDate, status } = req.body;

        const payments = await req.db.getPayments(pbxType, {
            startDate,
            endDate,
            status
        });

        let fileBuffer;
        let contentType;
        let filename;

        switch (format) {
            case 'csv':
                fileBuffer = await generateCSV(payments);
                contentType = 'text/csv';
                filename = 'payments.csv';
                break;
            case 'xlsx':
                fileBuffer = await generateExcel(payments);
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                filename = 'payments.xlsx';
                break;
            default:
                throw new Error('Unsupported format');
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(fileBuffer);
    } catch (error) {
        console.error('Error exporting payments:', error);
        res.status(500).json({ error: 'Failed to export payments' });
    }
};

// Billing Export Controller
exports.exportBillingData = async (req, res) => {
    try {
        const { pbxType } = req.params;
        const {
            format,
            dateRange,
            includeInvoices,
            includePayments,
            includeUsage,
            groupBy,
            customFields
        } = req.body;

        // Validate date range
        validateDateRange(dateRange);

        // Fetch data based on options
        const data = {
            invoices: includeInvoices ? await req.db.getInvoices(pbxType, dateRange) : [],
            payments: includePayments ? await req.db.getPayments(pbxType, dateRange) : [],
            usage: includeUsage ? await calculateUsage(pbxType, dateRange.start, dateRange.end) : []
        };

        // Group data if specified
        if (groupBy !== 'none') {
            data.invoices = groupData(data.invoices, groupBy);
            data.payments = groupData(data.payments, groupBy);
            data.usage = groupData(data.usage, groupBy);
        }

        // Add custom fields if specified
        if (customFields.length > 0) {
            data.invoices = await addCustomFields(data.invoices, customFields);
        }

        let fileBuffer;
        let contentType;
        let filename;

        switch (format) {
            case 'csv':
                fileBuffer = await generateCSV(data);
                contentType = 'text/csv';
                filename = 'billing-data.csv';
                break;
            case 'xlsx':
                fileBuffer = await generateExcel(data);
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                filename = 'billing-data.xlsx';
                break;
            case 'pdf':
                fileBuffer = await generatePDF(data);
                contentType = 'application/pdf';
                filename = 'billing-data.pdf';
                break;
            default:
                throw new Error('Unsupported format');
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(fileBuffer);
    } catch (error) {
        console.error('Error exporting billing data:', error);
        res.status(500).json({ error: 'Failed to export billing data' });
    }
};

// Usage Controllers
exports.getUsageData = async (req, res) => {
    try {
        const { pbxType } = req.params;
        const { startDate, endDate, extensions } = req.query;

        const usage = await calculateUsage(pbxType, startDate, endDate, extensions);
        res.json(usage);
    } catch (error) {
        console.error('Error fetching usage data:', error);
        res.status(500).json({ error: 'Failed to fetch usage data' });
    }
};

exports.getUsageStats = async (req, res) => {
    try {
        const { pbxType } = req.params;
        const stats = await req.db.getUsageStats(pbxType);

        res.json({
            totalCalls: stats.totalCalls,
            totalDuration: stats.totalDuration,
            averageCallDuration: stats.averageCallDuration,
            totalCost: formatCurrency(stats.totalCost)
        });
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
};

// Helper Functions
function groupData(data, groupBy) {
    // Implementation for grouping data by specified time period
    // This would be implemented based on your specific needs
    return data;
}

async function addCustomFields(data, customFields) {
    // Implementation for adding custom fields to the data
    // This would be implemented based on your specific needs
    return data;
} 