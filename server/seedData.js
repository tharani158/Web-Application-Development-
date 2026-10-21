const bcrypt = require('bcryptjs');
const Provider = require('./models/Provider');
const Schedule = require('./models/Schedule');
const User = require('./models/User');
const { getUpcomingWeekdays } = require('./utils/availability');

const seedData = async () => {
  try {
    const providerCount = await Provider.countDocuments();
    if (providerCount === 0) {
      const providers = await Provider.insertMany([
        {
          providerName: 'Dr. Maya Patel',
          specialization: 'General Physician',
          email: 'maya.patel@example.com',
          phone: '555-0101',
          description: 'Experienced general physician offering preventative care and diagnosis for common health concerns.',
        },
        {
          providerName: 'Dr. James Carter',
          specialization: 'Physiotherapist',
          email: 'james.carter@example.com',
          phone: '555-0202',
          description: 'Physiotherapy specialist focused on rehabilitation, pain management, and mobility improvement.',
        },
        {
          providerName: 'Dr. Nina Rodriguez',
          specialization: 'Dermatologist',
          email: 'nina.rodriguez@example.com',
          phone: '555-0303',
          description: 'Dermatology expert for skin health, cosmetic care, and treatment of skin conditions.',
        },
      ]);

      console.log(`Seeded ${providers.length} providers.`);

    }

    // Every provider without future availability gets the next five weekdays.
    // Dates are stored at UTC midnight so date-only values remain stable in the UI.
    const dates = getUpcomingWeekdays();
    const today = new Date(dates[0]);
    today.setUTCHours(0, 0, 0, 0);

    const providers = await Provider.find().select('_id');
    const newSchedules = [];
    for (const provider of providers) {
      const hasFutureSchedule = await Schedule.exists({ providerId: provider._id, availableDate: { $gte: today } });
      if (!hasFutureSchedule) {
        dates.forEach((availableDate) => newSchedules.push({
          providerId: provider._id,
          availableDate,
          startTime: '09:00',
          endTime: '17:00',
        }));
      }
    }
    if (newSchedules.length) {
      await Schedule.insertMany(newSchedules);
      console.log(`Seeded ${newSchedules.length} weekday availability entries.`);
    }

    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'System Administrator' } = process.env;
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      const adminEmail = ADMIN_EMAIL.trim().toLowerCase();
      let admin = await User.findOne({ email: adminEmail }).select('+password');
      if (!admin) {
        admin = new User({ fullName: ADMIN_NAME, email: adminEmail, password: await bcrypt.hash(ADMIN_PASSWORD, 10), role: 'admin' });
        await admin.save();
        console.log(`Created configured administrator account: ${adminEmail}`);
      } else if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log(`Granted administrator role to configured account: ${adminEmail}`);
      }
    }
  } catch (error) {
    throw error;
  }
};

module.exports = seedData;
