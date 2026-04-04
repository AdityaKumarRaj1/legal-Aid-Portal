import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="logo-icon">⚖️</span>
          <span>LegalAid Portal</span>
          <p>Connecting citizens with verified legal professionals across India.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/lawyers">Find Lawyers</Link>
            {!user && <Link to="/register">Register</Link>}
            {!user && <Link to="/login">Login</Link>}
            {user && <Link to="/dashboard">My Dashboard</Link>}
          </div>
          <div>
            <h4>For Lawyers</h4>
            {user?.role === 'LAWYER' ? (
              <Link to="/lawyer">Lawyer Dashboard</Link>
            ) : (
              <>
                <Link to="/register">Join as Lawyer</Link>
                <Link to="/login">Lawyer Login</Link>
              </>
            )}
          </div>
          <div>
            <h4>Contact</h4>
            <p>support@legalaid.in</p>
            <p>+91 98765 43210</p>
            <p>Mon – Sat: 9am – 6pm</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LegalAid Portal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
