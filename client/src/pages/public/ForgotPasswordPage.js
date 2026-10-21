import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../services/authService';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to request a password reset');
    } finally { setLoading(false); }
  };

  return <main className="container py-5 page-shell"><div className="row justify-content-center"><div className="col-md-6 col-lg-5">
    <section className="card p-4 p-lg-5"><div className="section-kicker mb-2">Account access</div><h1 className="h2 mb-2">Reset your password</h1>
      <p>Enter your account email and we’ll send reset instructions if the account exists.</p>
      <form onSubmit={handleSubmit}><label className="form-label" htmlFor="reset-email">Email</label>
        <input id="reset-email" className="form-control mb-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Sending…' : 'Send reset instructions'}</button>
      </form><Link className="d-inline-block mt-3" to="/login">Back to login</Link>
    </section>
  </div></div></main>;
}

export default ForgotPasswordPage;
