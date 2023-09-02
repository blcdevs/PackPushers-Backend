const PF = require('../models/packageForwarder');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const Pfsetting = require('../models/pfsetting');
const Pfrate = require('../models/pfrate');
const Pfshipment = require('../models/pfshipment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const transporter = require('../config/mailer');
require('dotenv').config();
const { BASE_URL, EMAIL_USERNAME , JWT_SECRET_KEY} = process.env;

const pfController = {};

// Function to create a package
pfController.createPackage = async (req, res) => {
  try {
    const {
      pfId,
      packageTrackingId,
      receiverName,
      receiverEmail,
      phoneNumber,
      whatsappNumber,
      address,
      shipmentMode,
      courierCompany,
      packageType,
      amount,
      packageWeight,
      packageDescription,
    } = req.body;

    const pf = await PF.findById(pfId);

    if (!pf) {
      return res.status(404).json({ error: 'Package Forwarder not found' });
    }

    // Calculate package total price
    const priceChart = pf.priceChart.find(item => item.weight >= packageWeight);
    const packageTotalPrice = priceChart ? (priceChart.price * amount) : 0;

    // Create the new package
    const newPackage = {
      packageTrackingId,
      receiverName,
      receiverEmail,
      phoneNumber,
      whatsappNumber,
      address,
      shipmentMode,
      courierCompany,
      packageType,
      amount,
      packageWeight,
      packageTotalPrice,
      packageDescription,
    };

    pf.packages.push(newPackage);
    await pf.save();

    res.json({ message: 'Package created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

pfController.updatePackage = async (req, res) => {
    try {
      const {
       
        pfId,
        packageTrackingId,
        receiverName,
        receiverEmail,
        phoneNumber,
        whatsappNumber,
        address,
        shipmentMode,
        courierCompany,
        packageType,
        amount,
        packageWeight,
        packageDescription,
      } = req.body;
  
      const pf = await PF.findById(pfId);
  
      if (!pf) {
        return res.status(404).json({ error: 'Package Forwarder not found' });
      }
  
      const packageIndex = pf.packages.findIndex((package) => package._id.toString() === packageId);
  
      if (packageIndex === -1) {
        return res.status(404).json({ error: 'Package not found' });
      }
  
      pf.packages[packageIndex] = {
        ...pf.packages[packageIndex],
        pfId,
        packageTrackingId,
        receiverName,
        receiverEmail,
        phoneNumber,
        whatsappNumber,
        address,
        shipmentMode,
        courierCompany,
        packageType,
        amount,
        packageWeight,
        packageDescription,
      };
  
      await pf.save();
  
      res.json({ message: 'Package updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  pfController.deletePackage = async (req, res) => {
    try {
      const { pfId, packageId } = req.params;
  
      const pf = await PF.findById(pfId);
  
      if (!pf) {
        return res.status(404).json({ error: 'Package Forwarder not found' });
      }
  
      const packageIndex = pf.packages.findIndex((package) => package._id.toString() === packageId);
  
      if (packageIndex === -1) {
        return res.status(404).json({ error: 'Package not found' });
      }
  
      pf.packages.splice(packageIndex, 1);
      await pf.save();
  
      res.json({ message: 'Package deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };
// Function to make a payment using Stripe
pfController.makePayment = async (req, res) => {
  try {
    const { packageTotalPrice, stripeToken } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: packageTotalPrice * 100,
      currency: 'usd',
      payment_method_types: ['card'],
      payment_method: stripeToken,
    });

    // Handle successful payment or payment error here

    res.json({ message: 'Payment processed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Payment error' });
  }
};



pfController.getsetting = async (req, res) => {
  // try {
    const { token } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      var pfset = await Pfsetting.findOne({ _pf_id: userId });
        if (!pfset) {
           pfset = new Pfsetting({
              _pf_id: userId ,
              warehouseName: '' ,
              fullAddress: '' ,
              country: '' ,
              city: '' ,
              whatsapp: '' ,
              bankDetail: '' ,
              accountNo: '' ,
              bankName: '' 
              });
              await pfset.save();
         pfset = await Pfsetting.findOne({ _pf_id: userId });
        }
  

    res.json({ message: 'Verified', pfset });
  // } catch (err) {
  //   res.json({ message: 'Error', user: {} });
  // }
};

pfController.setting = async (req, res) => {
  const { token , warehouseName, fullAddress, country, city, whatsapp, bankDetail, accountNo, bankName } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      var pfset = await Pfsetting.findOne({ _pf_id: userId });
        pfset.warehouseName = warehouseName;
        pfset.fullAddress = fullAddress;
        pfset.country = country;
        pfset.city = city;
        pfset.whatsapp = whatsapp;
        pfset.bankDetail = bankDetail;
        pfset.accountNo = accountNo;
        pfset.bankName = bankName;
        await pfset.save();
  

    res.json({ message: 'Saved', pfset }); 
};


pfController.rate = async (req, res) => {
  const { token , weight, rate } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      var pfset = new Pfrate({ _pf_id: userId,weight, rate });
      await pfset.save();
       

    res.json({ message: 'Saved', pfset }); 
};


pfController.myrates = async (req, res) => {
  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      var pfset = await Pfrate.find({ _pf_id: userId });

      
      
    res.json({ message: 'Success', pfset }); 
};


pfController.updaterate = async (req, res) => {
  const { _id, weight, rate  } = req.body;
  
  var pfset = await Pfrate.findById(_id);
      pfset.weight = weight;
      pfset.rate =  rate;
      await pfset.save();
      
      
    res.json({ message: 'Success', pfset }); 
};

pfController.delete = async (req, res) => {
  const { _id  } = req.body;
  
  var pfset = await Pfrate.deleteOne({_id:_id});
    
      
      
    res.json({ message: 'Success', pfset }); 
};


pfController.getagentsrates = async (req, res) => {
  const { id  } = req.body;
    var rates = await Pfrate.find({ _pf_id: id });

    var reponse =[];
    for (var i = 0; i < rates.length; i++) {
      reponse.push({id: rates[i]._id, weight: rates[i].weight+' Kg', price: (parseFloat(rates[i].rate)*1.12).toFixed(2)})
    }
      
      
    res.json({ message: 'Success', reponse: reponse }); 
};


pfController.dashboard = async (req, res) => {
  try {

  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      var data = await Pfshipment.find({ shipmentMode: userId });

      let resdata={ts:0,tsc:0,rs:[]};

      for (var i = 0; i < data.length; i++) {
        resdata.ts = resdata.ts+1;
        resdata.tsc = resdata.tsc+parseFloat(data[i].charges);
        if (resdata.rs.length < 6) {
          resdata.rs.push(data[i]);
        }
      }

      
      
    res.json({ message: 'Success', data: resdata });

} catch (err) {
    res.json({ message: 'Error', data: {} });
  } 
};


pfController.myshipments = async (req, res) => {
  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      var data = await Pfshipment.find({ shipmentMode: userId });

      let resdata=data;

      for (var i = 0; i < resdata.length; i++) {
        let tempdata = await Pfrate.findById(resdata[i].packageWeight);
        if (tempdata) {
          resdata[i].packageWeight = tempdata.weight + ' Kg';
        }
        tempdata=null;
        tempdata = await User.findById(resdata[i].shipmentMode);
        if (tempdata) {
          resdata[i].shipmentMode = tempdata.fullName;
        }
        tempdata=null;
        tempdata = await User.findById(resdata[i].userid);
        if (tempdata) {
          resdata[i].userid = tempdata.email;
        }
      }

      
      
    res.json({ message: 'Success', data: resdata }); 
};

module.exports = pfController;
