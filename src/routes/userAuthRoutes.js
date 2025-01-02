// routes/userAuthRoutes.js
const express = require('express');
const userAuthController = require('../controllers/userAuthController');

const router = express.Router();

router.post('/login', userAuthController.login);
router.post('/users', userAuthController.createUser);
router.get('/users', userAuthController.getAllUsers);
router.delete('/users/:userId', userAuthController.deleteUser);

module.exports = router;
