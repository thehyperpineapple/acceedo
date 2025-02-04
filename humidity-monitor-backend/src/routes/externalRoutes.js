const express = require('express');
const externalServiceController = require('../controllers/externalServiceController');

const router = express.Router();

// Create a new board (server)
router.post('/createServer', async (req, res) => {
  try {
    const result = await externalServiceController.createServer(req, res);
    return result;
  } catch (error) {
    console.error('Error handling createServer:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update board with new entries
router.put('/updateServer', async (req, res) => {
  try {
    const { unit_ID } = req.query;
    const logEntry = req.body;

    if (!unit_ID) {
      return res.status(400).json({ error: 'unit_ID is required' });
    }

    const updatedData = await externalServiceController.updateServer(unit_ID, logEntry);

    // The updateServer method in the controller now handles notifying WebSocket clients,
    // so no additional notification logic is required here.
    return res.status(200).json({
      message: 'Data logged successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Error handling REST updateServer:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a board (server)
router.delete('/deleteServer', async (req, res) => {
  try {
    const result = await externalServiceController.deleteServer(req, res);
    return result;
  } catch (error) {
    console.error('Error handling deleteServer:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all unit counts and IDs
router.get('/getUnitCount', async (req, res) => {
  try {
    const result = await externalServiceController.getUnitCount(req, res);
    return result;
  } catch (error) {
    console.error('Error handling getUnitCount:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize WebSocket endpoints (for testing or manual initialization)
router.get('/startWebSocket', async (req, res) => {
  try {
    externalServiceController.initializeWebSocketEndpoints();
    return res.status(200).json({ message: 'WebSocket endpoints initialized' });
  } catch (error) {
    console.error('Error starting WebSocket endpoints:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
