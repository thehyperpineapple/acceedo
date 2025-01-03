const express = require('express');
const externalServiceController = require('../controllers/externalServiceController');

const router = express.Router();

// Route for creating a new server
router.post('/createServer', externalServiceController.createServer);

//Route for updating the server values and adding new entries
router.put('/updateServer', externalServiceController.updateServer);

// Route for deleting a server
router.delete('/deleteServer', externalServiceController.deleteServer);

module.exports = router;
