// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true },
    generated_at: { type: Date, default: Date.now },
    data: { type: Array, required: true }, // Store an array of data points
});

module.exports = mongoose.model('Report', reportSchema);
