const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Attach req.user if a valid token is provided; otherwise continue without auth
module.exports = async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return next();

    const token = authHeader.replace('Bearer ', '');
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded?.userId) return next();

    const user = await User.findById(decoded.userId).select('-password');
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore token errors for optional auth
  } finally {
    next();
  }
}


