const express = require('express');
const externalServiceController = require('../controllers/externalServiceController');

const router = express.Router();

// Create a new server
router.post('/createServer', externalServiceController.createServer);

// Update server with new entries
router.put('/updateServer', async (req, res) => {
    try {
        const { unit_ID } = req.query;
        const logEntry = req.body;

        if (!unit_ID) {
            return res.status(400).json({ error: 'unit_ID is required' });
        }

        const updatedData = await externalServiceController.updateServer(unit_ID, logEntry);

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
router.delete('/deleteServer', externalServiceController.deleteServer);

router.get('/getUnitCount', externalServiceController.getUnitCount);

module.exports = router;
