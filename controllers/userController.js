const User = require('../models/user');
const Pfsetting = require('../models/pfsetting');
const Pfshipment = require('../models/pfshipment');
const Pfrate = require('../models/pfrate');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const transporter = require('../config/mailer');
require('dotenv').config();
const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// const cors = require('cors');
// const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
// const stripe = require('stripe')(STRIPE_SECRET_KEY);
const { BASE_URL, EMAIL_USERNAME, JWT_SECRET_KEY } = process.env;
const nodemailer = require('nodemailer');


const userController = {};

userController.trackShipment = async (req, res) => {
  const data = await Pfshipment.findOne({ trackingId: req.body.trackingId });
  console.log("data in tracking: " + data);
  res.json({ message: 'Success', shipment: data });
};


userController.changePaymentStatus = async (req, res) => {
  console.log("Enter in Change");
  const { token, id } = req.body;
  await Pfshipment.findByIdAndUpdate(id, { paymentStatus: "paid" });
  res.json({ message: 'Success' });
};

userController.payAmount = async (req, res) => {
  let amount = req.body.price;
  // console.log("Amount: ", amount);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Pending Shipment Payment',
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/users/customer/shipment',
    cancel_url: 'http://localhost:3000/users/customer/pendingShipment',
  });
  // console.log("Session ", session.url);
  // console.log("End of Api");
  res.json({ sessionUrl: session.url }); // Return session URL
};

userController.pendingShipements = async (req, res) => {
  // console.log("Enter 1");
  const { token } = req.body;
  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

  const userId = decodedToken.userId;
  var data = await Pfshipment.find({ userid: userId, paymentStatus: 'unpaid' });

  // let resdata = data;

  let resdata = data;
  // console.log("resdata in pendingShipements: " + resdata);

  for (let i = 0; i < resdata.length; i++) {
    let tempdata = await Pfrate.findById(resdata[i].packageWeight);
    if (tempdata) {
      resdata[i].packageWeight = tempdata.weight + ' Kg';
    }
    tempdata = null;
    tempdata = await User.findById(resdata[i].shipmentMode);
    if (tempdata) {
      resdata[i].shipmentMode = tempdata.fullName;
    }
  }

  // console.log("resdata in pendingShipements: " + resdata);
  res.json({ message: 'Success', data: resdata });
};

userController.forgetPassword = async (req, res) => {
  try {
    console.log("Enter 1");
    const transporter = nodemailer.createTransport({
      host: 'cryptokash.finance',
      port: 465,
      auth: {
        user: 'courier@cryptokash.finance',
        pass: '123456789@2023!',
      },
    });

    transporter.verify().then(console.log).catch(console.error);

    transporter.sendMail({
      from: 'courier@cryptokash.finance', // sender address
      to: "amirrafay135@gmail.com", // list of receivers
      subject: "Test for web mail", // Subject line
      text: "There is a new article. It's about sending emails, check it out!", // plain text body
      html: "<b>There is a new article. It's about sending emails, check it out!</b>", // html body
    }).then(info => {
      console.log({ info });
    }).catch(console.error);
    console.log("Enter 2");
  } catch (err) {
    console.log("catch");
    res.status(500).json({ error: 'Server error' });
  }
};

userController.dashboard = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    const userId = decodedToken.userId;

    // for calculate recent orders //
    const recentOrders = await Pfshipment.countDocuments({ userid: userId });

    // for calculate pending shipments //
    const pendingShipments = await Pfshipment.countDocuments({ userid: userId, status: "pending" });

    // for calculate pending shipments amount //
    const pendingShipmentsAmount = await Pfshipment.find({ userid: userId, status: "pending" });
    let totalPendingAmount = 0;

    pendingShipmentsAmount.forEach(shipment => {
      totalPendingAmount = totalPendingAmount + shipment.charges;
    });

    // for calculate shipped shipments amount //
    const shippedShipmentsAmount = await Pfshipment.find({ userid: userId, status: "shipped" });
    let totalShippedAmount = 0;

    shippedShipmentsAmount.forEach(shipment => {
      totalShippedAmount = totalShippedAmount + shipment.charges;
    });

    // for fetch data whose shipping are pending
    const pendingDeliveries = await Pfshipment.find({ userid: userId, status: "pending" });

    const invoices = pendingDeliveries.map(shipment => {
      return shipment.charges;
    });

    // console.log("Pending deliveries total amount:", invoices);

    // const email = decodedToken.email;
    // const userdata = await User.findOne({ email });
    // console.log("recentOrders: " + recentOrders);
    // console.log("pendingShipments: " + pendingShipments);
    // console.log("Total pending shipments amount:", totalPendingAmount);
    // console.log("Total shipped shipments amount:", totalShippedAmount);

    res.json({ recentOrders, pendingShipments, totalPendingAmount, totalShippedAmount, invoices });
  } catch (err) {
    console.log("catch");
    res.status(500).json({ error: 'Server error' });
  }
};


