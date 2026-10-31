import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { fetchAppointments, updateAppointment } from '../../services/appointmentService';
import Spinner from '../../components/Spinner';

function ProviderDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ availableDate: '', startTime: '09:00', endTime: '17:00' });

  const loadData = useCallback(async () => {
    try {
      const [appointmentResponse, scheduleResponse] = await Promise.all([
        fetchAppointments(),
        api.get('/schedules'),
      ]);
      setAppointments(appointmentResponse.data);
      setSchedules(scheduleResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load your dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const changeStatus = async (id, appointmentStatus) => {
    try {
      await updateAppointment(id, { appointmentStatus });
      setAppointments((current) => current.map((item) => item._id === id ? { ...item, appointmentStatus } : item));
      toast.success(`Appointment ${appointmentStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update appointment');
    }
  };

  const addSchedule = async (event) => {
    event.preventDefault();
    setSavingSchedule(true);
    try {
      const response = await api.post('/schedules', scheduleForm);
      setSchedules((current) => [...current, response.data].sort((a, b) => new Date(a.availableDate) - new Date(b.availableDate)));
      setScheduleForm({ availableDate: '', startTime: '09:00', endTime: '17:00' });
      toast.success('Availability added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add availability');
    } finally { setSavingSchedule(false); }
  };

  const removeSchedule = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      setSchedules((current) => current.filter((schedule) => schedule._id !== id));
      toast.success('Availability removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove availability');
    }
  };

  if (loading) return <Spinner />;

  const pendingCount = appointments.filter((item) => item.appointmentStatus === 'pending').length;
  const approvedCount = appointments.filter((item) => item.appointmentStatus === 'approved').length;

  return (
    <main className="container py-5">
      <div className="page-heading">
        <div className="section-kicker mb-2">Provider workspace</div>
        <h1>Today at a glance</h1>
        <p>Review appointment requests and keep an eye on your availability.</p>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4"><div className="feature-card h-100"><div className="section-kicker">Pending requests</div><div className="display-6 fw-bold mt-2">{pendingCount}</div></div></div>
        <div className="col-sm-6 col-lg-4"><div className="feature-card h-100"><div className="section-kicker">Approved</div><div className="display-6 fw-bold mt-2">{approvedCount}</div></div></div>
        <div className="col-sm-6 col-lg-4"><div className="feature-card h-100"><div className="section-kicker">Availability entries</div><div className="display-6 fw-bold mt-2">{schedules.length}</div></div></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <section className="card p-4">
            <h2 className="h4 mb-3">Appointment requests</h2>
            {appointments.length === 0 ? <p className="mb-0">There are no appointments to show yet.</p> : (
              <div className="table-responsive"><table className="table table-hover align-middle mb-0">
                <thead><tr><th>Customer</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{appointments.map((appointment) => <tr key={appointment._id}>
                  <td>{appointment.customerId?.fullName || 'Customer'}</td>
                  <td>{new Date(`${new Date(appointment.appointmentDate).toISOString().slice(0, 10)}T00:00:00`).toLocaleDateString()}</td>
                  <td>{appointment.appointmentTime}</td>
                  <td className="text-capitalize">{appointment.appointmentStatus}</td>
                  <td>{appointment.appointmentStatus === 'pending' ? <span className="small text-muted">Waiting for admin review</span> : appointment.appointmentStatus === 'approved' ? <button className="btn btn-sm btn-outline-primary" onClick={() => changeStatus(appointment._id, 'completed')}>Mark complete</button> : null}</td>
                </tr>)}</tbody>
              </table></div>
            )}
          </section>
        </div>
        <div className="col-lg-4">
          <section className="card p-4 h-100">
            <h2 className="h4 mb-3">Your availability</h2>
            <form onSubmit={addSchedule} className="border-bottom pb-3 mb-3">
              <label className="form-label" htmlFor="schedule-date">Add a date</label>
              <input id="schedule-date" type="date" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)} className="form-control mb-2" value={scheduleForm.availableDate} onChange={(event) => setScheduleForm({ ...scheduleForm, availableDate: event.target.value })} required />
              <div className="row g-2 mb-2">
                <div className="col-6"><label className="form-label" htmlFor="schedule-start">From</label><input id="schedule-start" type="time" className="form-control" value={scheduleForm.startTime} onChange={(event) => setScheduleForm({ ...scheduleForm, startTime: event.target.value })} required /></div>
                <div className="col-6"><label className="form-label" htmlFor="schedule-end">Until</label><input id="schedule-end" type="time" className="form-control" value={scheduleForm.endTime} onChange={(event) => setScheduleForm({ ...scheduleForm, endTime: event.target.value })} required /></div>
              </div>
              <button className="btn btn-sm btn-outline-primary" disabled={savingSchedule}>{savingSchedule ? 'Adding…' : 'Add availability'}</button>
            </form>
            {schedules.length === 0 ? <p className="mb-0">No availability has been added yet.</p> : <ul className="list-group list-group-flush">
              {schedules.map((schedule) => <li className="list-group-item px-0" key={schedule._id}>
                <strong>{new Date(`${new Date(schedule.availableDate).toISOString().slice(0, 10)}T00:00:00`).toLocaleDateString()}</strong><br />
                <span className="text-muted">{schedule.startTime}–{schedule.endTime}</span>
                <button className="btn btn-sm btn-link text-danger float-end p-0" onClick={() => removeSchedule(schedule._id)}>Remove</button>
              </li>)}
            </ul>}
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProviderDashboard;
