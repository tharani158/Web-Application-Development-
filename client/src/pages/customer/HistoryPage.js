import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchAppointments, deleteAppointment, rateAppointment } from '../../services/appointmentService';
import { AuthContext } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';

function HistoryPage() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [ratingBusy, setRatingBusy] = useState('');

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

  const submitRating = async (appointment) => {
    const rating = Number(ratings[appointment._id]);
    if (!rating) {
      toast.error('Choose a star rating before submitting.');
      return;
    }
    setRatingBusy(appointment._id);
    try {
      const response = await rateAppointment(appointment._id, { rating, review: reviews[appointment._id] || '' });
      setAppointments((current) => current.map((item) => item._id === appointment._id ? { ...item, ...response.data } : item));
      toast.success('Thank you for sharing your feedback.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save your rating');
    } finally {
      setRatingBusy('');
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
                  <th>Appointment details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.providerId?.providerName || 'N/A'}</td>
                    <td>{new Date(`${new Date(appointment.appointmentDate).toISOString().slice(0, 10)}T00:00:00`).toLocaleDateString()}</td>
                    <td>{appointment.appointmentTime}</td>
                    <td><span className={`badge rounded-pill text-capitalize ${appointment.appointmentStatus === 'approved' || appointment.appointmentStatus === 'completed' ? 'text-bg-success' : appointment.appointmentStatus === 'rejected' ? 'text-bg-danger' : appointment.appointmentStatus === 'cancelled' ? 'text-bg-secondary' : 'text-bg-warning'}`}>{appointment.appointmentStatus === 'approved' ? 'Confirmed' : appointment.appointmentStatus === 'rejected' ? 'Not confirmed' : appointment.appointmentStatus}</span></td>
                    <td>{appointment.appointmentStatus === 'rejected' ? <div className="small text-danger"><strong>Why it was not confirmed:</strong><br />{appointment.rejectionReason || 'Please contact the provider for more information.'}</div> : appointment.appointmentStatus === 'pending' ? <span className="small text-muted">Waiting for admin review</span> : appointment.appointmentStatus === 'approved' ? <span className="small text-success">Your appointment is confirmed.</span> : appointment.appointmentStatus === 'completed' ? (appointment.rating ? <div><span className="text-warning">{'★'.repeat(appointment.rating)}{'☆'.repeat(5 - appointment.rating)}</span><div className="small text-muted">{appointment.review || 'Thanks for your rating!'}</div></div> : <div style={{ minWidth: 230 }}>
                      <label className="form-label small mb-1" htmlFor={`rating-${appointment._id}`}>Rate this completed appointment</label>
                      <select id={`rating-${appointment._id}`} className="form-select form-select-sm mb-2" value={ratings[appointment._id] || ''} onChange={(event) => setRatings((current) => ({ ...current, [appointment._id]: event.target.value }))}>
                        <option value="">Choose stars</option><option value="5">★★★★★ — Excellent</option><option value="4">★★★★ — Good</option><option value="3">★★★ — Okay</option><option value="2">★★ — Poor</option><option value="1">★ — Very poor</option>
                      </select>
                      <textarea className="form-control form-control-sm mb-2" rows="2" maxLength="1000" aria-label="Optional appointment feedback" placeholder="Add a comment (optional)" value={reviews[appointment._id] || ''} onChange={(event) => setReviews((current) => ({ ...current, [appointment._id]: event.target.value }))} />
                      <button className="btn btn-sm btn-primary" disabled={ratingBusy === appointment._id} onClick={() => submitRating(appointment)}>{ratingBusy === appointment._id ? 'Saving…' : 'Submit rating'}</button>
                    </div>) : '—'}</td>
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
