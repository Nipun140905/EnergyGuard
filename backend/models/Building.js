const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
    building_id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    primary_use: {
        type: String,
        required: true,
    },
    size_sqft: {
        type: Number,
        required: true,
    },
    registered_at: {
        type: Date,
        default: Date.now,
    },
    owner_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

module.exports = mongoose.model('Building', buildingSchema);