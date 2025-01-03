 // models/BoardData.js
const mongoose = require('mongoose');

// Schema for log entries
const logEntrySchema = new mongoose.Schema({
    t: { type: Number, default: null }, // Temperature
    h: { type: Number, default: null }, // Humidity
    w: { type: Number, default: null }, // Water level
    eb: { type: Number, default: null }, // External board value
    ups: { type: Number, default: null }, // UPS status
    x: { type: Number, default: null }, // X-coordinate
    y: { type: Number, default: null }, // Y-coordinate
    timestamp: { type: Date, default: Date.now }, // Log timestamp
});
    
// Schema for board data
const boardDataSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true, unique: true }, // Unique unit identifier
    data_log: { type: [logEntrySchema], default: [] }, // Array of log entries
    created_at: { type: Date, default: Date.now }, // Document creation timestamp
    updated_at: { type: Date, default: Date.now }, // Document last updated timestamp
    });
    
module.exports = mongoose.model('BoardData', boardDataSchema);
    
