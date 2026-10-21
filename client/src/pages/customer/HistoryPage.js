import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchAppointments, deleteAppointment } from '../../services/appointmentService';
import { AuthContext } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';

function HistoryPage() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        const response = await fetchAppointments({ customerId: user.id });
        setAppointments(response.data);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Unable to load appointment history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const handleCancel = async (id) => {
    try {
      await deleteAppointment(id);
      setAppointments((current) => current.map((appointment) => appointment._id === id
        ? { ...appointment, appointmentStatus: 'cancelled' }
        : appointment));
      toast.success('Appointment cancelled');
    } catch (error) {
      toast.error('Unable to cancel appointment');
    }
  };

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Please log in to view your appointment history.</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2>Appointment History</h2>
      {appointments.length === 0 ? (
        <div className="alert alert-info mt-4">You have no appointments yet. Use the Book page to create one.</div>
      ) : (
        <div className="card shadow-sm mt-4">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.providerId?.providerName || 'N/A'}</td>
                    <td>{new Date(`${new Date(appointment.appointmentDate).toISOString().slice(0, 10)}T00:00:00`).toLocaleDateString()}</td>
                    <td>{appointment.appointmentTime}</td>
                    <td>{appointment.appointmentStatus}</td>
                    <td>
                      {appointment.appointmentStatus === 'pending' && <div className="d-flex gap-2">
                        <Link className="btn btn-sm btn-outline-primary" to={`/book?reschedule=${appointment._id}`}>Reschedule</Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(appointment._id)}>Cancel</button>
                      </div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
