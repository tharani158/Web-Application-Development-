const User = require('../models/User');
const Provider = require('../models/Provider');

const publicUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
});

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -resetToken -resetTokenExpiry');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findById(req.params.id).select('-password -resetToken -resetTokenExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowedFields = req.user.role === 'admin'
      ? ['fullName', 'email', 'phoneNumber', 'role']
      : ['fullName', 'email', 'phoneNumber'];
    const updates = Object.fromEntries(allowedFields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, field === 'email' ? req.body[field].trim().toLowerCase() : req.body[field]]));
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });
    if (updates.email && currentUser.role === 'provider' && updates.email !== currentUser.email) {
      const provider = await Provider.findOne({ email: currentUser.email });
      if (provider) {
        const [duplicateUser, duplicateProvider] = await Promise.all([
          User.exists({ email: updates.email, _id: { $ne: currentUser._id } }),
          Provider.exists({ email: updates.email, _id: { $ne: provider._id } }),
        ]);
        if (duplicateUser || duplicateProvider) return res.status(409).json({ message: 'Email is already in use' });
        provider.email = updates.email;
        await provider.save();
      }
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -resetToken -resetTokenExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
