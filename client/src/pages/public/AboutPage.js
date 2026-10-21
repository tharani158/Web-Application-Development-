import React from 'react';

function AboutPage() {
  return (
    <div className="container py-5">
      <div className="row align-items-center">
        <div className="col-md-6 mb-4">
          <h2>About the Booking System</h2>
          <p>Our application provides a modern and convenient online appointment management system designed for customers, service providers, and administrators. It brings different types of appointment-based services together in one platform, making it easy for customers to find services, search for providers, check availability, and book appointments online. The platform simplifies the entire appointment process while helping service providers manage their schedules and appointments efficiently.</p>
          <ul>
            <li>Secure Registration & Login – Secure account management for customers, providers, and administrators.</li>
            <li>Multiple Appointment Services – Book appointments for different types of services through one platform.</li>
            <li>Provider Search – Easily search and find suitable service providers based on available services.</li>
            <li>Easy Appointment Booking – Select a service, provider, date, and available time slot to make a booking.</li>
            <li>Schedule Management – Providers can manage their availability, working hours, and appointment schedules.</li>
            <li>Booking Management – Customers can view, reschedule, or cancel their appointments.</li>
            <li>Appointment Approval – Providers can approve or reject appointment requests.</li>
            <li>Analytics & Reports – Track appointments, booking trends, cancellations, and service performance.</li>
            <li>Responsive Design – Access the platform easily on desktops, tablets, and mobile devices.</li>
            <li>User-Friendly Interface – A simple and intuitive design that makes appointment management easy for everyone.</li>
          </ul>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h5>Key Features</h5>
            <p>Customers can easily book, reschedule, or cancel appointments online, while service providers can manage their schedules, approve or reject appointment requests, and control their availability. The system also allows users to explore different service categories, select preferred dates and time slots, receive appointment notifications, and view their booking history. Providers can use analytics and reports to monitor appointments, track cancellations, identify popular services, and improve their overall service management.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
