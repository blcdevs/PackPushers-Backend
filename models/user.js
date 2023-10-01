const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetToken: String,
  resetTokenExpiry: Date,
  phoneNumber: String,
  bio: String,
  address: {
    street: String,
    city: String,
    postCode: String,
    country: String,
  },

  referrerLink: { type: String, unique: true }, // Referrer's unique link
  totalUsersReferred: { type: Number, default: 0 },
  totalShipments: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalHauls: { type: Number, default: 0 }, // Track total hauls/shipments using your code
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;
