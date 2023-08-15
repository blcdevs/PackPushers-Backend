const PF = require('../models/packageForwarder');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

packageController.updatePackage = async (req, res) => {
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
  
  packageController.deletePackage = async (req, res) => {
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

module.exports = pfController;
