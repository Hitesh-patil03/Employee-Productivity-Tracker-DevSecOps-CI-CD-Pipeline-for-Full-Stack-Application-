const Employee = require('../models/Employee');
const Task = require('../models/Task');

// GET /api/analytics/summary
exports.getSummary = async (req, res) => {
  try {
    const [totalEmployees, tasks] = await Promise.all([
      Employee.countDocuments({ isActive: true }),
      Task.find(),
    ]);

    const avgProductivity = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avg: { $avg: '$productivityScore' } } },
    ]);

    const tasksByStatus = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalEmployees,
      avgProductivity: Math.round(avgProductivity[0]?.avg || 0),
      totalTasks: tasks.length,
      tasksByStatus,
      completedTasks: tasksByStatus.done || 0,
      overdueTasks: tasksByStatus.overdue || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/departments
exports.getDepartments = async (req, res) => {
  try {
    const data = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          avgScore: { $avg: '$productivityScore' },
          count: { $sum: 1 },
          totalHours: { $sum: '$hoursPerMonth' },
        },
      },
      { $sort: { avgScore: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/top-performers
exports.getTopPerformers = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .sort({ productivityScore: -1 })
      .limit(10)
      .select('name department role productivityScore hoursPerMonth');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
