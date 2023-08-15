const express = require('express');
const pfController = require('../controllers/pfController');
const router = express.Router();

router.post('/create-package', pfController.createPackage);
router.put('/update-package', pfController.updatePackage);
router.delete('/delete-package/:pfId/:packageId', pfController.deletePackage);
router.post('/make-payment', pfController.makePayment);

module.exports = router;
