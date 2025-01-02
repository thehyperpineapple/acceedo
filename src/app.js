const express = require('express');
const corsMiddleware = require('./middleware/corsMiddleware');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Route imports
const userAuthRoutes = require('./routes/userAuthRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const graphRoutes = require('./routes/graphRoutes');
const externalServiceRoutes = require('./routes/externalRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware);
app.use(requestLogger);

// Routes
app.use('/api/v1/auth', userAuthRoutes);
app.use('/api/v1', settingsRoutes);
app.use('/api/v1', graphRoutes);
app.use('/api/v1', externalServiceRoutes);
app.use('/api/v1', reportRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
