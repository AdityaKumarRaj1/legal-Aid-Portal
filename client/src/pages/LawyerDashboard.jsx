import { useEffect, useState } from 'react';
import api from '../api/axios';

const LawyerDashboard = () => {
  const [data,    setData]    = useState(null);
  const [appts,   setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview');
  const [filter,  setFilter]  = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/lawyer'),
      api.get('/appointments?limit=100'),
    ])
      .then(([dash, apptRes]) => {
        setData(dash.data);
        setAppts(apptRes.data.appointments || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, notes = '') => {
    try {
      await api.put(`/appointments/${id}/status`, { status, lawyerNotes: notes });
      setAppts((prev) => prev.map((a) => a._id === id ? { ...a, status } : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="loading-center"><span className="spinner-lg" /></div>;

  const { stats, upcoming, profile } = data || {};
  const filtered = filter ? appts.filter((a) => a.status === filter) : appts;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Lawyer Dashboard</h1>
        <p>Manage your appointments and profile</p>
      </div>

      {/* Verification warning */}
      {profile?.verificationStatus === 'PENDING' && (
        <div className="alert alert-warning">
          ⏳ Your profile is <strong>pending verification</strong>. The admin will review your documents soon.
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Pending',   val: stats?.pending,   icon: '⏳', cls: 'stat-pending' },
          { label: 'Accepted',  val: stats?.accepted,  icon: '✅', cls: 'stat-accepted' },
          { label: 'Completed', val: stats?.completed, icon: '🏁', cls: 'stat-completed' },
          { label: 'Rejected',  val: stats?.rejected,  icon: '❌', cls: 'stat-rejected' },
        ].map((s) => (
          <div key={s.label} className={`stat-mini-card ${s.cls}`}>
            <span className="stat-mini-icon">{s.icon}</span>
            <div><h3>{s.val ?? 0}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Upcoming</button>
        <button className={tab === 'all'      ? 'active' : ''} onClick={() => setTab('all')}>All Requests</button>
      </div>

      {tab === 'overview' && (
        <div className="appt-list">
          {(upcoming || []).length === 0
            ? <div className="empty-state"><span>📅</span><h3>No upcoming appointments</h3></div>
            : (upcoming || []).map((a) => (
                <LawyerApptCard key={a._id} appt={a} onUpdate={updateStatus} />
              ))
          }
        </div>
      )}

      {tab === 'all' && (
        <>
          <div className="filter-row">
            {['', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'].map((s) => (
              <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="appt-list">
            {filtered.length === 0
              ? <div className="empty-state"><span>📋</span><h3>No appointments</h3></div>
              : filtered.map((a) => <LawyerApptCard key={a._id} appt={a} onUpdate={updateStatus} />)
            }
          </div>
        </>
      )}
    </div>
  );
};

const LawyerApptCard = ({ appt, onUpdate }) => {
  const STATUS_COLORS = {
    PENDING:'status-pending', ACCEPTED:'status-accepted', COMPLETED:'status-completed',
    CANCELLED:'status-cancelled', REJECTED:'status-rejected', NO_SHOW:'status-noshow',
  };
  const [notes, setNotes]   = useState(appt.lawyerNotes || '');
  const [open,  setOpen]    = useState(false);

  return (
    <div className="appt-card glass-card">
      <div className="appt-card-top">
        <div>
          <h3>{appt.subject}</h3>
          <p className="muted">
            {appt.citizen?.firstName} {appt.citizen?.lastName} · {appt.citizen?.email}
          </p>
          <p className="muted">Category: {appt.category?.name}</p>
        </div>
        <span className={`status-badge ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
      </div>
      <div className="appt-meta">
        <span>📅 {new Date(appt.appointmentDate).toLocaleDateString('en-IN')}</span>
        <span>🕐 {appt.appointmentTime}</span>
        <span className={`priority-tag priority-${appt.priority?.toLowerCase()}`}>{appt.priority}</span>
      </div>

      {open && (
        <div className="appt-detail">
          <p><strong>Description:</strong> {appt.description}</p>
          <p><strong>Phone:</strong> {appt.citizen?.phone || 'N/A'}</p>
          <div className="form-group">
            <label>Notes to Citizen</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for the citizen…" />
          </div>
        </div>
      )}

      <div className="appt-actions flex-gap">
        <button className="btn-outline btn-sm" onClick={() => setOpen(!open)}>
          {open ? 'Hide Details' : 'View Details'}
        </button>
        {appt.status === 'PENDING' && (
          <>
            <button className="btn-success btn-sm" onClick={() => onUpdate(appt._id, 'ACCEPTED', notes)}>Accept</button>
            <button className="btn-danger btn-sm"  onClick={() => onUpdate(appt._id, 'REJECTED', notes)}>Reject</button>
          </>
        )}
        {appt.status === 'ACCEPTED' && (
          <>
            <button className="btn-success btn-sm" onClick={() => onUpdate(appt._id, 'COMPLETED', notes)}>Mark Complete</button>
            <button className="btn-warn btn-sm"    onClick={() => onUpdate(appt._id, 'NO_SHOW', notes)}>No Show</button>
          </>
        )}
      </div>
    </div>
  );
};

export default LawyerDashboard;
