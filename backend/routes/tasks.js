const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', adminOnly, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);

// Timer routes (employee)
router.post('/:id/timer/start', ctrl.startTimer);
router.post('/:id/timer/stop', ctrl.stopTimer);
router.post('/:id/done', ctrl.markDone);

module.exports = router;
