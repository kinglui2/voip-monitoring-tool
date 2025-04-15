const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    strategy: {
        type: String,
        enum: ['ringall', 'leastrecent', 'fewestcalls', 'random', 'rrmemory', 'linear', 'wrandom', 'rrordered'],
        default: 'ringall'
    },
    timeout: {
        type: Number,
        default: 30
    },
    maxCalls: {
        type: Number,
        default: 0
    },
    agents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
    }],
    metrics: {
        totalCalls: {
            type: Number,
            default: 0
        },
        answeredCalls: {
            type: Number,
            default: 0
        },
        abandonedCalls: {
            type: Number,
            default: 0
        },
        averageWaitTime: {
            type: Number,
            default: 0
        },
        averageTalkTime: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Queue', queueSchema); 