const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const providerRoutes = require('./routes/providerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

const clientOrigin = process.env.CLIENT_URL?.replace(/\/$/, '');
const allowedOrigins = clientOrigin ? [clientOrigin] : ['http://localhost:3000', 'http://127.0.0.1:3000'];
const isLocalDevelopmentOrigin = (origin) => {
  try {
    const { protocol, hostname } = new URL(origin);
    return process.env.NODE_ENV !== 'production'
      && protocol === 'http:'
      && ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname);
  } catch (error) {
    return false;
  }
};
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Online Appointment Booking API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/schedules', scheduleRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use(errorHandler);

module.exports = app;
