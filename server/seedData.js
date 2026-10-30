const bcrypt = require('bcryptjs');
const Provider = require('./models/Provider');
const Schedule = require('./models/Schedule');
const User = require('./models/User');
const { getUpcomingDates } = require('./utils/availability');

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

    // Fill every missing date in the next 30 days. Dates use UTC midnight so
    // date-only values remain stable in the UI regardless of server timezone.
    const dates = getUpcomingDates();
    const endDate = new Date(dates[dates.length - 1]);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const providers = await Provider.find().select('_id');
    const newSchedules = [];
    for (const provider of providers) {
      const existingSchedules = await Schedule.find({
        providerId: provider._id,
        availableDate: { $gte: dates[0], $lt: endDate },
      }).select('availableDate').lean();
      const existingDates = new Set(existingSchedules.map((schedule) => schedule.availableDate.toISOString().slice(0, 10)));
      dates.forEach((availableDate) => {
        if (!existingDates.has(availableDate.toISOString().slice(0, 10))) newSchedules.push({
          providerId: provider._id,
          availableDate,
          startTime: '09:00',
          endTime: '17:00',
        });
      });
    }
    if (newSchedules.length) {
      await Schedule.insertMany(newSchedules);
      console.log(`Seeded ${newSchedules.length} daily availability entries.`);
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
