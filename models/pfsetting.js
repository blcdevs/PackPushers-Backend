const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _pf_id: String,
  warehouseName: String,
  fullAddress: String,
  country: String,
  city: String,
  whatsapp: String,
  

  bankDetail: String,
  accountNo: String,
  bankName: String,
  routingNo: String,
  branchName: String,

  paypal: String,

  
});



const Pfsetting = mongoose.model('pfsetting', userSchema);

module.exports = Pfsetting;

//-----------defining schema
// BANK NAME,
// ACC NAME:
// ACC NO:
// ROUTING NO,
// BRANCH NAME,
// ADDRESS