// userController.cardDetails = async (req, res) => {
//   try {
//     const { nameOnCard, cardNumber, cvv, expiryMonth, expiryYear, userID } = req.body;
//     const checkUser = await CreditCard.findOne({ userID })

//     if (checkUser) {
//       await CreditCard.findOneAndRemove({ userID });
//     }

//     const cardData = new CreditCard({
//       nameOnCard,
//       cardNumber,
//       cvv,
//       expiryMonth,
//       expiryYear,
//       userID
//     });

//     if (cardData) {
//       await cardData.save();
//       res.json({ message: 'Cards Detail Store successfully' });
//     }
//     else {
//       res.json({ message: 'Cards Detail not receive' });
//     }
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

userController.signup = async (req, res) => {

  try {
    const { fullName, email, password, role } = req.body;
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
      role: role
    });
    await user.save();

    // Send email verification link
    // const verificationLink = `${BASE_URL}/api/users/verify-email/${verificationToken}`;
    // const mailOptions = {
    //   from: EMAIL_USERNAME,
    //   to: user.email,
    //   subject: 'Email Verification - PackPushers',
    //   html: `Click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`,
    // };
    // await transporter.sendMail(mailOptions);

    res.json({ message: 'User registered successfully. Please check your email for verification.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

userController.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Req: ", req.body)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ error: 'Your Account is not verified!' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role, email: user.email }, JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    const userID = user._id;

    res.json({ token, userID });
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


userController.list = async (req, res) => {
  try {

    const user = await User.find();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


userController.verify = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

    if (!decodedToken) {
      res.json({ message: 'Error', user: false });
    }

    res.json({ message: 'Verified', user: true });
  } catch (err) {
    res.json({ message: 'Error', user: false });
  }
};


userController.getuser = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

    // if (!decodedToken) {
    //   res.json({ message: 'Error', user: {} });
    // }


    const email = decodedToken.email;
    const userdata = await User.findOne({ email });

    const user = {
      fullName: userdata.fullName,
      email: userdata.email,
      role: userdata.role,
      isEmailVerified: userdata.isEmailVerified,
      // verificationToken : userdata.verificationToken
      isProfileSet: false
    };

    if (user.role == 'agent') {
      const pfset = await Pfsetting.findOne({ _pf_id: userdata._id });
      if (pfset) {
        user.isProfileSet = true;
      }
    }


    res.json({ message: 'Verified', user });
  } catch (err) {
    res.json({ message: 'Error', user: {} });
  }
};



userController.getuserdata = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

    const email = decodedToken.email;
    const userdata = await User.findOne({ email });

    const user = {
      fullName: userdata.fullName,
      email: userdata.email,
      role: userdata.role,
      isEmailVerified: userdata.isEmailVerified,
      // verificationToken : userdata.verificationToken
      bio: userdata.bio,
      isProfileSet: false
    };

    res.json({ message: 'Success', user });
  } catch (err) {
    res.json({ message: 'Error', user: {} });
  }
};


userController.setuserdata = async (req, res) => {
  // try {
  const { token, fullName, password, bio } = req.body;
  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

  const email = decodedToken.email;
  const userdata = await User.findOne({ email });

  userdata.fullName = fullName;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    userdata.password = hashedPassword;
  }

  userdata.bio = bio;

  await userdata.save();


  res.json({ message: 'Success' });
  // } catch (err) {
  //   res.json({ message: 'Error', user: {} });
  // } 
};


userController.getagents = async (req, res) => {

  const userdata = await User.find();

  var agents = [];

  for (var i = 0; i < userdata.length; i++) {
    if (userdata[i].role == 'agent' && userdata[i].isEmailVerified) {
      agents.push({ id: userdata[i]._id, name: userdata[i].fullName });
    }
  }


  res.json({ message: 'Success', agents: agents });

};

// // Stripe APi //

// userController.createPayment = async (req, res) => {
//   try {
//     const { amount } = req.body; // Adjust this based on your needs

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount * 100, // Amount in cents
//       currency: 'usd', // Change to your desired currency
//       // Add more details as needed
//     });

//     res.json({ sessionId: paymentIntent.client_secret });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
//   }
// });

// userController.payment = async (req, res) => {
//   let { amount, id } = req.body
//   try {
//     const payment = await stripe.paymentIntents.create({
//       amount,
//       currency: "USD",
//       description: "Spatula company",
//       payment_method: id,
//       confirm: true
//     })
//     console.log("Payment", payment)
//     res.json({
//       message: "Payment successful",
//       success: true
//     })
//   } catch (error) {
//     console.log("Error", error)
//     res.json({
//       message: "Payment failed",
//       success: false
//     })
//   }
// }

