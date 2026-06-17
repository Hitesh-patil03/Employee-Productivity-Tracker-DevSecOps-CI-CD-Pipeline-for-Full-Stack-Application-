const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['Feature Dev', 'Bug Fix', 'Code Review', 'Documentation', 'Meeting', 'Research', 'Testing', 'Deployment'],
    default: 'Feature Dev',
  },
  priority: {
    type: String,
    enum: ['low', 'med', 'high'],
    default: 'med',
  },
  status: {
    type: String,
    enum: ['pending', 'inprogress', 'done', 'overdue'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  // Time tracking
  allocatedHours: {
    type: Number,
    default: 0,
    min: 0,
  },
  elapsedSeconds: {
    type: Number,
    default: 0,
    min: 0,
  },
  timerRunning: {
    type: Boolean,
    default: false,
  },
  timerStartedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// ── Auto-mark overdue ──
taskSchema.pre('save', function (next) {
  if (this.dueDate && this.status !== 'done' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  if (this.status === 'done' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
