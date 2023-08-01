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
  address: {
    street: String,
    city: String,
    postCode: String,
    country: String,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
