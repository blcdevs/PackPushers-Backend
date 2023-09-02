const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid: String,
  charges: String,
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
});

const Pfshipment = mongoose.model('pfshipment', userSchema);

module.exports = Pfshipment;
