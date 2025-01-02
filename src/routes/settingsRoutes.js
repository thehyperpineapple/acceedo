// routes/settingsRoutes.js
const express = require('express');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.addSetting);
router.put('/settings/:id', settingsController.updateSetting);
router.delete('/settings/:id', settingsController.deleteSetting);

module.exports = router;
