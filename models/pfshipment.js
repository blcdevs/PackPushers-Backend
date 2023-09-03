const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid: String,
  charges: Number,
  city: String,
  country: String,
  description: String,
  email: String,
  packageCount: String,
  packageType: String,
  packageWeight: String,
  phone: String,
  postalCode: String,
  reciever: String,
  shipmentMode: String,
  state: String,
  street: String,
  trackingId: String,
  status: {
    type: String,
    default: 'pending'
  },
  paymentStatus: String,
});

const Pfshipment = mongoose.model('pfshipment', userSchema);

module.exports = Pfshipment;
