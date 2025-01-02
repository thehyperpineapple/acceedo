// models/WebSocketClient.js
const mongoose = require('mongoose');

const webSocketClientSchema = new mongoose.Schema({
    client_id: { type: String, required: true, unique: true },
    unit_ID: { type: Number, required: true },
    connected_at: { type: Date, default: Date.now },
    last_activity: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WebSocketClient', webSocketClientSchema);
