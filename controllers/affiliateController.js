// Import necessary models and modules
const User = require('../models/user');
const WithdrawalRequest = require('../models/withdrawalRequest');

const affiliateController = {};

// Function to handle commission earnings when a referred user makes a shipment
affiliateController.handleCommissionEarnings = async (referralCode, shipmentCost) => {
  try {
    // Find the user with the referral code
    const referringUser = await User.findOne({ affiliateCode: referralCode });
    
    if (!referringUser) {
      throw new Error('Referring user not found');
    }

    // Calculate commission (6% of the shipment cost)
    const commission = shipmentCost * 0.06;

    // Update the referring user's earned commissions
    referringUser.earnedCommissions += commission;
    await referringUser.save();

    return commission;
  } catch (error) {
    throw error;
  }
};

// Function to create a withdrawal request
affiliateController.createWithdrawalRequest = async (userId, amount) => {
  try {
    // Create a new withdrawal request
    const withdrawalRequest = new WithdrawalRequest({
      user: userId,
      amount: amount,
    });

    await withdrawalRequest.save();

    return withdrawalRequest;
  } catch (error) {
    throw error;
  }
};

// Add other affiliate-related functions as needed

module.exports = affiliateController;
