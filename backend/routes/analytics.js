const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/summary', ctrl.getSummary);
router.get('/departments', ctrl.getDepartments);
router.get('/top-performers', ctrl.getTopPerformers);

module.exports = router;
