import { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [stats,    setStats]    = useState(null);
  const [recent,   setRecent]   = useState([]);
  const [pending,  setPending]  = useState([]);
  const [users,    setUsers]    = useState([]);
  const [cats,     setCats]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('overview');
  const [newCat,   setNewCat]   = useState({ name: '', description: '', icon: 'bi-briefcase' });
  const [catMsg,   setCatMsg]   = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/pending-lawyers'),
      api.get('/dashboard/all-users'),
      api.get('/categories'),
    ])
      .then(([s, p, u, c]) => {
        setStats(s.data.stats);
        setRecent(s.data.recentAppointments || []);
        setPending(p.data.lawyers || []);
        setUsers(u.data.users || []);
        setCats(c.data.categories || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const verifyLawyer = async (id, status) => {
    await api.put(`/lawyers/${id}/verify`, { verificationStatus: status });
    setPending((prev) => prev.filter((l) => l._id !== id));
    setStats((s) => ({ ...s, pendingVerifications: s.pendingVerifications - 1 }));
  };

  const addCategory = async (e) => {
    e.preventDefault();
    setCatMsg('');
    try {
      const { data } = await api.post('/categories', newCat);
      setCats((prev) => [...prev, data.category]);
      setNewCat({ name: '', description: '', icon: 'bi-briefcase' });
      setCatMsg('✅ Category added!');
    } catch (err) {
      setCatMsg(`❌ ${err.response?.data?.message || 'Failed'}`);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    setCats((prev) => prev.filter((c) => c._id !== id));
  };

  if (loading) return <div className="loading-center"><span className="spinner-lg" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage the entire LegalAid portal</p>
      </div>

      {/* Stats */}
      <div className="stats-row wrap">
        {[
          { label: 'Citizens',      val: stats?.totalUsers,           icon: '👤' },
          { label: 'Lawyers',       val: stats?.totalLawyers,         icon: '⚖️' },
          { label: 'Appointments',  val: stats?.totalAppointments,    icon: '📅' },
          { label: 'Categories',    val: stats?.totalCategories,      icon: '📂' },
          { label: 'Pending Verify',val: stats?.pendingVerifications, icon: '⏳' },
          { label: 'Completed',     val: stats?.completedAppointments,icon: '🏁' },
        ].map((s) => (
          <div key={s.label} className="stat-mini-card">
            <span className="stat-mini-icon">{s.icon}</span>
            <div><h3>{s.val ?? 0}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="tab-bar">
        {['overview','verify','users','categories'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t === 'overview' ? '📊 Overview' : t === 'verify' ? `⏳ Verify (${pending.length})` :
             t === 'users' ? '👥 Users' : '📂 Categories'}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <h2 className="section-title">Recent Appointments</h2>
          <div className="appt-list">
            {recent.map((a) => (
              <div key={a._id} className="appt-card glass-card">
                <div className="appt-card-top">
                  <div>
                    <h3>{a.subject}</h3>
                    <p className="muted">{a.citizen?.firstName} {a.citizen?.lastName} →{' '}
                      {a.lawyer?.user?.firstName} {a.lawyer?.user?.lastName}</p>
                  </div>
                  <span className={`status-badge status-${a.status?.toLowerCase()}`}>{a.status}</span>
                </div>
                <div className="appt-meta">
                  <span>📅 {new Date(a.appointmentDate).toLocaleDateString('en-IN')}</span>
                  <span>🕐 {a.appointmentTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lawyer Verification */}
      {tab === 'verify' && (
        <div>
          {pending.length === 0 ? (
            <div className="empty-state"><span>✅</span><h3>No pending verifications</h3></div>
          ) : pending.map((l) => (
            <div key={l._id} className="glass-card appt-card">
              <div className="appt-card-top">
                <div>
                  <h3>{l.user?.firstName} {l.user?.lastName}</h3>
                  <p className="muted">{l.user?.email} · {l.user?.city}, {l.user?.state}</p>
                  <p className="muted">Bar Council ID: <strong>{l.barCouncilId}</strong></p>
                  {l.verificationDocument && (
                    <a href={l.verificationDocument} target="_blank" rel="noreferrer" className="doc-link">
                      📄 View Document
                    </a>
                  )}
                </div>
                <div className="flex-gap">
                  <button className="btn-success btn-sm" onClick={() => verifyLawyer(l._id, 'VERIFIED')}>✅ Verify</button>
                  <button className="btn-danger btn-sm"  onClick={() => verifyLawyer(l._id, 'REJECTED')}>❌ Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>City</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                  <td>{u.city || '—'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories */}
      {tab === 'categories' && (
        <div className="admin-categories">
          {/* Add form */}
          <div className="glass-card">
            <h3>Add New Category</h3>
            {catMsg && <div className={`alert ${catMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{catMsg}</div>}
            <form onSubmit={addCategory} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Category Name</label>
                  <input required placeholder="e.g. Criminal Law" value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Icon (Bootstrap)</label>
                  <input placeholder="bi-briefcase" value={newCat.icon}
                    onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input placeholder="Short description…" value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">+ Add Category</button>
            </form>
          </div>

          {/* Existing */}
          <div className="categories-admin-grid">
            {cats.map((c) => (
              <div key={c._id} className="cat-admin-card glass-card">
                <div>
                  <h4>{c.name}</h4>
                  <p className="muted">{c.description || 'No description'}</p>
                  <span className={`status-badge ${c.isActive ? 'status-accepted' : 'status-cancelled'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button className="btn-danger btn-sm" onClick={() => deleteCategory(c._id)}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
