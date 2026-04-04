import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const LawyerList = () => {
  const [lawyers, setLawyers]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const search   = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const city     = searchParams.get('city') || '';

  const [localSearch, setLocalSearch]   = useState(search);
  const [localCity,   setLocalCity]     = useState(city);
  const [localCat,    setLocalCat]      = useState(category);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    if (search)   params.set('search', search);
    if (category) params.set('category', category);
    if (city)     params.set('city', city);
    api.get(`/lawyers?${params}`)
      .then(({ data }) => { setLawyers(data.lawyers || []); setTotal(data.total || 0); })
      .catch(() => setLawyers([]))
      .finally(() => setLoading(false));
  }, [search, category, city, page]);

  const applyFilter = (e) => {
    e.preventDefault();
    const p = {};
    if (localSearch) p.search   = localSearch;
    if (localCity)   p.city     = localCity;
    if (localCat)    p.category = localCat;
    setSearchParams(p);
    setPage(1);
  };

  const clearFilters = () => {
    setLocalSearch(''); setLocalCity(''); setLocalCat('');
    setSearchParams({});
    setPage(1);
  };

  const StarRating = ({ rating }) => (
    <span className="stars">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="rating-val">{rating.toFixed(1)}</span>
    </span>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Find a Lawyer</h1>
        <p>{search || category || city ? `Showing ${total} result${total !== 1 ? 's' : ''} for your search` : `Browse ${total} verified legal professionals`}</p>
      </div>

      <div className="lawyers-layout">
        {/* Sidebar filters */}
        <aside className="filter-sidebar">
          <h3>🔽 Filters</h3>
          <form onSubmit={applyFilter}>
            <div className="form-group">
              <label>Search</label>
              <input placeholder="Name, specialization…" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input placeholder="Mumbai, Delhi…" value={localCity} onChange={(e) => setLocalCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Practice Area</label>
              <select value={localCat} onChange={(e) => setLocalCat(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary btn-full">Apply Filters</button>
            <button type="button" className="btn-outline btn-full mt-sm" onClick={clearFilters}>Clear</button>
          </form>
        </aside>

        {/* Lawyer cards */}
        <div className="lawyers-main">
          {loading ? (
            <div className="lawyers-grid">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="lawyer-card skeleton tall" />)}
            </div>
          ) : lawyers.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <h3>No lawyers found</h3>
              <p>Try adjusting your filters</p>
              <button className="btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="lawyers-grid">
                {lawyers.map((l) => (
                  <div className="lawyer-card" key={l._id}>
                    <div className="lawyer-card-top">
                      <div className="lawyer-avatar">
                        {l.user?.profilePicture
                          ? <img src={l.user.profilePicture} alt={l.user.firstName} />
                          : <span>{l.user?.firstName?.[0]}{l.user?.lastName?.[0]}</span>
                        }
                      </div>
                      <div className="lawyer-card-info">
                        <h3>{l.user?.firstName} {l.user?.lastName}</h3>
                        <p className="lawyer-city">📍 {l.user?.city || 'India'}</p>
                        <StarRating rating={l.rating || 0} />
                      </div>
                    </div>
                    <div className="lawyer-specs">
                      {l.specializations?.slice(0, 3).map((s) => (
                        <span key={s._id} className="spec-tag">{s.name}</span>
                      ))}
                    </div>
                    <div className="lawyer-card-meta">
                      <span>🏛️ {l.experienceYears || 0} yrs exp</span>
                      <span>💰 ₹{l.consultationFee || 0}/hr</span>
                    </div>
                    <div className="lawyer-card-footer">
                      <Link to={`/lawyers/${l._id}`} className="btn-primary btn-sm">View Profile</Link>
                      <Link to={`/book/${l._id}`} className="btn-outline btn-sm">Book Now</Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {total > 9 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span>Page {page}</span>
                  <button disabled={lawyers.length < 9} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerList;
