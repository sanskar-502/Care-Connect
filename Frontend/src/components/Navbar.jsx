import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar({ alertCount = 3 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="top-nav">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img src="/assets/logo.png" alt="CareConnect Logo" className="img-logo" />
          <span className="logo-text">CareConnect</span>
        </Link>

        {/* Center links */}
        <div className="nav-links">
          <button
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Command Center
          </button>
          <button
            className={`nav-link ${isActive('/alerts') ? 'active' : ''}`}
            onClick={() => navigate('/alerts')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Alerts
            {alertCount > 0 && <span className="nav-badge">{alertCount}</span>}
          </button>
          <button
            className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
            onClick={() => navigate('/analytics')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Analytics
          </button>
        </div>

        {/* Right side */}
        <div className="nav-right">
          {/* Search */}
          <div className={`nav-search ${searchOpen ? 'open' : ''}`}>
            <button className="search-toggle btn-icon btn-ghost" onClick={() => setSearchOpen(!searchOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            {searchOpen && (
              <input
                className="search-input"
                type="text"
                placeholder="Search patients..."
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            )}
          </div>

          {/* Profile */}
          <div className="nav-profile" onClick={() => navigate('/login')}>
            <div className="profile-avatar">AS</div>
            <div className="profile-info">
              <span className="profile-name">Dr. A. Smith</span>
              <span className="profile-role">Cardiology</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
