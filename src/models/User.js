const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_ID: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    emailId: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
