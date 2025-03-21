const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    caller: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'missed'],
        default: 'ongoing'
    },
    duration: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Call = mongoose.model('Call', callSchema);

module.exports = Call;
