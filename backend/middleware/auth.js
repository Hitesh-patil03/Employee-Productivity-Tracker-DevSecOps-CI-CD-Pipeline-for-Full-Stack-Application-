const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Verify JWT ──
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User no longer exists or is deactivated.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

// ── Admin only ──
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// ── Employee only ──
exports.employeeOnly = (req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ error: 'Access denied. Employee only.' });
  }
  next();
};

// ── Admin or self ──
exports.adminOrSelf = (paramKey = 'id') => (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.user.employeeId && req.user.employeeId.toString() === req.params[paramKey]) return next();
  return res.status(403).json({ error: 'Access denied.' });
};
