const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user making the request
  amount: Number, // Amount requested for withdrawal
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  // Add any additional fields you need
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

module.exports = WithdrawalRequest;
