const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const auth = require('../middleware/auth');
const { PBXError } = require('../utils/PBXError');
const ThreeCXService = require('../services/threeCXService');
const YeastarService = require('../services/yeastarService');

// Get billing data for a specific PBX
router.get('/:pbxType', auth, async (req, res) => {
    try {
        const { pbxType } = req.params;
        const { timeRange } = req.query;

        // Validate PBX type
        if (!['3cx', 'yeastar'].includes(pbxType)) {
            throw new PBXError('Invalid PBX type', 'INVALID_PBX_TYPE');
        }

        // Calculate date range based on timeRange parameter
        let startDate, endDate;
        const now = new Date();
        switch (timeRange) {
            case 'current':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = now;
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'custom':
                startDate = new Date(req.query.start);
                endDate = new Date(req.query.end);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = now;
        }

        // Get billing data from database
        const billingData = await Billing.find({
            pbxType,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });

        // Get current month summary
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthData = await Billing.findOne({
            pbxType,
            date: { $gte: currentMonthStart, $lte: now }
        }).sort({ date: -1 });

        // Get usage statistics
        const usageStats = await getUsageStats(pbxType, startDate, endDate);

        res.json({
            currentMonth: currentMonthData ? {
                totalCalls: currentMonthData.usageStats.totalCalls,
                totalDuration: currentMonthData.usageStats.totalDuration,
                totalCost: currentMonthData.amount,
                callsByType: currentMonthData.usageStats.callsByType,
                costByTrunk: currentMonthData.usageStats.costByTrunk
            } : {
                totalCalls: 0,
                totalDuration: 0,
                totalCost: 0,
                callsByType: [],
                costByTrunk: []
            },
            usageStats,
            invoices: billingData.map(invoice => ({
                id: invoice.invoiceNumber,
                date: invoice.date,
                amount: invoice.amount,
                status: invoice.status
            }))
        });
    } catch (error) {
        console.error('Error fetching billing data:', error);
        res.status(error.statusCode || 500).json({
            error: error.message,
            code: error.code
        });
    }
});

// Generate new invoice
router.post('/:pbxType/invoice/generate', auth, async (req, res) => {
    try {
        const { pbxType } = req.params;
        const { dateRange, callTypes, extensions, minCost, maxCost } = req.body;

        // Validate PBX type
        if (!['3cx', 'yeastar'].includes(pbxType)) {
            throw new PBXError('Invalid PBX type', 'INVALID_PBX_TYPE');
        }

        // Get call data from PBX
        const pbxService = pbxType === '3cx' ? new ThreeCXService() : new YeastarService();
        const callData = await pbxService.getCallLogs(dateRange.start, dateRange.end);

        // Filter call data based on criteria
        let filteredCalls = callData.filter(call => {
            const matchesType = callTypes.includes('all') || callTypes.includes(call.type);
            const matchesExtension = extensions.includes('all') || extensions.includes(call.source);
            const matchesCost = call.cost >= minCost && call.cost <= maxCost;
            return matchesType && matchesExtension && matchesCost;
        });

        // Calculate usage statistics
        const usageStats = calculateUsageStats(filteredCalls);

        // Generate invoice number
        const lastInvoice = await Billing.findOne({ pbxType }).sort({ invoiceNumber: -1 });
        const invoiceNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber) + 1 : 1;

        // Create invoice items
        const items = generateInvoiceItems(filteredCalls);

        // Calculate total amount
        const amount = items.reduce((sum, item) => sum + item.total, 0);

        // Create new invoice
        const invoice = new Billing({
            pbxType,
            invoiceNumber: invoiceNumber.toString(),
            date: new Date(),
            period: {
                start: dateRange.start,
                end: dateRange.end
            },
            amount,
            items,
            callDetails: filteredCalls,
            usageStats,
            metadata: {
                generatedBy: req.user.id,
                paymentTerms: 'Net 30',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        await invoice.save();

        res.json({
            id: invoice.invoiceNumber,
            date: invoice.date,
            amount: invoice.amount,
            status: invoice.status
        });
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(error.statusCode || 500).json({
            error: error.message,
            code: error.code
        });
    }
});

// Export invoice as PDF
router.get('/:pbxType/invoice/:invoiceId/export', auth, async (req, res) => {
    try {
        const { pbxType, invoiceId } = req.params;

        // Find invoice
        const invoice = await Billing.findOne({
            pbxType,
            invoiceNumber: invoiceId
        });

        if (!invoice) {
            throw new PBXError('Invoice not found', 'INVOICE_NOT_FOUND');
        }

        // Generate PDF (implement PDF generation logic here)
        // For now, we'll just send the invoice data
        res.json(invoice);
    } catch (error) {
        console.error('Error exporting invoice:', error);
        res.status(error.statusCode || 500).json({
            error: error.message,
            code: error.code
        });
    }
});

// Helper function to get usage statistics
async function getUsageStats(pbxType, startDate, endDate) {
    const pbxService = pbxType === '3cx' ? new ThreeCXService() : new YeastarService();
    const callData = await pbxService.getCallLogs(startDate, endDate);
    return calculateUsageStats(callData);
}

// Helper function to calculate usage statistics
function calculateUsageStats(calls) {
    const stats = {
        totalCalls: calls.length,
        totalDuration: calls.reduce((sum, call) => sum + call.duration, 0),
        callsByType: [],
        costByTrunk: [],
        peakHours: [],
        topExtensions: []
    };

    // Calculate calls by type
    const typeCounts = {};
    calls.forEach(call => {
        typeCounts[call.type] = (typeCounts[call.type] || 0) + 1;
    });
    stats.callsByType = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count
    }));

    // Calculate cost by trunk
    const trunkCosts = {};
    calls.forEach(call => {
        trunkCosts[call.trunk] = (trunkCosts[call.trunk] || 0) + call.cost;
    });
    stats.costByTrunk = Object.entries(trunkCosts).map(([trunk, cost]) => ({
        trunk,
        cost
    }));

    // Calculate peak hours
    const hourCounts = {};
    calls.forEach(call => {
        const hour = new Date(call.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    stats.peakHours = Object.entries(hourCounts)
        .map(([hour, calls]) => ({
            time: `${hour}:00`,
            calls
        }))
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 5);

    // Calculate top extensions
    const extensionCosts = {};
    calls.forEach(call => {
        extensionCosts[call.source] = (extensionCosts[call.source] || 0) + call.cost;
    });
    stats.topExtensions = Object.entries(extensionCosts)
        .map(([extension, cost]) => ({
            extension,
            cost
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

    return stats;
}

// Helper function to generate invoice items
function generateInvoiceItems(calls) {
    const items = [];
    const trunkRates = {};

    // Group calls by trunk and calculate rates
    calls.forEach(call => {
        if (!trunkRates[call.trunk]) {
            trunkRates[call.trunk] = {
                calls: 0,
                duration: 0,
                cost: 0
            };
        }
        trunkRates[call.trunk].calls++;
        trunkRates[call.trunk].duration += call.duration;
        trunkRates[call.trunk].cost += call.cost;
    });

    // Create invoice items for each trunk
    Object.entries(trunkRates).forEach(([trunk, data]) => {
        items.push({
            description: `Calls via ${trunk}`,
            quantity: data.calls,
            unitPrice: data.cost / data.calls,
            total: data.cost
        });
    });

    return items;
}

module.exports = router; 