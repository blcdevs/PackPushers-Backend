const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET_KEY } = process.env;

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    req.userId = decodedToken.userId;
    req.userRole = decodedToken.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
