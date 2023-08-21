const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../config/auth'); // Add this line to import authMiddleware


const router = express.Router();


router.get('/', userController.list);
router.post('/verify', userController.verify);
router.post('/getuser', userController.getuser);
router.post('/signup', userController.signup);
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.put('/update-profile', authMiddleware, userController.updateProfile);
router.post('/login', userController.login); // Add the login route


router.post('/getuserdata', userController.getuserdata);
router.post('/setuserdata', userController.setuserdata);

router.get('/getagents', userController.getagents);

router.post('/createshipment', userController.createshipment);


router.post('/myshipments', userController.myshipments);

router.post('/deletshipment', userController.deletshipment);

router.post('/dashboard', userController.dashboard);






// Rest of the routes remain the same

module.exports = router;
