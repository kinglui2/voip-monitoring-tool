const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    includeLogs: { type: Boolean, default: true },
    includeConfig: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Backup = mongoose.model('Backup', backupSchema);

module.exports = Backup;
