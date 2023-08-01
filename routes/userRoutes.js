const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../config/auth'); // Add this line to import authMiddleware


const router = express.Router();

router.post('/signup', userController.signup);
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.put('/update-profile', authMiddleware, userController.updateProfile);
router.post('/login', userController.login); // Add the login route

// Rest of the routes remain the same

module.exports = router;
