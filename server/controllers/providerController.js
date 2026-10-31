const Provider = require('../models/Provider');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const { getUpcomingDates } = require('../utils/availability');
const { defaultProviderDescription } = require('../utils/providerDescription');

const getProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find();
    res.json(providers);
  } catch (error) {
    next(error);
  }
};

const getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    next(error);
  }
};

const createProvider = async (req, res, next) => {
  try {
    const { providerName, specialization, email, phone, description, profileImage } = req.body;
    const provider = await Provider.create({
      providerName,
      specialization,
      email: email.trim().toLowerCase(),
      phone,
      description: description?.trim() || defaultProviderDescription(specialization),
      profileImage,
    });
    try {
      await Schedule.insertMany(getUpcomingDates().map((availableDate) => ({
        providerId: provider._id,
        availableDate,
        startTime: '09:00',
        endTime: '17:00',
      })));
    } catch (error) {
      await provider.deleteOne();
      throw error;
    }
    res.status(201).json(provider);
  } catch (error) {
    next(error);
  }
};

const updateProvider = async (req, res, next) => {
  try {
    const allowedFields = ['providerName', 'specialization', 'email', 'phone', 'description', 'profileImage'];
    const updates = Object.fromEntries(allowedFields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, field === 'email' ? req.body[field].trim().toLowerCase() : req.body[field]]));
    const currentProvider = await Provider.findById(req.params.id);
    if (!currentProvider) return res.status(404).json({ message: 'Provider not found' });
    const linkedUser = updates.email && updates.email !== currentProvider.email
      ? await User.findOne({ email: currentProvider.email, role: 'provider' })
      : null;
    if (linkedUser && await User.exists({ email: updates.email, _id: { $ne: linkedUser._id } })) {
      return res.status(409).json({ message: 'Email is already in use by a user account' });
    }
    if (updates.description !== undefined && !updates.description.trim()) {
      updates.description = defaultProviderDescription(updates.specialization || currentProvider.specialization);
    }
    Object.assign(currentProvider, updates);
    await currentProvider.save();
    if (linkedUser) {
      linkedUser.email = updates.email;
      await linkedUser.save();
    }
    const provider = currentProvider;
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    next(error);
  }
};

const deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json({ message: 'Provider deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
};
