import React from 'react';

function ServicesPage() {
  return (
    <div className="container py-5">
      <h2>Services</h2>
       <p>Choose the service you need and book your appointment at a convenient time. Our appointment booking system makes it easy to find the right service, select an available time slot, and confirm your booking online.</p>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card p-4 shadow-sm h-100">
            <h5>Appointment Booking</h5>
            <p>Easily book appointments online by selecting a preferred service, professional, date, and available time slot. Users can view appointment details, receive booking confirmations, and manage or cancel their appointments when needed.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 shadow-sm h-100">
            <h5>Schedule Management</h5>
            <p>Manage appointments and schedules efficiently from one centralized system. Professionals and administrators can organize their availability, manage time slots, and prevent double bookings.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 shadow-sm h-100">
            <h5>Analytics</h5>
            <p>Gain valuable insights into appointment activities and overall system performance through reports and analytics. Administrators can monitor booking trends and use the information to make better decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;
