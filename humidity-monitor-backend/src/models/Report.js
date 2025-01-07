const mongoose = require('mongoose');

// Schema for reports
const reportSchema = new mongoose.Schema({
    unit_ID: { type: Number, required: true }, // Unique unit identifier
    report_name: { type: String, required: true }, // Name of the report
    generated_at: { type: Date, default: Date.now }, // Timestamp for when the report was generated
    filters: { type: Object, default: {} }, // Filters applied to generate the report (e.g., date range)
    data: { type: Array, default: [] }, // The aggregated data included in the report
});

module.exports = mongoose.model('Report', reportSchema);
