const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  packageTrackingId: String,
  receiverName: String,
  receiverEmail: String,
  phoneNumber: String,
  whatsappNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    postCode: String,
    country: String,
  },
  shipmentMode: String,
  courierCompany: String,
  packageType: String,
  amount: Number,
  packageWeight: Number,
  packageTotalPrice: Number,
  packageDescription: String,
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Awaiting Payment', 'Awaiting Shipment', 'Awaiting Pickup', 'Partially Shipped', 'Completed'],
    default: 'Pending',
  },
});

const packageForwarderSchema = new mongoose.Schema({
  name: String,
  warehouseAddress: {
    street: String,
    city: String,
    state: String,
    postCode: String,
    country: String,
  },
  whatsappNumber: String,
  bankAccount: String,
  priceChart: [{
    weight: Number,
    price: Number,
  }],
  packages: [packageSchema],
});

const PF = mongoose.model('PF', packageForwarderSchema);

module.exports = PF;
