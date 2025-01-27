const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true, unique: true },
    humidity_high: { type: Number, required: true, default: 70 },
    humidity_low: { type: Number, required: true, default: 30 },
    temp_high: { type: Number, required: true, default: 25 },
    temp_low: { type: Number, required: true, default: 15 },
    water_level_high: { type: Number, required: true, default: 80 },
    water_level_low: { type: Number, required: true, default: 20 },
}, { versionKey: false }); // Suppress __v field in response

module.exports = mongoose.model('Settings', settingsSchema);
