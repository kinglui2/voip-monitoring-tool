const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['system', 'performance'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    acknowledged: {
        type: Boolean,
        default: false
    },
    acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    acknowledgedAt: {
        type: Date
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
    },
    agentName: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes for better query performance
alertSchema.index({ type: 1, acknowledged: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ priority: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert; 