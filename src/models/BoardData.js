// models/BoardData.js
const mongoose = require('mongoose');

const boardDataSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true },
    t: { type: Number, default: 0 },
    h: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    eb: { type: Number, default: 0 },
    ups: { type: Number, default: 0 },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BoardData', boardDataSchema);
