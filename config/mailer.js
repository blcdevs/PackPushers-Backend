const nodemailer = require('nodemailer');
require('dotenv').config();

const { EMAIL_USERNAME, EMAIL_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

module.exports = transporter;
