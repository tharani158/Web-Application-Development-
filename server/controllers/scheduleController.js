const Schedule = require('../models/Schedule');
const Provider = require('../models/Provider');

const providerForUser = (user) => Provider.findOne({ email: user.email });
const ownsSchedule = async (schedule, user) => {
  if (user.role === 'admin') return true;
  const provider = await providerForUser(user);
  return Boolean(provider && schedule.providerId.equals(provider._id));
};
const dateRange = (value) => {
  const start = new Date(value);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { $gte: start, $lt: end };
};
const scheduleStart = (date, time) => new Date(`${new Date(date).toISOString().slice(0, 10)}T${time}:00`);

const getSchedules = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'provider') {
      const provider = await providerForUser(req.user);
      if (!provider) return res.json([]);
      filter.providerId = provider._id;
    } else if (req.query.providerId) {
      filter.providerId = req.query.providerId;
    }
    const schedules = await Schedule.find(filter).populate('providerId', 'providerName specialization').sort({ availableDate: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) { next(error); }
};

const createSchedule = async (req, res, next) => {
  try {
    const { availableDate, startTime, endTime } = req.body;
    let providerId = req.body.providerId;
    if (req.user.role === 'provider') {
      const provider = await providerForUser(req.user);
      if (!provider || (providerId && !provider._id.equals(providerId))) return res.status(403).json({ message: 'You can only create your own schedule' });
      providerId = provider._id;
    }
    if (startTime >= endTime) return res.status(400).json({ message: 'End time must be after start time' });
    if (scheduleStart(availableDate, startTime) <= new Date()) return res.status(400).json({ message: 'Availability must start in the future' });
    const providerExists = await Provider.exists({ _id: providerId });
    if (!providerExists) return res.status(404).json({ message: 'Provider not found' });
    const overlap = await Schedule.exists({ providerId, availableDate: dateRange(availableDate), startTime: { $lt: endTime }, endTime: { $gt: startTime } });
    if (overlap) return res.status(409).json({ message: 'This availability overlaps an existing time range' });
    const schedule = await Schedule.create({ providerId, availableDate, startTime, endTime });
    res.status(201).json(schedule);
  } catch (error) { next(error); }
};

const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (!await ownsSchedule(schedule, req.user)) return res.status(403).json({ message: 'Forbidden' });
    const updates = {};
    for (const field of ['availableDate', 'startTime', 'endTime']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const startTime = updates.startTime || schedule.startTime;
    const endTime = updates.endTime || schedule.endTime;
    if (startTime >= endTime) return res.status(400).json({ message: 'End time must be after start time' });
    if (scheduleStart(updates.availableDate || schedule.availableDate, startTime) <= new Date()) return res.status(400).json({ message: 'Availability must start in the future' });
    const overlap = await Schedule.exists({
      _id: { $ne: schedule._id },
      providerId: schedule.providerId,
      availableDate: dateRange(updates.availableDate || schedule.availableDate),
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    if (overlap) return res.status(409).json({ message: 'This availability overlaps an existing time range' });
    Object.assign(schedule, updates);
    await schedule.save();
    res.json(schedule);
  } catch (error) { next(error); }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    if (!await ownsSchedule(schedule, req.user)) return res.status(403).json({ message: 'Forbidden' });
    await schedule.deleteOne();
    res.json({ message: 'Schedule deleted' });
  } catch (error) { next(error); }
};

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule };
