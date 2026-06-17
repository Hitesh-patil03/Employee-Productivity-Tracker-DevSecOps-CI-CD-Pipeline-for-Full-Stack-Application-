const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password and role are required.' });
    }
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or employee.' });
    }

    // Find user WITH password
    const user = await User.findOne({ email: email.toLowerCase().trim(), role }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Fetch employee profile if role is employee
    let employeeProfile = null;
    if (role === 'employee' && user.employeeId) {
      employeeProfile = await Employee.findById(user.employeeId);
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        lastLogin: user.lastLogin,
      },
      employee: employeeProfile,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    let employeeProfile = null;
    if (user.role === 'employee' && user.employeeId) {
      employeeProfile = await Employee.findById(user.employeeId);
    }
    res.json({ user, employee: employeeProfile });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};
