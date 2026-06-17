const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, ctrl.getAll);
router.post('/', adminOnly, ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', adminOnly, ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);

// Credential management (admin only)
router.get('/:id/credentials', adminOnly, ctrl.getCredentials);
router.post('/:id/reset-password', adminOnly, ctrl.resetPassword);

module.exports = router;
