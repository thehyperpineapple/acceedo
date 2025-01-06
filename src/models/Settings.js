const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true, unique: true },
    humidity_high: { type: Number, required: true },
    humidity_low: { type: Number, required: true },
    temp_high: { type: Number, required: true },
    temp_low: { type: Number, required: true },
    water_level_high: { type: Number, required: true },
    water_level_low: { type: Number, required: true },
}, { versionKey: false }); // Supress __v field in response

module.exports = mongoose.model('Settings', settingsSchema);
