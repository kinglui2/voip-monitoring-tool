const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Supervisor', 'Agent'],
        default: 'Agent'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
