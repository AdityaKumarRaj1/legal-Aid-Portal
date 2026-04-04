import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', address: '',
    city: '', state: '', pincode: '', dateOfBirth: '',
  });
  const [loading,    setLoading]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');
  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [categories,    setCategories]    = useState([]);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName:   user.firstName   || '',
      lastName:    user.lastName    || '',
      phone:       user.phone       || '',
      address:     user.address     || '',
      city:        user.city        || '',
      state:       user.state       || '',
      pincode:     user.pincode     || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    });

    if (user.role === 'LAWYER') {
      api.get('/lawyers/me/profile').then(({ data }) => setLawyerProfile(data.profile)).catch(() => {});
      api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
    }
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(''); setError('');
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const uploadPicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('picture', file);
      const { data } = await api.post('/upload/profile-picture', fd);
      updateUser({ ...user, profilePicture: data.url });
      setSuccess('Profile picture updated!');
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container narrow">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      {/* Avatar */}
      <div className="glass-card profile-avatar-section">
        <div className="profile-avatar-big">
          {user?.profilePicture
            ? <img src={user.profilePicture} alt="Profile" />
            : <span className="avatar-initials xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          }
          <label className="avatar-upload-btn" htmlFor="avatar-input">
            {uploading ? <span className="spinner" /> : '📷 Change Photo'}
          </label>
          <input id="avatar-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPicture} />
        </div>
        <div>
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p className="muted">{user?.email}</p>
          <span className={`role-badge role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Edit form */}
      <form onSubmit={saveProfile} className="glass-card auth-form">
        <h3>Personal Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input placeholder="+91 9876543210" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <input placeholder="Street address" value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label>State</label>
            <input value={form.state} onChange={(e) => set('state', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Pincode</label>
            <input value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
