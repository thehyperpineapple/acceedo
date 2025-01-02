// routes/reportRoutes.js
const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/report/:unit_ID', reportController.generateReport);

module.exports = router;
