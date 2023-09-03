const User = require('../models/user');
const Pfsetting = require('../models/pfsetting');
const Pfshipment = require('../models/pfshipment');
const Pfrate = require('../models/pfrate');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const transporter = require('../config/mailer');
require('dotenv').config();

const { BASE_URL, EMAIL_USERNAME, JWT_SECRET_KEY } = process.env;

const adminController = {};


// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

adminController.getAllUsers = async (req, res) => {
  const emailList = await User.find({}, { email: 1, _id: 0 }).lean();
  const emails = emailList.map(user => user.email);
  // console.log("Users in node: " + emails);
  res.json({ message: 'Success', users: emails });
};


adminController.createshipment = async (req, res) => {

  const { token, paymentStatus, charges, city, country, description, email, packageCount, userEmail, packageType, packageWeight, phone, postalCode, reciever, shipmentMode, state, street, trackingId } = req.body;

  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
  const userdata = await User.findOne({ email: userEmail });

  const pfshipment = new Pfshipment({
    userid: userdata._id,
    charges,
    city,
    country,
    description,
    email,
    packageCount,
    packageType,
    packageWeight,
    phone,
    postalCode,
    reciever,
    shipmentMode,
    state,
    street,
    trackingId,
    paymentStatus
  });

  await pfshipment.save();
  res.json({ message: 'Success', pfshipment });

};

adminController.createUser = async (req, res) => {
  try {
    // console.log("Enter in Api 1");
    const { fullName, email, password, role } = req.body;
    const existingUser = await User.find({ email: email });
    console.log("Enter in Api 2", req.body);

    if (existingUser.email) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    console.log("Enter in Api 3");

    const verificationToken = uuid.v4(); // Generate a random email verification token
    console.log("Enter in Api 4");

    const user = new User({
      fullName,
      email,
      password: password,
      verificationToken: verificationToken,
      role: role
    });
    console.log("Data in Api: ", user);
    await user.save();



    res.json({ message: 'User registered successfully. Please check your email for verification.' });
  } catch (err) {
    console.log("Enter in catch 1");
    res.status(500).json({ error: 'Server error' });
  }
};


adminController.dashboard = async (req, res) => {

  // try {

  const { token } = req.body;
  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

  const userId = decodedToken.userId;
  // console.log(decodedToken)
  if (decodedToken.role != 'admin') {
    res.json({ message: 'Error', data: { rs: [] } });
    return false;
  }


  var data = await Pfshipment.find();


  var user = await User.find({ role: 'user' });
  var agent = await User.find({ role: 'agent' });


  let resdata = { user: user.length, agent: agent.length, ts: 0, tsc: 0, rs: [] };

  for (var i = 0; i < data.length; i++) {
    resdata.ts = resdata.ts + 1;
    resdata.tsc = resdata.tsc + parseFloat(data[i].charges);
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
  const { token } = req.body;
  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

  const userId = decodedToken.userId;

  if (decodedToken.role != 'admin') {
    res.json({ message: 'Error', data: [] });
    return false;
  }

  var data = await Pfshipment.find();

  let resdata = data;

  for (var i = 0; i < resdata.length; i++) {
    let tempdata = await Pfrate.findById(resdata[i].packageWeight);
    if (tempdata) {
      resdata[i].packageWeight = tempdata.weight + ' Kg';
    }
    tempdata = null;
    tempdata = await User.findById(resdata[i].shipmentMode);
    if (tempdata) {
      resdata[i].shipmentMode = tempdata.fullName;
    }
    tempdata = null;
    tempdata = await User.findById(resdata[i].userid);
    if (tempdata) {
      resdata[i].userid = tempdata.email;
    }
  }



  res.json({ message: 'Success', data: resdata });
};


adminController.customers = async (req, res) => {
  const { token } = req.body;
  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

  const userId = decodedToken.userId;

  if (decodedToken.role != 'admin') {
    res.json({ message: 'Error', data: [] });
    return false;
  }

  var data = await User.find({ role: 'user' });
  res.json({ message: 'Success', data: data });
};


adminController.agents = async (req, res) => {
  const { token } = req.body;
  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

  const userId = decodedToken.userId;

  if (decodedToken.role != 'admin') {
    res.json({ message: 'Error', data: [] });
    return false;
  }

  var data = await User.find({ role: 'agent' });
  res.json({ message: 'Success', data: data });
};


adminController.aa = async (req, res) => {
  const { _id } = req.body;


  var data = await User.findById(_id);
  data.isEmailVerified = true;
  await data.save();


  res.json({ message: 'Success', data: data });
};

adminController.ab = async (req, res) => {
  const { _id } = req.body;

  var data = await User.findById(_id);
  data.isEmailVerified = false;
  await data.save();


  res.json({ message: 'Success', data: data });
};

adminController.setNewStatus = async (req, res) => {
  try {
    const { newStatus, tId } = req.body;
    // console.log("newStatus" , req.body);
    // console.log("tId" , tId);
    const customerdata = await Pfshipment.findOne({ trackingId: tId });
    if (customerdata) {
      await Pfshipment.findOneAndUpdate(
        { trackingId: tId },
        { $set: { status: newStatus } }
      );
      res.json({ message: 'Status updated successfully' });
    } else {
      res.status(404).json({ message: 'Shipment not found' });
    }
  } catch (err) {
    console.log("Enter in catch block");
    res.json({ message: 'Error', user: {} });
  }
};
module.exports = adminController;
