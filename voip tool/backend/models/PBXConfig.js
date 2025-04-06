const mongoose = require('mongoose');

const pbxConfigSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['3cx', 'yeastar'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    config: {
        serverUrl: String,
        apiKey: String,
        username: String,
        password: String,
        port: Number
    },
    lastConnected: Date,
    status: {
        type: String,
        enum: ['online', 'offline', 'error'],
        default: 'offline'
    }
}, { timestamps: true });

const PBXConfig = mongoose.model('PBXConfig', pbxConfigSchema);

module.exports = PBXConfig; 