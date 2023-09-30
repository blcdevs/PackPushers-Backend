const express = require('express');
const router = express.Router();

const affiliateController = require('../controllers/affiliateController');

// Route for handling commission earnings when a shipment is made
router.post('/earnings', async (req, res) => {
  try {
    const { referralCode, shipmentCost } = req.body;
    const commission = await affiliateController.handleCommissionEarnings(referralCode, shipmentCost);

    res.json({ message: 'Commission earned', commission: commission });
  } catch (error) {
    res.status(500).json({ error: 'Error handling earnings' });
  }
});

// Route for creating a withdrawal request
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const withdrawalRequest = await affiliateController.createWithdrawalRequest(userId, amount);

    res.json({ message: 'Withdrawal request created', withdrawalRequest: withdrawalRequest });
  } catch (error) {
    res.status(500).json({ error: 'Error creating withdrawal request' });
  }
});

// Route for generating a referral link for the user
router.post('/generate-referral-link', async (req, res) => {
    try {
      const { userId } = req.body;
      const referralLink = await userController.generateReferralLink(userId);
  
      res.json({ message: 'Referral link generated', referralLink: referralLink });
    } catch (error) {
      res.status(500).json({ error: 'Error generating referral link' });
    }
  });
  

module.exports = router;
