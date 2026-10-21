import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../../services/authService';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const response = await resetPassword(token, { password });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reset password');
    } finally { setLoading(false); }
  };

  return <main className="container py-5 page-shell"><div className="row justify-content-center"><div className="col-md-6 col-lg-5">
    <section className="card p-4 p-lg-5"><div className="section-kicker mb-2">Account access</div><h1 className="h2 mb-2">Choose a new password</h1>
      <form onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="new-password">New password</label>
        <input id="new-password" className="form-control mb-3" type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
        <label className="form-label" htmlFor="confirm-password">Confirm password</label>
        <input id="confirm-password" className="form-control mb-3" type="password" minLength="6" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" />
        <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Saving…' : 'Update password'}</button>
      </form><Link className="d-inline-block mt-3" to="/login">Back to login</Link>
    </section>
  </div></div></main>;
}

export default ResetPasswordPage;
