const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  department: {
    type: String,
    enum: ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'],
    required: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  productivityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75,
  },
  hoursPerMonth: {
    type: Number,
    default: 160,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Reference to auth user account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Admin-visible login credentials (plain, for sharing)
  loginEmail: {
    type: String,
    default: '',
  },
  loginPassword: {
    type: String,
    default: '',
  },
  credentialsShared: {
    type: Boolean,
    default: false,
  },
  credentialsSharedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: task count
employeeSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'assignedTo',
  count: true,
});

module.exports = mongoose.model('Employee', employeeSchema);
