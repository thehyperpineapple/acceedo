const http = require('http'); // Import HTTP module to create a server
const app = require('./app'); // Import the Express app
const connectDB = require('./config/database'); // Database connection
const logger = require('./config/logger'); // Logger
const dotenv = require('dotenv');
const externalServiceController = require('./controllers/externalServiceController'); // Import WebSocket handler

// Load environment variables
dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI);

// Load configurations
const PORT = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Attach WebSocket handler to the HTTP server
externalServiceController.websocketHandler(server);

// Connect to the database and start the server
(async () => {
    try {
        await connectDB();
        logger.info('Database connected successfully');

        server.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            // log the link 
            console.log(`http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start the server:', error);
        process.exit(1); // Exit the process with failure
    }
})();
