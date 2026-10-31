import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import api from '../../services/api';
import { updateAppointment } from '../../services/appointmentService';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function AdminDashboard() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [stats, setStats] = useState({ users: 0, providers: 0, appointments: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [decisionBusy, setDecisionBusy] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState({});

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/users'), api.get('/providers'), api.get('/appointments')])
      .then(([usersResponse, providersResponse, appointmentsResponse]) => {
        if (!active) return;
        const appointments = appointmentsResponse.data;
        setAppointments(appointments);
        setStats({
          users: usersResponse.data.length,
          providers: providersResponse.data.length,
          appointments: appointments.length,
          completed: appointments.filter((item) => item.appointmentStatus === 'completed').length,
        });
      })
      .catch((error) => toast.error(error.response?.data?.message || 'Unable to load dashboard statistics'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const decideAppointment = async (appointment, appointmentStatus) => {
    const rejectionReason = rejectionReasons[appointment._id]?.trim();
    if (appointmentStatus === 'rejected' && !rejectionReason) {
      toast.error('Add a reason so the customer understands why this request was declined.');
      return;
    }
    setDecisionBusy(appointment._id);
    try {
      const response = await updateAppointment(appointment._id, {
        appointmentStatus,
        ...(appointmentStatus === 'rejected' ? { rejectionReason } : {}),
      });
      setAppointments((current) => current.map((item) => item._id === appointment._id ? { ...item, ...response.data } : item));
      toast.success(appointmentStatus === 'approved' ? 'Appointment approved' : 'Appointment declined');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update appointment');
    } finally {
      setDecisionBusy('');
    }
  };

  useEffect(() => {
    if (!chartRef.current) return undefined;
    chartInstanceRef.current?.destroy();
    chartInstanceRef.current = new Chart(chartRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Users', 'Providers', 'Appointments', 'Completed'],
        datasets: [{ label: 'Total', data: [stats.users, stats.providers, stats.appointments, stats.completed], backgroundColor: ['#087f78', '#55b99c', '#f6c66b', '#89a9db'], borderRadius: 8 }],
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
    });
    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [stats]);

  const cards = [
    ['Total users', stats.users],
    ['Providers', stats.providers],
    ['Appointments', stats.appointments],
    ['Completed', stats.completed],
  ];

  return (
    <main className="container py-5">
      <div className="page-heading">
        <div className="section-kicker mb-2">Administration</div>
        <h1>System overview</h1>
        <p>Current totals from your users, providers, and appointment records.</p>
      </div>
      <div className="row g-3 mt-2">
        {cards.map(([label, value]) => <div className="col-6 col-lg-3" key={label}>
          <div className="feature-card h-100"><div className="section-kicker">{label}</div><div className="display-6 fw-bold mt-2">{loading ? '—' : value}</div></div>
        </div>)}
      </div>
      <div className="row g-4 mt-2">
        <div className="col-lg-4"><div className="feature-card h-100">
          <h2 className="h5">Provider management</h2><p>Update provider details and manage the directory.</p>
          <Link className="btn btn-primary mt-2" to="/admin/providers">Manage providers <span aria-hidden="true">→</span></Link>
        </div></div>
        <div className="col-lg-4"><div className="feature-card h-100">
          <h2 className="h5">User access</h2><p>Manage customer, provider, and administrator roles.</p>
          <Link className="btn btn-outline-primary mt-2" to="/admin/users">Manage users <span aria-hidden="true">→</span></Link>
        </div></div>
        <div className="col-lg-8"><section className="card p-4 h-100">
          <h2 className="h5">Platform activity</h2><canvas ref={chartRef} height="120" aria-label="Current system totals chart" role="img" />
        </section></div>
      </div>
      <section className="card p-4 mt-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div><div className="section-kicker mb-1">Review queue</div><h2 className="h4 mb-1">Appointment decisions</h2><p className="mb-0">Approve requests or decline them with a clear reason for the customer.</p></div>
          <span className="badge rounded-pill text-bg-warning">{appointments.filter((item) => item.appointmentStatus === 'pending').length} awaiting review</span>
        </div>
        {appointments.length === 0 ? <p className="mb-0">No appointments have been booked yet.</p> : <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th>Customer</th><th>Provider</th><th>Date &amp; time</th><th>Status</th><th>Decision</th></tr></thead>
            <tbody>{appointments.map((appointment) => <tr key={appointment._id}>
              <td>{appointment.customerId?.fullName || 'Customer'}<div className="small text-muted">{appointment.customerId?.email}</div></td>
              <td>{appointment.providerId?.providerName || 'Provider'}<div className="small text-muted">{appointment.providerId?.specialization}</div></td>
              <td>{new Date(`${new Date(appointment.appointmentDate).toISOString().slice(0, 10)}T00:00:00`).toLocaleDateString()}<div className="small text-muted">{appointment.appointmentTime}</div></td>
              <td><span className={`badge rounded-pill ${appointment.appointmentStatus === 'approved' || appointment.appointmentStatus === 'completed' ? 'text-bg-success' : appointment.appointmentStatus === 'rejected' ? 'text-bg-danger' : 'text-bg-secondary'} text-capitalize`}>{appointment.appointmentStatus}</span>
                {appointment.appointmentStatus === 'rejected' && <div className="small text-danger mt-1">{appointment.rejectionReason || 'No reason recorded'}</div>}
                {appointment.rating && <div className="small text-muted mt-1">Customer rating: {appointment.rating}/5</div>}
              </td>
              <td>{appointment.appointmentStatus === 'pending' ? <div style={{ minWidth: 220 }}>
                <button className="btn btn-sm btn-primary me-2" disabled={decisionBusy === appointment._id} onClick={() => decideAppointment(appointment, 'approved')}>Approve</button>
                <details className="mt-2"><summary className="small text-danger" role="button">Decline request</summary>
                  <label className="form-label small mt-2" htmlFor={`reason-${appointment._id}`}>Reason shown to customer</label>
                  <textarea id={`reason-${appointment._id}`} className="form-control mb-2" rows="2" maxLength="1000" value={rejectionReasons[appointment._id] || ''} onChange={(event) => setRejectionReasons((current) => ({ ...current, [appointment._id]: event.target.value }))} placeholder="Explain why this appointment cannot be approved" />
                  <button className="btn btn-sm btn-outline-danger" disabled={decisionBusy === appointment._id} onClick={() => decideAppointment(appointment, 'rejected')}>Confirm decline</button>
                </details>
              </div> : <details><summary className="small" role="button">View details</summary><div className="small mt-2"><strong>Customer note:</strong> {appointment.notes || 'None'}{appointment.review && <div className="mt-1"><strong>Review:</strong> {appointment.review}</div>}</div></details>}</td>
            </tr>)}</tbody>
          </table>
        </div>}
      </section>
    </main>
  );
}

export default AdminDashboard;
