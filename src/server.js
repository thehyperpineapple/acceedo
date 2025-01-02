const app = require('./app'); // Import the Express app
const connectDB = require('./config/database'); // Database connection
const logger = require('./config/logger'); // Logger
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI);

// Load configurations
const PORT = process.env.PORT || 3000;

// Connect to the database and start the server
(async () => {
    try {
        await connectDB();
        logger.info('Database connected successfully');

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start the server:', error);
        process.exit(1); // Exit the process with failure
    }
})();
