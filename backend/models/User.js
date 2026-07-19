const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    displayName: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        default: 'manager',
    },
    building_id: {
        type: String,
        default: 'pending',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);