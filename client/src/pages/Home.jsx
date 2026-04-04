import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORY_ICONS = {
  'Criminal Law': '🔒', 'Family Law': '👨‍👩‍👧', 'Corporate Law': '🏢',
  'Property Law': '🏠', 'Labor Law': '👷', 'Tax Law': '💰',
  'Civil Law': '⚖️', 'Immigration': '✈️', 'Intellectual Property': '💡',
  'Consumer Law': '🛒', 'Environmental Law': '🌿', 'Human Rights': '✊',
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/lawyers?search=${encodeURIComponent(search)}`);
  };

  const stats = [
    { value: '500+', label: 'Verified Lawyers' },
    { value: '10k+', label: 'Cases Handled' },
    { value: '25+',  label: 'Legal Categories' },
    { value: '4.8★', label: 'Average Rating' },
  ];

  const features = [
    { icon: '🔍', title: 'Find Experts',     desc: 'Search verified lawyers by specialization, location, and ratings.' },
    { icon: '📅', title: 'Easy Booking',     desc: 'Schedule appointments online — no phone calls needed.' },
    { icon: '🔐', title: 'Secure & Private', desc: 'Your case details are protected and confidential at all times.' },
    { icon: '⚡', title: 'Fast Response',    desc: 'Get connected with a lawyer within hours, not days.' },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">🇮🇳 India's Trusted Legal Platform</div>
          <h1 className="hero-title">
            Justice is a <span className="gradient-text">Right</span>,<br />
            Not a Privilege.
          </h1>
          <p className="hero-subtitle">
            Connect with verified, experienced lawyers across India. Book appointments online,
            get expert legal guidance and protect your rights.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by lawyer name, city or specialization…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">🔍 Search</button>
          </form>
          <div className="hero-actions">
            <Link to="/lawyers" className="btn-primary">Browse All Lawyers</Link>
            <Link to="/register" className="btn-outline">Register Free →</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card floating">
            <div className="hcard-icon">⚖️</div>
            <div>
              <p className="hcard-title">Legal Consultation</p>
              <p className="hcard-sub">Available Today</p>
            </div>
          </div>
          <div className="hero-card floating delay-1">
            <div className="hcard-icon">✅</div>
            <div>
              <p className="hcard-title">Verified Lawyers</p>
              <p className="hcard-sub">Bar Council Certified</p>
            </div>
          </div>
          <div className="hero-card floating delay-2">
            <div className="hcard-icon">🔒</div>
            <div>
              <p className="hcard-title">100% Confidential</p>
              <p className="hcard-sub">Privacy Guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="section-header">
          <h2>Legal Practice Areas</h2>
          <p>Find the right legal expertise for your situation</p>
        </div>
        <div className="categories-grid">
          {categories.length > 0
            ? categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/lawyers?category=${cat._id}`}
                  className="category-card"
                >
                  <span className="cat-icon">{CATEGORY_ICONS[cat.name] || '⚖️'}</span>
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-arrow">→</span>
                </Link>
              ))
            : Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="category-card skeleton" />
              ))}
        </div>
        <div className="section-footer">
          <Link to="/lawyers" className="btn-outline">View All Practice Areas →</Link>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="section-header">
          <h2>Why Choose LegalAid?</h2>
          <p>We make legal help accessible, affordable, and transparent</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2>Ready to Get Legal Help?</h2>
        <p>Join thousands of citizens who found justice through LegalAid Portal</p>
        <div className="cta-actions">
          <Link to="/register" className="btn-primary">Get Started — It's Free</Link>
          <Link to="/lawyers" className="btn-outline">Browse Lawyers</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
