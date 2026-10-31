const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getProviders, getProviderById, createProvider, updateProvider, deleteProvider } = require('../controllers/providerController');
const validateRequest = require('../utils/validateRequest');

const router = express.Router();

router.get('/', getProviders);
router.get('/:id', getProviderById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('providerName').notEmpty().withMessage('Provider name is required'),
    body('specialization').notEmpty().withMessage('Specialization is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('description').optional().isString().trim(),
  ],
  validateRequest,
  createProvider
);

router.put('/:id', protect, authorize('admin'), [
  body('providerName').optional().trim().notEmpty().withMessage('Provider name cannot be empty'),
  body('specialization').optional().trim().notEmpty().withMessage('Specialization cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('description').optional().isString().trim(),
], validateRequest, updateProvider);
router.delete('/:id', protect, authorize('admin'), deleteProvider);

module.exports = router;