userController.findRole = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    const email = decodedToken.email;
    const userdata = await User.findOne({ email });

    res.json({ message: 'role sending', role: userdata.role });
  } catch (err) {
    console.log("Enter in catch block");
    res.json({ message: 'Error', user: {} });
  }
};

userController.getcustomershipmentdata = async (req, res) => {
  try {
    const { token, id } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

    const customerShipmentData = await Pfshipment.findOne({ _id: id });
    console.log("customerShipmentData: " + customerShipmentData);

    res.json({ message: 'Data Sending', customer: customerShipmentData });
  } catch (err) {
    console.log("Enter in catch block in getcustomershipmentdata");
    res.json({ message: 'Error', customer: {} });
  }
};

userController.createCheckoutSession = async (req, res) => {
  let numberOfPakages = req.body.packageCount;
  let price = req.body.price;
  let amount = price;
  // console.log("numberOfPakages: ", numberOfPakages);
  // console.log("price: ", price);
  console.log("Amount: ", amount);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipment Payment',
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/users/customer/shipment',
    cancel_url: 'http://localhost:3000/users/customer/create-shipment',
  });
  console.log("Session ", session.url);
  console.log("End of Api");
  res.json({ sessionUrl: session.url }); // Return session URL
};

userController.createshipment = async (req, res) => {

  const { token, paymentStatus, charges, city, country, description, email, packageCount, packageType, packageWeight, phone, postalCode, reciever, shipmentMode, state, street, trackingId } = req.body;

  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

  const emaill = decodedToken.email;
  const userdata = await User.findOne({ email: emaill });
  const name = userdata.fullName;
  // const userCreditCard = await CreditCard.findOne({ userID: userdata._id });

  // // STRIPE PAYMENT METHOD INTEGRATION - START
  // try {

  //   // 1- Create Customer
  //   const customer = await stripe.customers.create({
  //     name: name,
  //     email: email,
  //   });

  //   // 2- Add Customer Card
  //   const customer_id = customer.id;
  //   const card_Name = 'Muhammad Adeel';
  //   const card_ExpYear = parseInt(userCreditCard.expiryYear);
  //   const card_ExpMonth = parseInt(userCreditCard.expiryMonth);
  //   const card_Number = userCreditCard.cardNumber;
  //   const card_CVC = userCreditCard.cvv;

  //   const card_token = await stripe.tokens.create({
  //     card:{
  //         number: userCreditCard.cardNumber,
  //         exp_month: parseInt(userCreditCard.expiryMonth),
  //         exp_year: parseInt(userCreditCard.expiryYear),
  //         cvc: userCreditCard.cvv
  //     }
  //   });

  //   const card = await stripe.customers.createSource(customer_id, {
  //     source: `${card_token.id}`
  //   });

  //   // 3- Create Charge on Customer Card
  //   const createCharge = await stripe.charges.create({
  //     receipt_email: 'adeel98amir@gmail.com',
  //     amount: parseInt(15)*100,
  //     currency:'USD',
  //     card: card.id,
  //     customer: customer_id
  // });

  // } catch (error) {
  //   console.log("Error in Payment Api" , error);
  //   return res.json({ message: 'Error', data: {} });
  // }
  // // STRIPE PAYMENT METHOD INTEGRATION - END

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

userController.updateCustomerShipment = async (req, res) => {
  try {
    const { token, city, country, description, email, packageType, phone, postalCode, reciever, state, street, id } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    const updateShipment = {
      city: city,
      country: country,
      description: description,
      email: email,
      packageType: packageType,
      phone: phone,
      postalCode: postalCode,
      reciever: reciever,
      state: state,
      street: street
    };

    const customerShipmentData = await Pfshipment.findOne({ _id: id });

    if (customerShipmentData) {
      await Pfshipment.findOneAndUpdate({ _id: id }, { $set: updateShipment });
      res.status(200).json("updated");
    } else {
      res.status(200).json("not found");
    }
  } catch (error) {
    res.status(500).json("internal server error");
  }
};


userController.myshipments = async (req, res) => {
  const { token } = req.body;
  const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

  const userId = decodedToken.userId;
  var data = await Pfshipment.find({ userid: userId });

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
  }

  // console.log("resdata:" + resdata);
  res.json({ message: 'Success', data: resdata });
};



userController.deletshipment = async (req, res) => {
  const { _id } = req.body;

  var pfset = await Pfshipment.deleteOne({ _id: _id });



  res.json({ message: 'Success', pfset });
};

// Rest of the userController functions remain the same

module.exports = userController;
