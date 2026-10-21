const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAppointments, getBookedTimes, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const validateRequest = require('../utils/validateRequest');

const router = express.Router();

router.use(protect);

router.get('/availability', authorize('customer', 'admin'), [
  query('providerId').isMongoId().withMessage('Valid provider ID is required'),
  query('date').isISO8601().withMessage('Valid date is required'),
], validateRequest, getBookedTimes);
router.get('/', getAppointments);
router.post(
  '/',
  [
    body('providerId').isMongoId().withMessage('Valid provider ID is required'),
    body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
    body('appointmentTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Appointment time must use 24-hour HH:mm format'),
  ],
  validateRequest,
  createAppointment
);
router.put('/:id', [
  body('appointmentStatus').optional().isIn(['pending', 'approved', 'rejected', 'completed', 'cancelled']),
  body('appointmentDate').optional().isISO8601(),
  body('appointmentTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
], validateRequest, updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
