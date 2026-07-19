const mongoose = require('mongoose');

const analysisCacheSchema = new mongoose.Schema({
    building_id: {
        type: String,
        required: true,
    },
    stream: {
        type: String,
        required: true,
    },
    results: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    computed_at: {
        type: Date,
        default: Date.now,
    },
    is_stale: {
        type: Boolean,
        default: false,
    },
});

// Compound index — one cache entry per building+stream combination
analysisCacheSchema.index({ building_id: 1, stream: 1 }, { unique: true });

module.exports = mongoose.model('AnalysisCache', analysisCacheSchema);