// routes/externalServiceRoutes.js
const express = require('express');
const externalServiceController = require('../controllers/externalServiceController');

const router = express.Router();

router.post('/external/createServer', externalServiceController.createServer);

module.exports = router;
