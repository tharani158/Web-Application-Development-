const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const Schedule = require('../models/Schedule');

const getProviderForUser = async (user) => {
  return Provider.findOne({ email: user.email });
};

const isValidTime = (timeString) => /^([01]\d|2[0-3]):[0-5]\d$/.test(timeString);

const getDayRange = (dateValue) => {
  const dayStart = new Date(dateValue);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  return { dayStart, dayEnd };
};

const getBookedTimes = async (req, res, next) => {
  try {
    const { providerId, date } = req.query;
    const { dayStart, dayEnd } = getDayRange(date);

    const appointments = await Appointment.find({
      providerId,
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
      appointmentStatus: { $in: ['pending', 'approved'] },
    }).select('appointmentTime -_id');

    const bookedTimes = appointments.map((appointment) => appointment.appointmentTime);
    res.json({ bookedTimes });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    }

    if (req.user.role === 'provider') {
      const provider = await getProviderForUser(req.user);

      if (!provider) {
        return res.json([]);
      }

      filter.providerId = provider._id;
    }

    if (req.user.role === 'admin') {
      if (req.query.customerId) filter.customerId = req.query.customerId;
      if (req.query.providerId) filter.providerId = req.query.providerId;
    }

    if (req.query.status) {
      filter.appointmentStatus = req.query.status;
    }

    const appointments = await Appointment.find(filter)
      .populate('customerId', 'fullName email phoneNumber')
      .populate('providerId', 'providerName specialization email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can book appointments' });
    }

    const { providerId, appointmentDate, appointmentTime, notes } = req.body;

    if (!isValidTime(appointmentTime)) {
      return res.status(400).json({ message: 'Appointment time must use 24-hour HH:mm format' });
    }

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const date = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const selectedTime = new Date(date);
    selectedTime.setHours(hours, minutes, 0, 0);

    if (Number.isNaN(date.getTime()) || selectedTime <= new Date()) {
      return res.status(400).json({ message: 'Appointment must be scheduled in the future' });
    }

    const { dayStart, dayEnd } = getDayRange(date);

    const providerSchedule = await Schedule.findOne({
      providerId: provider._id,
      availableDate: { $gte: dayStart, $lt: dayEnd },
      startTime: { $lte: appointmentTime },
      endTime: { $gt: appointmentTime },
    });

    if (!providerSchedule) {
      return res.status(400).json({ message: 'The provider is not available at that date and time' });
    }

    const sameTimeBooking = await Appointment.findOne({
      providerId: provider._id,
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
      appointmentTime,
      appointmentStatus: { $in: ['pending', 'approved'] },
    });

    if (sameTimeBooking) {
      return res.status(409).json({ message: 'That time has already been booked' });
    }

    const appointment = await Appointment.create({
      customerId: req.user._id,
      providerId: provider._id,
      appointmentDate: date,
      appointmentTime,
      notes,
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updates = {};

    if (req.user.role === 'admin') {
      for (const field of ['appointmentStatus', 'appointmentDate', 'appointmentTime', 'notes']) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
    } else if (req.user.role === 'provider') {
      const provider = await getProviderForUser(req.user);

      if (!provider || !appointment.providerId.equals(provider._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const validStatuses = appointment.appointmentStatus === 'pending'
        ? ['approved', 'rejected']
        : appointment.appointmentStatus === 'approved'
          ? ['completed']
          : [];

      if (!validStatuses.includes(req.body.appointmentStatus)) {
        return res.status(400).json({ message: 'Invalid appointment status change' });
      }

      updates.appointmentStatus = req.body.appointmentStatus;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (updates.appointmentTime !== undefined && !isValidTime(updates.appointmentTime)) {
      return res.status(400).json({ message: 'Appointment time must use 24-hour HH:mm format' });
    }

    Object.assign(appointment, updates);
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role === 'customer') {
      if (!appointment.customerId.equals(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (appointment.appointmentStatus !== 'pending') {
        return res.status(400).json({ message: 'Only pending appointments can be cancelled' });
      }

      appointment.appointmentStatus = 'cancelled';
      await appointment.save();

      return res.json({ message: 'Appointment cancelled' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getBookedTimes,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
