const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const Schedule = require('../models/Schedule');

const providerForUser = (user) => Provider.findOne({ email: user.email });
const getBookedTimes = async (req, res, next) => {
  try {
    const dayStart = new Date(req.query.date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const appointments = await Appointment.find({
      providerId: req.query.providerId,
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
      appointmentStatus: { $in: ['pending', 'approved'] },
    }).select('appointmentTime -_id');
    res.json({ bookedTimes: appointments.map((appointment) => appointment.appointmentTime) });
  } catch (error) { next(error); }
};

const getAppointments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'customer') filter.customerId = req.user._id;
    if (req.user.role === 'provider') {
      const provider = await providerForUser(req.user);
      if (!provider) return res.json([]);
      filter.providerId = provider._id;
    }
    if (req.user.role === 'customer') {
      if (!appointment.customerId.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
      if (appointment.appointmentStatus !== 'pending') return res.status(400).json({ message: 'Only pending appointments can be rescheduled' });
      const appointmentDate = req.body.appointmentDate ?? appointment.appointmentDate;
      const appointmentTime = req.body.appointmentTime ?? appointment.appointmentTime;
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) return res.status(400).json({ message: 'Appointment time must use 24-hour HH:mm format' });
      const date = new Date(appointmentDate);
      const requestedTime = new Date(date);
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      requestedTime.setHours(hours, minutes, 0, 0);
      if (Number.isNaN(date.getTime()) || requestedTime <= new Date()) return res.status(400).json({ message: 'Appointment must be scheduled in the future' });
      const dayStart = new Date(date);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      const schedule = await Schedule.findOne({ providerId: appointment.providerId, availableDate: { $gte: dayStart, $lt: dayEnd }, startTime: { $lte: appointmentTime }, endTime: { $gt: appointmentTime } });
      if (!schedule) return res.status(400).json({ message: 'The provider is not available at that date and time' });
      const conflict = await Appointment.exists({ _id: { $ne: appointment._id }, providerId: appointment.providerId, appointmentDate: { $gte: dayStart, $lt: dayEnd }, appointmentTime, appointmentStatus: { $in: ['pending', 'approved'] } });
      if (conflict) return res.status(409).json({ message: 'That time has already been booked' });
      updates.appointmentDate = date;
      updates.appointmentTime = appointmentTime;
      if (req.body.notes !== undefined) updates.notes = req.body.notes;
    } else if (req.user.role === 'admin') {
      if (req.query.customerId) filter.customerId = req.query.customerId;
      if (req.query.providerId) filter.providerId = req.query.providerId;
    }
    if (req.query.status) filter.appointmentStatus = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate('customerId', 'fullName email phoneNumber')
      .populate('providerId', 'providerName specialization email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json(appointments);
  } catch (error) { next(error); }
};

const createAppointment = async (req, res, next) => {
  try {
    if (req.user.role !== 'customer') return res.status(403).json({ message: 'Only customers can book appointments' });
    const { providerId, appointmentDate, appointmentTime, notes } = req.body;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) {
      return res.status(400).json({ message: 'Appointment time must use 24-hour HH:mm format' });
    }
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    const date = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const requestedTime = new Date(date);
    requestedTime.setHours(hours, minutes, 0, 0);
    if (Number.isNaN(date.getTime()) || requestedTime <= new Date()) {
      return res.status(400).json({ message: 'Appointment must be scheduled in the future' });
    }
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const schedule = await Schedule.findOne({
      providerId: provider._id,
      availableDate: { $gte: dayStart, $lt: dayEnd },
      startTime: { $lte: appointmentTime },
      endTime: { $gt: appointmentTime },
    });
    if (!schedule) return res.status(400).json({ message: 'The provider is not available at that date and time' });
    const existingAppointment = await Appointment.findOne({
      providerId: provider._id,
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
      appointmentTime,
      appointmentStatus: { $in: ['pending', 'approved'] },
    });
    if (existingAppointment) return res.status(409).json({ message: 'That time has already been booked' });
    const appointment = await Appointment.create({
      customerId: req.user._id,
      providerId: provider._id,
      appointmentDate: date,
      appointmentTime,
      notes,
    });
    res.status(201).json(appointment);
  } catch (error) { next(error); }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const updates = {};
    if (req.user.role === 'admin') {
      for (const key of ['appointmentStatus', 'appointmentDate', 'appointmentTime', 'notes']) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
    } else if (req.user.role === 'provider') {
      const provider = await providerForUser(req.user);
      if (!provider || !appointment.providerId.equals(provider._id)) return res.status(403).json({ message: 'Forbidden' });
      const allowed = appointment.appointmentStatus === 'pending' ? ['approved', 'rejected'] : appointment.appointmentStatus === 'approved' ? ['completed'] : [];
      if (!allowed.includes(req.body.appointmentStatus)) return res.status(400).json({ message: 'Invalid appointment status change' });
      updates.appointmentStatus = req.body.appointmentStatus;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (updates.appointmentTime !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(updates.appointmentTime)) {
      return res.status(400).json({ message: 'Appointment time must use 24-hour HH:mm format' });
    }

    Object.assign(appointment, updates);
    await appointment.save();
    res.json(appointment);
  } catch (error) { next(error); }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (req.user.role === 'customer') {
      if (!appointment.customerId.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
      if (appointment.appointmentStatus !== 'pending') return res.status(400).json({ message: 'Only pending appointments can be cancelled' });
      appointment.appointmentStatus = 'cancelled';
      await appointment.save();
      return res.json({ message: 'Appointment cancelled' });
    }
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted' });
  } catch (error) { next(error); }
};

module.exports = { getAppointments, getBookedTimes, createAppointment, updateAppointment, deleteAppointment };
