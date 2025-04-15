const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    extension: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'busy', 'break'],
        default: 'inactive'
    },
    role: {
        type: String,
        enum: ['agent', 'supervisor', 'admin'],
        default: 'agent'
    },
    skills: [{
        type: String
    }],
    queues: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Queue'
    }],
    lastActive: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Agent', agentSchema); 