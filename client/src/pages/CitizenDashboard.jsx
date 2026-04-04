import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLORS = {
  PENDING: 'status-pending', ACCEPTED: 'status-accepted',
  COMPLETED: 'status-completed', CANCELLED: 'status-cancelled',
  REJECTED: 'status-rejected', NO_SHOW: 'status-noshow',
};

const CitizenDashboard = () => {
  const [stats,    setStats]    = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [allAppts, setAllAppts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/citizen'),
      api.get('/appointments?limit=50'),
    ])
      .then(([dashRes, apptRes]) => {
        setStats(dashRes.data.stats);
        setUpcoming(dashRes.data.upcoming || []);
        setAllAppts(apptRes.data.appointments || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await api.delete(`/appointments/${id}`);
    setAllAppts((prev) => prev.map((a) => a._id === id ? { ...a, status: 'CANCELLED' } : a));
    if (stats) setStats((s) => ({ ...s, pending: s.pending - 1, cancelled: s.cancelled + 1 }));
  };

  if (loading) return <div className="loading-center"><span className="spinner-lg" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p>Track and manage your legal appointments</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Pending',   val: stats?.pending,   icon: '⏳', cls: 'stat-pending' },
          { label: 'Accepted',  val: stats?.accepted,  icon: '✅', cls: 'stat-accepted' },
          { label: 'Completed', val: stats?.completed, icon: '🏁', cls: 'stat-completed' },
          { label: 'Cancelled', val: stats?.cancelled, icon: '❌', cls: 'stat-cancelled' },
        ].map((s) => (
          <div key={s.label} className={`stat-mini-card ${s.cls}`}>
            <span className="stat-mini-icon">{s.icon}</span>
            <div>
              <h3>{s.val ?? 0}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Upcoming</button>
        <button className={tab === 'all'      ? 'active' : ''} onClick={() => setTab('all')}>All Appointments</button>
      </div>

      {tab === 'overview' && (
        <div>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <span>📅</span>
              <h3>No upcoming appointments</h3>
              <Link to="/lawyers" className="btn-primary mt-sm">Find a Lawyer</Link>
            </div>
          ) : (
            <div className="appt-list">
              {upcoming.map((a) => <AppointmentCard key={a._id} appt={a} onCancel={handleCancel} />)}
            </div>
          )}
          <div className="mt">
            <Link to="/lawyers" className="btn-primary">+ Book New Appointment</Link>
          </div>
        </div>
      )}

      {tab === 'all' && (
        <div className="appt-list">
          {allAppts.length === 0
            ? <div className="empty-state"><span>📋</span><h3>No appointments yet</h3></div>
            : allAppts.map((a) => <AppointmentCard key={a._id} appt={a} onCancel={handleCancel} />)
          }
        </div>
      )}
    </div>
  );
};

const AppointmentCard = ({ appt, onCancel }) => {
  const STATUS_COLORS = {
    PENDING:'status-pending', ACCEPTED:'status-accepted', COMPLETED:'status-completed',
    CANCELLED:'status-cancelled', REJECTED:'status-rejected', NO_SHOW:'status-noshow',
  };
  const l = appt.lawyer?.user;
  return (
    <div className="appt-card glass-card">
      <div className="appt-card-top">
        <div>
          <h3>{appt.subject}</h3>
          <p className="muted">
            with {l?.firstName} {l?.lastName} · {appt.category?.name}
          </p>
        </div>
        <span className={`status-badge ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
      </div>
      <div className="appt-meta">
        <span>📅 {new Date(appt.appointmentDate).toLocaleDateString('en-IN')}</span>
        <span>🕐 {appt.appointmentTime}</span>
        <span className={`priority-tag priority-${appt.priority?.toLowerCase()}`}>{appt.priority}</span>
      </div>
      {appt.status === 'PENDING' && (
        <div className="appt-actions">
          <button className="btn-danger btn-sm" onClick={() => onCancel(appt._id)}>Cancel</button>
        </div>
      )}
      {appt.lawyerNotes && (
        <p className="lawyer-notes"><strong>Lawyer's Note:</strong> {appt.lawyerNotes}</p>
      )}
    </div>
  );
};

export default CitizenDashboard;
