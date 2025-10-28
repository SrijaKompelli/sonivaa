import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Profile() {
  const [favorites, setFavorites] = useState([]);
  const [diary, setDiary] = useState([]);
  const [favMoodFilter, setFavMoodFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const f = await api.get('/users/favorites');
        setFavorites(f.data || []);
      } catch (err) { console.warn('fav load', err); }
      try {
        const d = await api.get('/diary/me');
        setDiary(d.data || []);
      } catch (err) { console.warn('diary load', err); }
    };
    load();
  }, []);

  return (
    <div>
      <div className="search-box">
        <h2>Your Profile</h2>
      </div>

      <section style={{ marginBottom: '2.8rem' }}>
        <div className="playlist-section">
          <div className="playlist-header">
            <h3>Favorites</h3>
          </div>
          <div className="track-grid">
            {(favMoodFilter ? favorites.filter(f => ((f.moods || f.mood || []).map(m=>String(m).toLowerCase()).includes(favMoodFilter.toLowerCase()))) : favorites).map(t => (
              <div key={t._id} className="track-card">
                <div className="track-image-container">
                  <img src={t.coverImage} alt="cover" className="track-image" />
                </div>
                <div className="track-info">
                  <h3 className="track-title">{t.title}</h3>
                  <p className="track-artist">{t.artist}</p>
                  <div style={{ marginTop: 8 }}>
                    {( (Array.isArray(t.moods) ? t.moods : (t.mood ? (Array.isArray(t.mood) ? t.mood : [t.mood]) : [])) || []).slice(0,5).map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFavMoodFilter(prev => prev && prev.toLowerCase() === String(m).toLowerCase() ? '' : m)}
                        style={{
                          marginRight: 6,
                          marginBottom: 6,
                          padding: '4px 8px',
                          borderRadius: 12,
                          border: '1px solid rgba(0,0,0,0.12)',
                          background: (favMoodFilter && favMoodFilter.toLowerCase() === String(m).toLowerCase()) ? '#dfefff' : 'white',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="playlist-section">
          <div className="playlist-header">
            <h3>Diary Entries</h3>
          </div>
          <div className="playlist-list">
            {diary.map(e => (
              <div key={e._id} className="playlist-item">
                <div>
                  <strong>{e.mood}</strong> — {new Date(e.createdAt).toLocaleString()}
                  <div>{e.text}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{e.track?.title || 'No track'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
