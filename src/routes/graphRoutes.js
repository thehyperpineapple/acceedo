// routes/graphRoutes.js
const express = require('express');
const graphController = require('../controllers/graphController');

const router = express.Router();

router.post('/graph', graphController.updateGraphCollection);
router.get('/graph/:unit_ID', graphController.getGraphData);

module.exports = router;
