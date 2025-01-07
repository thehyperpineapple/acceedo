const express = require('express');
const graphController = require('../controllers/graphController');

const router = express.Router();

// Update graph collection
router.put('/updateGraph', graphController.updateGraphCollection);

// Fetch graph data
router.get('/getGraphData/:unit_ID', graphController.getGraphData);

// Generate graph as image
router.get('/generateGraph/:unit_ID', graphController.generateGraph);

module.exports = router;
