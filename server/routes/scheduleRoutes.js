const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const validateRequest = require('../utils/validateRequest');

const router = express.Router();

router.use(protect);

router.get('/', getSchedules);
router.post(
  '/',
  authorize('provider', 'admin'),
  [
    body('providerId').if((value, { req }) => req.user.role === 'admin').isMongoId().withMessage('Valid provider ID is required'),
    body('availableDate').isISO8601().withMessage('Available date is required'),
    body('startTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must use 24-hour HH:mm format'),
    body('endTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must use 24-hour HH:mm format'),
  ],
  validateRequest,
  createSchedule
);
router.put('/:id', authorize('provider', 'admin'), [
  body('availableDate').optional().isISO8601().withMessage('Available date is required'),
  body('startTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must use 24-hour HH:mm format'),
  body('endTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must use 24-hour HH:mm format'),
], validateRequest, updateSchedule);
router.delete('/:id', authorize('provider', 'admin'), deleteSchedule);

module.exports = router;
