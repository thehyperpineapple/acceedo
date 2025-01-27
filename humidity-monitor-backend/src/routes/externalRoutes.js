const express = require('express');
const externalServiceController = require('../controllers/externalServiceController');

const router = express.Router();

// Create a new server
router.post('/createServer', async (req, res) => {
    try {
        const result = await externalServiceController.createServer(req, res);
        return result;
    } catch (error) {
        console.error('Error handling createServer:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update server with new entries
router.put('/updateServer', async (req, res) => {
    try {
        const { unit_ID } = req.query;
        const logEntry = req.body;

        if (!unit_ID) {
            return res.status(400).json({ error: 'unit_ID is required' });
        }

        const updatedData = await externalServiceController.updateServer(unit_ID, logEntry);

        // Notify WebSocket clients about the update (optional but useful)
        const port = externalServiceController.BASE_PORT + parseInt(unit_ID);
        if (externalServiceController.websocketServers[port]) {
            externalServiceController.websocketServers[port].clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        message: 'Server updated via REST',
                        data: updatedData,
                    }));
                }
            });
        }

        return res.status(200).json({
            message: 'Data logged successfully',
            data: updatedData,
        });
    } catch (error) {
        console.error('Error handling REST updateServer:', error.message, error.stack);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// Delete a server
router.delete('/deleteServer', async (req, res) => {
    try {
        const result = await externalServiceController.deleteServer(req, res);
        return result;
    } catch (error) {
        console.error('Error handling deleteServer:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all unit counts
router.get('/getUnitCount', async (req, res) => {
    try {
        const result = await externalServiceController.getUnitCount(req, res);
        return result;
    } catch (error) {
        console.error('Error handling getUnitCount:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// WebSocket initialization (optional route for testing WebSocket functionality)
router.get('/startWebSocket', async (req, res) => {
    try {
        await externalServiceController.websocketHandler();
        return res.status(200).json({ message: 'WebSocket servers started' });
    } catch (error) {
        console.error('Error starting WebSocket servers:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
