import React from 'react';

function ContactPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm p-4">
            <h2>Contact Us</h2>
            <h3>We're Here to Help</h3>
            <p>Have a question, need assistance with your appointment, or want to learn more about our services? Get in touch with our support team. We are happy to help customers, service providers, and administrators with any questions or concerns.</p>
            <ul className="list-unstyled">
              <li><strong>📧Email:</strong> stharaniyan123@gmail.com</li>
              <li><strong>📞Phone:</strong> +94761234567</li>
              <li><strong>🏢Address:</strong> Hapugalla, Galle, Sri Lanka</li>
              <li><strong>⏰Support Hours:</strong> Monday to Friday, 9:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
