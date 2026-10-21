import React from 'react';
import { Link } from 'react-router-dom';

function CustomerDashboard() {
  return (
    <div className="container py-5">
      <h2>Customer Dashboard</h2>
      <div className="row g-4 mt-3">
        <div className="col-md-4">
          <div className="card shadow-sm p-4">
            <h5>Your appointments</h5>
            <p>Review your booking history, check appointment status, or cancel a pending request.</p>
            <Link className="btn btn-sm btn-primary mt-3" to="/history">
              View My Appointments
            </Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-4">
            <h5>Available Providers</h5>
            <p>Search providers and select the right specialist for your needs.</p>
            <Link className="btn btn-sm btn-outline-primary mt-3" to="/providers">Browse providers</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-4">
            <h5>Profile</h5>
            <p>Keep your account details current for faster booking.</p>
            <Link className="btn btn-sm btn-outline-primary mt-3" to="/profile">Edit profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
