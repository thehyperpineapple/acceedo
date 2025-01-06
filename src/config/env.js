const dotenv = require('dotenv');

const loadEnv = () => {
    const result = dotenv.config();
    if (result.error) {
        throw new Error('Error loading .env file');
    }

    // Validate required environment variables
    const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
    requiredVars.forEach((varName) => {
        if (!process.env[varName]) {
            throw new Error(`Missing required environment variable: ${varName}`);
        }
    });

    console.log('Environment variables loaded successfully');
};

module.exports = loadEnv;
