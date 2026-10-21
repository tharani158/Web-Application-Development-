const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const validateRequest = require('../utils/validateRequest');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('phoneNumber').optional().trim(),
  body('role').optional().isIn(['customer', 'provider', 'admin']).withMessage('Invalid user role'),
], validateRequest, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
