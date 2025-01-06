// routes/settingsRoutes.js
const express = require('express');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.get('/getSettings', settingsController.getSettings);
router.post('/addSettings', settingsController.addSetting); 
router.delete('/deleteSetting', settingsController.deleteSetting);


module.exports = router;
