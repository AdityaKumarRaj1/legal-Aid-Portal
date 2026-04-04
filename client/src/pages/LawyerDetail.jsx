import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LawyerDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lawyer,  setLawyer]  = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/lawyers/${id}`),
      api.get(`/reviews/lawyer/${id}`),
    ])
      .then(([lawyerRes, reviewsRes]) => {
        setLawyer(lawyerRes.data.lawyer);
        setReviews(reviewsRes.data.reviews || []);
      })
      .catch(() => navigate('/lawyers'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><span className="spinner-lg" /></div>;
  if (!lawyer)  return <div className="empty-state"><p>Lawyer not found</p></div>;

  const { user: u } = lawyer;
  const DAYS = { MON:'Mon',TUE:'Tue',WED:'Wed',THU:'Thu',FRI:'Fri',SAT:'Sat',SUN:'Sun' };

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div className="lawyer-profile-header glass-card">
        <div className="lawyer-profile-avatar">
          {u?.profilePicture
            ? <img src={u.profilePicture} alt={u.firstName} />
            : <span className="avatar-initials">{u?.firstName?.[0]}{u?.lastName?.[0]}</span>
          }
        </div>
        <div className="lawyer-profile-info">
          <div className="profile-name-row">
            <h1>{u?.firstName} {u?.lastName}</h1>
            <span className="verified-badge">✅ Verified</span>
          </div>
          <p className="profile-location">📍 {u?.city}, {u?.state}</p>
          <div className="profile-stars">
            {'★'.repeat(Math.round(lawyer.rating || 0))}{'☆'.repeat(5 - Math.round(lawyer.rating || 0))}
            <span className="rating-val">{(lawyer.rating || 0).toFixed(1)} ({reviews.length} reviews)</span>
          </div>
          <div className="profile-specs">
            {lawyer.specializations?.map((s) => (
              <span key={s._id} className="spec-tag">{s.name}</span>
            ))}
          </div>
          <div className="profile-meta-row">
            <span>🏛️ {lawyer.experienceYears || 0} years experience</span>
            <span>📚 {lawyer.qualification || 'LLB'}</span>
            <span>💰 ₹{lawyer.consultationFee || 0}/hr</span>
            <span>📋 {lawyer.totalCases || 0} cases</span>
          </div>
        </div>
        <div className="profile-actions">
          {user?.role === 'CITIZEN' && (
            <Link to={`/book/${id}`} className="btn-primary">📅 Book Appointment</Link>
          )}
          {!user && (
            <Link to="/login" className="btn-primary">Login to Book</Link>
          )}
        </div>
      </div>

      {/* About */}
      {lawyer.bio && (
        <div className="glass-card mt">
          <h2>About</h2>
          <p className="bio-text">{lawyer.bio}</p>
        </div>
      )}

      {/* Availability */}
      {lawyer.availability?.length > 0 && (
        <div className="glass-card mt">
          <h2>Availability</h2>
          <div className="availability-chips">
            {lawyer.availability.filter(a => a.isActive).map((a, i) => (
              <div key={i} className="avail-chip">
                <strong>{DAYS[a.day]}</strong>
                <span>{a.startTime} – {a.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="glass-card mt">
        <h2>Client Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="muted">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r._id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-avatar">
                    {r.citizen?.profilePicture
                      ? <img src={r.citizen.profilePicture} alt="" />
                      : <span>{r.citizen?.firstName?.[0]}</span>
                    }
                  </div>
                  <div>
                    <strong>{r.citizen?.firstName} {r.citizen?.lastName}</strong>
                    <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerDetail;
