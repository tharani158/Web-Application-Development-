import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import api from '../../services/api';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function AdminDashboard() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [stats, setStats] = useState({ users: 0, providers: 0, appointments: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/users'), api.get('/providers'), api.get('/appointments')])
      .then(([usersResponse, providersResponse, appointmentsResponse]) => {
        if (!active) return;
        const appointments = appointmentsResponse.data;
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
    </main>
  );
}

export default AdminDashboard;
