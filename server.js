const express = require('express');
const bodyParser = require('body-parser');
// const packageForwarderRoutes = require('./routes/packageForwarderRoutes');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');
const db = require('./config/database'); // Import the db object
const authMiddleware = require('./config/auth');
require('dotenv').config();

const app = express();

dotenv.config();

// Remove db.connect() from here

app.use(bodyParser.json());


// Define a default route handler for the base URL
app.get('/', (req, res) => {
    res.send('Welcome to PackPushers API');
  });

// Use package forwarder and user routes
// app.use('/api/package-forwarders', packageForwarderRoutes);
app.use('/api/users', userRoutes);

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
