// config/settings.js
module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiry: '1h', // JWT Token expiration time
    defaultPort: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
};
