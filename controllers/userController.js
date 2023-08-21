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

const userController = {};

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
  
      res.json({ token });
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
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);;

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
      const userdata = await User.findOne({email });
     
    const user = {
       fullName : userdata.fullName,
       email : userdata.email,
       role : userdata.role,
       isEmailVerified : userdata.isEmailVerified,
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
    const userdata = await User.findOne({email });
     
    const user = {
       fullName : userdata.fullName,
       email : userdata.email,
       role : userdata.role,
       isEmailVerified : userdata.isEmailVerified,
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
    const userdata = await User.findOne({email });
     
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
      if(userdata[i].role == 'agent' && userdata[i].isEmailVerified){
        agents.push({id:userdata[i]._id,name: userdata[i].fullName});
      }
    }


    res.json({ message: 'Success', agents: agents});
  
};


userController.createshipment = async (req, res) => {

    const { token, charges, city, country, description, email, packageCount, packageType, packageWeight, phone, postalCode, reciever, shipmentMode, state, street, trackingId } = req.body;
    
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

    const emaill = decodedToken.email;
    const userdata = await User.findOne({email: emaill });
    
    
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
      trackingId
    });
    await pfshipment.save();
    res.json({ message: 'Success', pfshipment});
  
};


userController.myshipments = async (req, res) => {
  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      var data = await Pfshipment.find({ userid: userId });

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
      }

      
      
    res.json({ message: 'Success', data: resdata }); 
};



userController.deletshipment = async (req, res) => {
  const { _id  } = req.body;
  
  var pfset = await Pfshipment.deleteOne({_id:_id});
    
      
      
    res.json({ message: 'Success', pfset }); 
};


userController.dashboard = async (req, res) => {
  try {

  const { token  } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    
      const userId = decodedToken.userId;
      var data = await Pfshipment.find({ userid: userId });

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




// Rest of the userController functions remain the same

module.exports = userController;
