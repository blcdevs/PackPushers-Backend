const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../config/auth'); // Add this line to import authMiddleware


const router = express.Router();

router.post('/dashboard', adminController.dashboard);


router.post('/myshipments', adminController.myshipments);



router.post('/customers', adminController.customers);


router.post('/agents', adminController.agents);



router.post('/aa', adminController.aa);
router.post('/ab', adminController.ab);



 



// Rest of the routes remain the same

module.exports = router;
