const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const transporter = require('../config/mailer');
require('dotenv').config();

const { BASE_URL, EMAIL_USERNAME } = process.env;

const userController = {};

userController.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuid.v4(); // Generate a random email verification token
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationToken,
    });
    await user.save();

    // Send email verification link
    const verificationLink = `${BASE_URL}/api/users/verify-email/${verificationToken}`;
    const mailOptions = {
      from: EMAIL_USERNAME,
      to: user.email,
      subject: 'Email Verification - PackPushers',
      html: `Click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'User registered successfully. Please check your email for verification.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

userController.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET_KEY, {
        expiresIn: '1d',
      });
  
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };
  

userController.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    user.verificationToken = null;
    user.isEmailVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

userController.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User with this email not found' });
    }

    const resetToken = uuid.v4(); // Generate a random password reset token
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send password reset link
    const resetLink = `${BASE_URL}/reset-password/${resetToken}`;
    const mailOptions = {
      from: EMAIL_USERNAME,
      to: user.email,
      subject: 'Password Reset - PackPushers',
      html: `Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a>`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

userController.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

userController.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { phoneNumber, address } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.phoneNumber = phoneNumber;
    user.address = address;
    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Rest of the userController functions remain the same

module.exports = userController;
