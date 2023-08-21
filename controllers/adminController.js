const User = require('../models/user');
const Pfsetting = require('../models/pfsetting');
const Pfshipment = require('../models/pfshipment');
const Pfrate = require('../models/pfrate');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const transporter = require('../config/mailer');
require('dotenv').config();
 
const { BASE_URL, EMAIL_USERNAME , JWT_SECRET_KEY} = process.env;

const adminController = {};



adminController.dashboard = async (req, res) => {

  // try {

  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      // console.log(decodedToken)
      if (decodedToken.role != 'admin') {
        res.json({ message: 'Error', data: {rs:[]} });
        return false;
      }


      var data = await Pfshipment.find();


      var user = await User.find({role:'user'});
      var agent = await User.find({role:'agent'});

      
      let resdata={user:user.length,agent:agent.length,ts:0,tsc:0,rs:[]};

      for (var i = 0; i < data.length; i++) {
        resdata.ts = resdata.ts+1;
        resdata.tsc = resdata.tsc+parseFloat(data[i].charges);
        if (resdata.rs.length < 6) {
          resdata.rs.push(data[i]);
        }
      }

      
      
    res.json({ message: 'Success', data: resdata });

// } catch (err) {
//     res.json({ message: 'Error', data: {} });
//   } 
};


adminController.myshipments = async (req, res) => {
  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;

      if (decodedToken.role != 'admin') {
        res.json({ message: 'Error', data: [] });
        return false;
      }

      var data = await Pfshipment.find();

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


adminController.customers = async (req, res) => {
  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;

      if (decodedToken.role != 'admin') {
        res.json({ message: 'Error', data: [] });
        return false;
      }

      var data = await User.find({role: 'user'});
    res.json({ message: 'Success', data: data }); 
};


adminController.agents = async (req, res) => {
  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;

      if (decodedToken.role != 'admin') {
        res.json({ message: 'Error', data: [] });
        return false;
      }

      var data = await User.find({role: 'agent'});
    res.json({ message: 'Success', data: data }); 
};


adminController.aa = async (req, res) => {
  const { _id  } = req.body;
   

      var data = await User.findById(_id);
      data.isEmailVerified = true;
      await data.save();


    res.json({ message: 'Success', data: data }); 
};


adminController.ab = async (req, res) => {
  const { _id  } = req.body;
    
      var data = await User.findById(_id);
      data.isEmailVerified = false;
      await data.save();


    res.json({ message: 'Success', data: data }); 
};



 


// Rest of the userController functions remain the same

module.exports = adminController;
