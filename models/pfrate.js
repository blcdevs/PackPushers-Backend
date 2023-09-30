const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _pf_id: String,
  weight: String,
  rate: String,
  
});



const Pfsetting = mongoose.model('pfrate', userSchema);

module.exports = Pfsetting;
