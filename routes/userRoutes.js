const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../config/auth'); // Add this line to import authMiddleware
// const cors = require('cors');

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
// router.post('/cardDetails', userController.cardDetails);
router.post('/createCheckoutSession', userController.createCheckoutSession);
router.post('/findRole', userController.findRole);
router.post('/getcustomershipmentdata', userController.getcustomershipmentdata);
router.post('/getuserdata', userController.getuserdata);
router.post('/setuserdata', userController.setuserdata);
router.get('/getagents', userController.getagents);
router.post('/createshipment', userController.createshipment);
router.put('/updateCustomerShipment', userController.updateCustomerShipment);
router.post('/dashboard', userController.dashboard);
router.post('/forgetPassword', userController.forgetPassword);
router.post('/pendingShipements', userController.pendingShipements);
router.post('/payAmount', userController.payAmount);
router.post('/changePaymentStatus', userController.changePaymentStatus);
router.post('/myshipments', userController.myshipments);
router.post('/deletshipment', userController.deletshipment);
router.post('/dashboard', userController.dashboard);
router.post('/trackShipment', userController.trackShipment);


// AFFILIATE

router.get('/affiliate', userController.getAffiliateData);

// Add logs to check if the route is being accessed
// router.get('/affiliate/:userId', (req, res) => {
//     console.log("Received GET request at /affiliate");
//     userController.getAffiliateData(req, res);
//   });
  



module.exports = router;
