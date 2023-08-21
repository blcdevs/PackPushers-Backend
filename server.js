const express = require('express');
const bodyParser = require('body-parser');
// const packageForwarderRoutes = require('./routes/packageForwarderRoutes');
const userRoutes = require('./routes/userRoutes');
const pfRoutes = require('./routes/pfRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dotenv = require('dotenv');
const db = require('./config/database'); // Import the db object
const authMiddleware = require('./config/auth');
require('dotenv').config();
const cors = require('cors');

const app = express();

dotenv.config();

// Remove db.connect() from here

app.use(bodyParser.json());


app.use(cors({
    origin: '*'
}));


// Define a default route handler for the base URL
app.get('/', (req, res) => {
    res.send('Welcome to PackPushers API');
  });

// Use package forwarder and user routes
// app.use('/api/package-forwarders', packageForwarderRoutes);
app.use('/api/users', userRoutes);

app.use('/api/agent', pfRoutes);

app.use('/api/admin', adminRoutes);



const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
