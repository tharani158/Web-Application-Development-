import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="brand-mark" aria-hidden="true">◷</span>
          <span>Goodtime<span className="text-success">.</span></span>
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/services">
                Services
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">
                Contact
              </NavLink>
            </li>
            {user && user.role === 'customer' && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/providers">
                    Providers
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/book">
                    Book
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/history">
                    My Appointments
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin-dashboard">
                        Admin Dashboard
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin/providers">
                        Manage Providers
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin/users">
                        Manage Users
                      </NavLink>
                    </li>
                  </>
                )}
                {user.role === 'provider' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/provider-dashboard">
                      Provider Dashboard
                    </NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">
                    Profile
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="btn btn-primary btn-sm text-white" to="/register">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
