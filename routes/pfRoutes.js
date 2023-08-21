const express = require('express');
const pfController = require('../controllers/pfController');
const router = express.Router();

// router.post('/create-package', pfController.createPackage);
// router.put('/update-package', pfController.updatePackage);
// router.delete('/delete-package/:pfId/:packageId', pfController.deletePackage);
// router.post('/make-payment', pfController.makePayment);


router.post('/getsetting', pfController.getsetting);
router.post('/setting', pfController.setting);


router.post('/rate', pfController.rate);
router.post('/myrates', pfController.myrates);
router.post('/updaterate', pfController.updaterate);
router.post('/deleterate', pfController.delete);

router.post('/getagentsrates', pfController.getagentsrates);

router.post('/dashboard', pfController.dashboard);

router.post('/myshipments', pfController.myshipments);




module.exports = router;
