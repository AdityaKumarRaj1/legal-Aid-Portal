import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '',
    password: '', role: 'CITIZEN', phone: '', city: '', state: '',
    barCouncilId: '',
  });
  const [error, setError]   = useState('');
  const [showPw, setShowPw] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    const result = await register(form);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <span className="auth-logo">⚖️</span>
          <h1>Create Account</h1>
          <p>Join LegalAid Portal for free</p>
        </div>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={form.role === 'CITIZEN' ? 'active' : ''}
            onClick={() => set('role', 'CITIZEN')}
          >👤 Citizen</button>
          <button
            type="button"
            className={form.role === 'LAWYER' ? 'active' : ''}
            onClick={() => set('role', 'LAWYER')}
          >⚖️ Lawyer</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input required placeholder="Arjun" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input required placeholder="Sharma" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input required placeholder="arjun_sharma" value={form.username} onChange={(e) => set('username', e.target.value)} autoComplete="off" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input required type="email" placeholder="arjun@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input placeholder="+91 9876543210" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input placeholder="Mumbai" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>State</label>
            <select value={form.state} onChange={(e) => set('state', e.target.value)}>
              <option value="">Select State</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {form.role === 'LAWYER' && (
            <div className="form-group">
              <label>Bar Council ID</label>
              <input required placeholder="BCI/MH/2020/12345" value={form.barCouncilId} onChange={(e) => set('barCouncilId', e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <div className="input-eye">
              <input
                required
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : `Create ${form.role === 'LAWYER' ? 'Lawyer' : 'Citizen'} Account`}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
