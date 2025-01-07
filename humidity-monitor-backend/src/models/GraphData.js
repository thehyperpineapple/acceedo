const mongoose = require('mongoose');

const graphDataSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true },
    t: [{ type: Number }], // Array of temperature values
    h: [{ type: Number }], // Array of humidity values
    status: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GraphData', graphDataSchema);
