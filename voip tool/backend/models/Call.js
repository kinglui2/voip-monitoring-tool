const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    callerId: {
        type: String,
        required: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    queue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Queue'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned', 'transferred'],
        default: 'active'
    },
    duration: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    recordingUrl: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Call', callSchema);
