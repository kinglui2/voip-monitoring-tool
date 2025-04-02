const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    pbxType: {
        type: String,
        required: true,
        enum: ['3cx', 'yeastar']
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    period: {
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        }
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    callDetails: [{
        timestamp: Date,
        duration: Number,
        source: String,
        destination: String,
        trunk: String,
        cost: Number
    }],
    usageStats: {
        totalCalls: Number,
        totalDuration: Number,
        callsByType: [{
            type: String,
            count: Number
        }],
        costByTrunk: [{
            trunk: String,
            cost: Number
        }],
        peakHours: [{
            hour: String,
            calls: Number
        }],
        topExtensions: [{
            extension: String,
            cost: Number
        }]
    },
    metadata: {
        generatedBy: String,
        notes: String,
        paymentTerms: String,
        dueDate: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance
billingSchema.index({ pbxType: 1, date: -1 });
billingSchema.index({ invoiceNumber: 1 });
billingSchema.index({ status: 1 });

// Virtual for formatted invoice number
billingSchema.virtual('formattedInvoiceNumber').get(function() {
    return `INV-${this.date.getFullYear()}-${String(this.invoiceNumber).padStart(6, '0')}`;
});

// Method to calculate total amount
billingSchema.methods.calculateTotal = function() {
    return this.items.reduce((sum, item) => sum + item.total, 0);
};

// Static method to get billing summary
billingSchema.statics.getBillingSummary = async function(pbxType, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                pbxType,
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalInvoices: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                averageAmount: { $avg: '$amount' },
                paidAmount: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
                    }
                },
                pendingAmount: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
                    }
                },
                overdueAmount: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0]
                    }
                }
            }
        }
    ]);
};

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing; 