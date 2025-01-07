const express = require('express');
const userAuthController = require('../controllers/userAuthController');

const router = express.Router();

router.post('/login', userAuthController.login);
router.post('/logout', userAuthController.logoutUser);
router.post('/createUser', userAuthController.createUser);
router.get('/viewUsers', userAuthController.getAllUsers);
router.put('/updateUser/:user_ID', userAuthController.updateUser);
router.delete('/deleteUser', userAuthController.deleteUser);

module.exports = router;
