import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'ADMIN')   return { to: '/admin',   label: 'Admin Panel' };
    if (user.role === 'LAWYER')  return { to: '/lawyer',  label: 'Dashboard' };
    return { to: '/dashboard', label: 'Dashboard' };
  };

  const dash = getDashboardLink();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">⚖️</span>
          <span className="logo-text">LegalAid</span>
          <span className="logo-badge">Portal</span>
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/lawyers" onClick={() => setMenuOpen(false)}>Find Lawyers</NavLink></li>

          {user ? (
            <>
              {dash && (
                <li>
                  <NavLink to={dash.to} onClick={() => setMenuOpen(false)}>{dash.label}</NavLink>
                </li>
              )}
              <li>
                <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
              </li>
              <li>
                <button className="nav-btn-outline" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink></li>
              <li>
                <NavLink to="/register" className="nav-btn-primary" onClick={() => setMenuOpen(false)}>
                  Get Started
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
