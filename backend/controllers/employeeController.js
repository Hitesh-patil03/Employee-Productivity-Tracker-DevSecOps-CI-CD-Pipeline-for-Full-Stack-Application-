const crypto = require('crypto');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Task = require('../models/Task');

// GET /api/employees
exports.getAll = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/employees/:id
exports.getOne = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/employees  (Admin only)
// Creates employee record AND a user account with auto-generated credentials
exports.create = async (req, res) => {
  try {
    const { name, email, department, role, productivityScore, hoursPerMonth } = req.body;
    if (!name || !email || !department || !role) {
      return res.status(400).json({ error: 'name, email, department and role are required.' });
    }

    // Check email uniqueness
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'An account with this email already exists.' });

    // Generate a secure plain password (shown to admin for sharing)
    const plainPassword = generatePassword();

    // Create the employee record first
    const employee = await Employee.create({
      name, email, department, role,
      productivityScore: productivityScore || 75,
      hoursPerMonth: hoursPerMonth || 160,
      loginEmail: email.toLowerCase(),
      loginPassword: plainPassword,
      credentialsShared: false,
    });

    // Create the auth user account linked to this employee
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: plainPassword,
      role: 'employee',
      employeeId: employee._id,
      plainPassword,
      createdBy: req.user._id,
    });
    await user.save();

    // Link userId back to employee
    employee.userId = user._id;
    await employee.save();

    // Return employee WITH plain credentials (so admin can share them)
    res.status(201).json({
      employee,
      credentials: {
        email: email.toLowerCase(),
        password: plainPassword,
        message: 'Share these credentials with the employee to allow them to log in.',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/employees/:id  (Admin only)
exports.update = async (req, res) => {
  try {
    const { name, department, role, productivityScore, hoursPerMonth } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, department, role, productivityScore, hoursPerMonth },
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });

    // Also update user name if changed
    if (name && employee.userId) {
      await User.findByIdAndUpdate(employee.userId, { name });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/employees/:id  (Admin only) — soft delete
exports.remove = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });
    if (employee.userId) {
      await User.findByIdAndUpdate(employee.userId, { isActive: false });
    }
    res.json({ message: 'Employee deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/employees/:id/credentials  (Admin only)
// Returns plain credentials so admin can share with employee
exports.getCredentials = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });

    // Mark as shared
    employee.credentialsShared = true;
    employee.credentialsSharedAt = new Date();
    await employee.save();

    res.json({
      name: employee.name,
      email: employee.loginEmail,
      password: employee.loginPassword,
      sharedAt: employee.credentialsSharedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/employees/:id/reset-password  (Admin only)
exports.resetPassword = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });

    const newPassword = generatePassword();
    employee.loginPassword = newPassword;
    employee.credentialsShared = false;
    await employee.save();

    // Update the hashed password on the user account
    const user = await User.findById(employee.userId).select('+password');
    if (user) {
      user.password = newPassword;
      user.plainPassword = newPassword;
      await user.save();
    }

    res.json({
      email: employee.loginEmail,
      password: newPassword,
      message: 'Password reset. Share the new credentials with the employee.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Helper: generate readable password ──
function generatePassword() {
  const words = ['Alpha', 'Delta', 'Nova', 'Sigma', 'Prime', 'Apex', 'Core', 'Flux', 'Grid', 'Bolt'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const sym = ['!', '@', '#', '$'][Math.floor(Math.random() * 4)];
  return `${word}${num}${sym}`;
}
