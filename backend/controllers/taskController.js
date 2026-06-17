const Task = require('../models/Task');
const Employee = require('../models/Employee');

// GET /api/tasks  (Admin: all tasks | Employee: own tasks)
exports.getAll = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'employee') {
      filter.assignedTo = req.user.employeeId;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.employeeId && req.user.role === 'admin') filter.assignedTo = req.query.employeeId;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name department role')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tasks/:id
exports.getOne = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name department role')
      .populate('assignedBy', 'name');
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    // Employee can only view their own tasks
    if (req.user.role === 'employee' && task.assignedTo._id.toString() !== req.user.employeeId?.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks  (Admin only)
exports.create = async (req, res) => {
  try {
    const { title, description, assignedTo, category, priority, dueDate, allocatedHours } = req.body;
    if (!title || !assignedTo) {
      return res.status(400).json({ error: 'title and assignedTo are required.' });
    }

    const emp = await Employee.findById(assignedTo);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const task = await Task.create({
      title, description, assignedTo, assignedBy: req.user._id,
      category, priority, allocatedHours: allocatedHours || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const populated = await task.populate('assignedTo', 'name department role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/tasks/:id  (Admin: all fields | Employee: status + timer only)
exports.update = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    if (req.user.role === 'employee') {
      // Employees can only update their own tasks' timer/status
      if (task.assignedTo.toString() !== req.user.employeeId?.toString()) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      const allowed = ['status', 'elapsedSeconds', 'timerRunning', 'timerStartedAt'];
      allowed.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
    } else {
      // Admin can update everything
      const fields = ['title', 'description', 'category', 'priority', 'status', 'dueDate', 'allocatedHours', 'assignedTo'];
      fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
    }

    await task.save();
    const populated = await task.populate('assignedTo', 'name department role');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/tasks/:id  (Admin only)
exports.remove = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks/:id/timer/start  (Employee)
exports.startTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    if (task.assignedTo.toString() !== req.user.employeeId?.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (task.status === 'done') return res.status(400).json({ error: 'Task already done.' });

    task.timerRunning = true;
    task.timerStartedAt = new Date();
    if (task.status === 'pending') task.status = 'inprogress';
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks/:id/timer/stop  (Employee)
exports.stopTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    if (task.assignedTo.toString() !== req.user.employeeId?.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (task.timerRunning && task.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(task.timerStartedAt).getTime()) / 1000);
      task.elapsedSeconds += elapsed;
    }
    task.timerRunning = false;
    task.timerStartedAt = null;

    // Check if time limit exceeded
    if (task.allocatedHours > 0 && task.elapsedSeconds >= task.allocatedHours * 3600) {
      task.status = 'overdue';
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks/:id/done  (Employee)
exports.markDone = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    if (task.assignedTo.toString() !== req.user.employeeId?.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (task.timerRunning && task.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(task.timerStartedAt).getTime()) / 1000);
      task.elapsedSeconds += elapsed;
    }
    task.timerRunning = false;
    task.timerStartedAt = null;
    task.status = 'done';
    task.completedAt = new Date();
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
