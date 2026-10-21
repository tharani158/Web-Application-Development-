import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProviders } from '../../services/providerService';
import { createAppointment, fetchAppointments, updateAppointment } from '../../services/appointmentService';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import api from '../../services/api';

function BookingPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rescheduleId = searchParams.get('reschedule');
  const [providers, setProviders] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [formData, setFormData] = useState({ providerId: '', appointmentDate: '', appointmentTime: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetchProviders();
        setProviders(response.data);
        if (rescheduleId) {
          const appointmentsResponse = await fetchAppointments();
          const appointment = appointmentsResponse.data.find((item) => item._id === rescheduleId);
          if (!appointment || appointment.appointmentStatus !== 'pending') {
            toast.error('This appointment can no longer be rescheduled');
            navigate('/history');
            return;
          }
          const appointmentDate = new Date(appointment.appointmentDate).toISOString().slice(0, 10);
          setFormData({
            providerId: appointment.providerId?._id || appointment.providerId,
            appointmentDate,
            appointmentTime: appointment.appointmentTime,
            notes: appointment.notes || '',
          });
          const [scheduleResponse, availabilityResponse] = await Promise.all([
            api.get('/schedules', { params: { providerId: appointment.providerId?._id || appointment.providerId } }),
            api.get('/appointments/availability', { params: { providerId: appointment.providerId?._id || appointment.providerId, date: appointmentDate } }),
          ]);
          setSchedules(scheduleResponse.data);
          setBookedTimes(availabilityResponse.data.bookedTimes.filter((time) => time !== appointment.appointmentTime));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load booking details');
      } finally {
        setLoadingProviders(false);
      }
    };

    loadProviders();
  }, [rescheduleId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'providerId') {
      setSchedules([]);
      setBookedTimes([]);
      setFormData({ ...formData, providerId: value, appointmentDate: '', appointmentTime: '' });
      if (value) {
        api.get('/schedules', { params: { providerId: value } })
          .then((response) => setSchedules(response.data))
          .catch((error) => toast.error(error.response?.data?.message || 'Unable to load provider availability'));
      }
      return;
    }
    setFormData({ ...formData, [name]: value, ...(name === 'appointmentDate' ? { appointmentTime: '' } : {}) });
    if (name === 'appointmentDate') {
      setBookedTimes([]);
      if (value && formData.providerId) {
        api.get('/appointments/availability', { params: { providerId: formData.providerId, date: value } })
          .then((response) => setBookedTimes(response.data.bookedTimes))
          .catch((error) => toast.error(error.response?.data?.message || 'Unable to load available times'));
      }
    }
  };

  const localToday = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const availableDates = [...new Set(schedules.map((schedule) => new Date(schedule.availableDate).toISOString().slice(0, 10)))].filter((date) => date >= localToday);
  const selectedSchedule = schedules.find((schedule) => new Date(schedule.availableDate).toISOString().slice(0, 10) === formData.appointmentDate);
  const availableTimes = [];
  if (selectedSchedule) {
    const [startHour, startMinute] = selectedSchedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = selectedSchedule.endTime.split(':').map(Number);
    for (let totalMinutes = startHour * 60 + startMinute; totalMinutes < endHour * 60 + endMinute; totalMinutes += 30) {
      availableTimes.push(`${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`);
    }
  }
  const currentLocalTime = new Date().toTimeString().slice(0, 5);
  const futureAvailableTimes = availableTimes.filter((time) => !bookedTimes.includes(time) && (formData.appointmentDate !== localToday || time > currentLocalTime));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in before booking an appointment');
      return;
    }

    setLoading(true);
    try {
      if (rescheduleId) {
        await updateAppointment(rescheduleId, formData);
        toast.success('Appointment rescheduled');
      } else {
        await createAppointment(formData);
        toast.success('Appointment request created');
      }
      setFormData({ providerId: '', appointmentDate: '', appointmentTime: '', notes: '' });
      navigate('/history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProviders) return <Spinner />;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm p-4">
            <h2>{rescheduleId ? 'Reschedule Appointment' : 'Book an Appointment'}</h2>
            {!user ? (
              <div className="alert alert-warning">Please log in to book an appointment.</div>
            ) : providers.length === 0 ? (
              <div className="alert alert-warning">No providers are available yet. Please check back later.</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Provider</label>
                  <select className="form-select" name="providerId" value={formData.providerId} onChange={handleChange} required disabled={Boolean(rescheduleId)}>
                    <option value="">Choose provider</option>
                    {providers.map((provider) => (
                      <option key={provider._id} value={provider._id}>
                        {provider.providerName} - {provider.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <select name="appointmentDate" className="form-select" value={formData.appointmentDate} onChange={handleChange} required disabled={!schedules.length}>
                    <option value="">Choose an available date</option>
                    {availableDates.map((date) => <option value={date} key={date}>{new Date(`${date}T00:00:00`).toLocaleDateString()}</option>)}
                  </select>
                  {formData.providerId && schedules.length === 0 && <div className="form-text">This provider has no availability published yet.</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Time</label>
                  <select name="appointmentTime" className="form-select" value={formData.appointmentTime} onChange={handleChange} required disabled={!selectedSchedule}>
                    <option value="">Choose an available time</option>
                    {futureAvailableTimes.map((time) => <option value={time} key={time}>{time}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea name="notes" className="form-control" value={formData.notes} onChange={handleChange} rows="3" />
                </div>
                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Saving...' : rescheduleId ? 'Save new time' : 'Request Appointment'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
