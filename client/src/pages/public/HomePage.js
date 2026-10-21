import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '◷', title: 'Book on your time', text: 'Find an appointment that fits your day, with clear availability and a simple booking flow.' },
  { icon: '♡', title: 'People you can trust', text: 'Explore service providers and choose the right professional for what you need.' },
  { icon: '✓', title: 'Everything in one place', text: 'Keep track of upcoming visits and manage your bookings from one secure account.' },
];

function HomePage() {
  return (
    <main className="container py-4 py-lg-5">
      <section className="hero-section p-4 p-lg-5 mb-5 text-white">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <div className="hero-copy py-lg-3">
              <div className="eyebrow mb-3">A little more time for what matters</div>
              <h1 className="fw-bold mb-3">Appointments, made easy.</h1>
              <p className="lead mb-4">Find the right provider, choose a time that works, and keep your day moving.</p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/register" className="btn btn-lg btn-primary">Book an appointment <span aria-hidden="true">→</span></Link>
                <Link to="/services" className="btn btn-lg btn-outline-light">Explore services</Link>
              </div>
              <div className="d-flex align-items-center gap-2 mt-4 small text-white-50">
                <span aria-hidden="true" className="text-warning">✦ ✦ ✦ ✦ ✦</span> Simple scheduling for everyone
              </div>
            </div>
          </div>
          <div className="col-lg-5 d-none d-sm-flex">
            <div className="hero-visual w-100" aria-hidden="true">
              <div className="hero-orbit"><div className="hero-calendar">
                <div className="cal-top">Your schedule</div>
                <strong>Today</strong>
                <div className="cal-slots"><span className="cal-slot"/><span className="cal-slot"/><span className="cal-slot"/></div>
              </div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-4 pb-lg-5">
        <div className="row align-items-end mb-4">
          <div className="col-lg-7">
            <div className="section-kicker mb-2">A smoother way to plan</div>
            <h2 className="fw-bold mb-2">Your next appointment starts here.</h2>
            <p className="mb-0">Less back and forth. More time for the things you care about.</p>
          </div>
        </div>
        <div className="row g-3 g-lg-4">
          {features.map((feature) => (
            <div className="col-md-4" key={feature.title}>
              <article className="feature-card h-100">
                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            </div>
          ))}
        </div>
      </section>
      <div className="footer mt-4">A simpler way to make time for what matters.</div>
    </main>
  );
}

export default HomePage;
