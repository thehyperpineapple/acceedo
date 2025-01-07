const mongoose = require('mongoose');

// Schema for external service data
const externalServiceSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true }, // Unique identifier for the unit
    t: { type: Number, default: null },       // Temperature
    h: { type: Number, default: null },       // Humidity
    w: { type: Number, default: null },       // Water level
    eb: { type: Number, default: null },      // External board value
    ups: { type: Number, default: null },     // UPS status
    x: { type: Number, default: null },       // X-coordinate
    y: { type: Number, default: null },       // Y-coordinate
    timestamp: { type: Date, default: Date.now }, // Timestamp for the entry
});

module.exports = mongoose.model('ExternalService', externalServiceSchema);
