const mongoose = require('mongoose');

// Schema for board data entries
const boardDataSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true }, // Unique unit identifier
    t: { type: Number, default: null }, // Temperature
    h: { type: Number, default: null }, // Humidity
    w: { type: Number, default: null }, // Water level
    eb: { type: Number, default: null }, // External board value
    ups: { type: Number, default: null }, // UPS status
    x: { type: Number, default: null }, // X-coordinate
    y: { type: Number, default: null }, // Y-coordinate
    timestamp: { type: Date, default: Date.now }, // Log timestamp
});

module.exports = mongoose.model('BoardData', boardDataSchema);
