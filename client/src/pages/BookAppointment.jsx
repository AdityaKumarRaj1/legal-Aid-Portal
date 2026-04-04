import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const BookAppointment = () => {
  const { lawyerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lawyer,     setLawyer]     = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');

  const [form, setForm] = useState({
    category: '', subject: '', description: '',
    appointmentDate: '', appointmentTime: '', priority: 'MEDIUM',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      api.get(`/lawyers/${lawyerId}`),
      api.get('/categories'),
    ])
      .then(([lr, cr]) => { setLawyer(lr.data.lawyer); setCategories(cr.data.categories || []); })
      .catch(() => navigate('/lawyers'))
      .finally(() => setLoading(false));
  }, [lawyerId]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/appointments', { ...form, lawyer: lawyerId });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center"><span className="spinner-lg" /></div>;
  if (success) return (
    <div className="page-container">
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h2>Appointment Booked!</h2>
        <p>Your appointment request has been sent to <strong>{lawyer?.user?.firstName} {lawyer?.user?.lastName}</strong>.</p>
        <p className="muted">You'll be notified once the lawyer confirms it.</p>
        <div className="flex-gap mt">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>My Appointments</button>
          <button className="btn-outline" onClick={() => navigate('/lawyers')}>Find More Lawyers</button>
        </div>
      </div>
    </div>
  );

  const l = lawyer;
  return (
    <div className="page-container narrow">
      <div className="page-header">
        <h1>📅 Book Appointment</h1>
      </div>

      {/* Lawyer mini-card */}
      {l && (
        <div className="glass-card lawyer-mini-card">
          <div className="lawyer-avatar sm">
            {l.user?.profilePicture
              ? <img src={l.user.profilePicture} alt="" />
              : <span>{l.user?.firstName?.[0]}{l.user?.lastName?.[0]}</span>
            }
          </div>
          <div>
            <h3>{l.user?.firstName} {l.user?.lastName}</h3>
            <p className="muted">📍 {l.user?.city} · 💰 ₹{l.consultationFee}/hr · {l.experienceYears} yrs exp</p>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card booking-form">
        <div className="form-group">
          <label>Legal Category</label>
          <select required value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Subject / Issue Title</label>
          <input required placeholder="Brief title of your legal issue" maxLength={300}
            value={form.subject} onChange={(e) => set('subject', e.target.value)} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea required rows={5} placeholder="Describe your legal situation in detail…"
            value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Preferred Date</label>
            <input required type="date" min={new Date().toISOString().split('T')[0]}
              value={form.appointmentDate} onChange={(e) => set('appointmentDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Preferred Time</label>
            <input required type="time" value={form.appointmentTime} onChange={(e) => set('appointmentTime', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <div className="priority-chips">
            {PRIORITIES.map((p) => (
              <button key={p} type="button"
                className={`priority-chip priority-${p.toLowerCase()} ${form.priority === p ? 'active' : ''}`}
                onClick={() => set('priority', p)}
              >{p}</button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary btn-full" disabled={submitting}>
          {submitting ? <span className="spinner" /> : '📅 Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
