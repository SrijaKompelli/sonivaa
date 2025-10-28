import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const ActionMenu = ({ track, onAddFavorite, onAddDiary, onAddToPlaylist }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="action-menu" ref={menuRef}>
      <button className="three-dots" onClick={() => setIsOpen(!isOpen)}>⋯</button>
      {isOpen && (
        <div className="menu-dropdown">
          <button onClick={() => { onAddFavorite(track); setIsOpen(false); }}>❤ Add to Favorites</button>
          <button onClick={() => { onAddDiary(track); setIsOpen(false); }}>📝 Add Diary Note</button>
          <button onClick={() => { onAddToPlaylist(track); setIsOpen(false); }}>➕ Add to Playlist</button>
        </div>
      )}
    </div>
  );
};

export default function Search() {
  const [q, setQ] = useState('');
  const [tracks, setTracks] = useState([]);
  const [moodFilterState, setMoodFilterState] = useState('');
  const [loading, setLoading] = useState(true);
  const [allTracks, setAllTracks] = useState([]);
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const { data } = await api.get('/tracks');
      // Normalize moods: some responses use `mood` (singular) while saved tracks use `moods` array
      const normalized = (data || []).map(t => ({
        ...t,
        moods: Array.isArray(t.moods) ? t.moods : (Array.isArray(t.mood) ? t.mood : (t.mood ? [t.mood] : []))
      }));
      setTracks(normalized);
      setAllTracks(normalized);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setLoading(false);
    }
  };

  // When a mood filter is selected, fetch saved tracks from server that match the mood
  useEffect(() => {
    const fetchByMood = async () => {
      if (!moodFilterState) {
        // restore previously loaded tracks
        setTracks(allTracks);
        return;
      }
      try {
        const { data } = await api.get('/tracks', { params: { mood: moodFilterState } });
        const normalized = (data || []).map(t => ({
          ...t,
          moods: Array.isArray(t.moods) ? t.moods : (Array.isArray(t.mood) ? t.mood : (t.mood ? [t.mood] : [])),
          hasPreview: !!t.url
        }));
        setTracks(normalized);
      } catch (err) {
        console.error('Failed to fetch tracks by mood:', err);
      }
    };
    fetchByMood();
  }, [moodFilterState]);

  const search = async (e) => {
    e?.preventDefault();
    try {
      const { data } = await api.get('/tracks/search', { params: { q } });
      setTracks(data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const save = async (track) => {
    try {
      await api.post('/tracks', track);
      alert('Added to your library!');
    } catch (err) {
      alert('Failed to add to library');
    }
  };

  const addFavorite = async (track) => {
    try {
      const payload = track._id ? { trackId: track._id } : { url: track.url, title: track.title, artist: track.artist, genre: track.genre, coverImage: track.coverImage };
      await api.post('/users/favorites', payload);
      alert('Added to favorites');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  const addDiary = async (track) => {
    try {
      const mood = prompt('Enter mood (happy, sad, romantic, energetic, peaceful, nostalgic, party):');
      if (!mood) return;
      const notes = prompt('Optional notes:');
      let trackId = track._id || track.id;
      if (!trackId) {
        // ensure track exists in DB by adding to favorites (creates the track) and get id
        const favResp = await api.post('/users/favorites', { url: track.url, title: track.title, artist: track.artist, genre: track.genre, coverImage: track.coverImage });
        trackId = favResp.data.trackId;
      }
      const response = await api.post('/diary', { track: trackId, mood, text: notes });
      alert('Diary entry added');
    } catch (err) {
      console.error('Diary error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add diary entry';
      alert(errorMessage);
    }
  };

  const addToPlaylist = async (track) => {
    try {
      const { data: lists } = await api.get('/playlists/me');
      if (!lists || lists.length === 0) {
        if (!confirm('No playlists found. Create one now?')) return;
        const title = prompt('Playlist title:');
        if (!title) return;
        const created = await api.post('/playlists', { title, description: '', moodTags: [] });
        lists.push(created.data || created);
      }
      const listNames = lists.map((l, i) => `${i+1}. ${l.title}`).join('\n');
      const choice = prompt('Choose playlist number:\n' + listNames);
      const idx = parseInt(choice || '', 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= lists.length) return alert('Invalid choice');
      const playlist = lists[idx];
      // append track id (ensure track exists in DB)
      let trackId = track._id || track.id;
      if (!trackId) {
        const favResp = await api.post('/users/favorites', { url: track.url, title: track.title, artist: track.artist, genre: track.genre, coverImage: track.coverImage });
        trackId = favResp.data.trackId;
      }
      const updatedTracks = Array.isArray(playlist.tracks) ? [...playlist.tracks.map(t=>t._id || t), trackId] : [trackId];
      await api.put(`/playlists/${playlist._id}`, { tracks: updatedTracks });
      alert('Track added to playlist');
    } catch (err) {
      console.error(err);
      alert('Failed to add to playlist');
    }
  };

  const togglePlay = async (track) => {
    if (playingTrack === track.url) {
      audioRef.current.pause();
      setPlayingTrack(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Only play tracks that have previews
      if (track.hasPreview) {
        console.log('Setting audio src to preview URL:', track.url);
        audioRef.current.src = track.url;
        try {
          await audioRef.current.play();
          setPlayingTrack(track.url);
        } catch (err) {
          console.error('Playback failed:', err);
          alert('Unable to play this track. Preview may not be available.');
        }
      } else {
        // Don't play tracks without previews - just show message
        alert('This track preview is not available for playback.');
      }
    }
  };

  const filteredTracks = tracks
    .map(t => ({ ...t, moods: Array.isArray(t.moods) ? t.moods : (t.mood ? [t.mood] : []) }))
    .filter(track => {
      // base: only show tracks with preview when no text query and no mood filter
      if (!q && !moodFilterState && !track.hasPreview) return false;
      // text query filters title/artist/genre
      if (q) {
        const ql = q.toLowerCase();
        if (
          track.title.toLowerCase().includes(ql) ||
          track.artist.toLowerCase().includes(ql) ||
          (track.genre || '').toLowerCase().includes(ql)
        ) return true;
        // if mood filter is set as text query fallback, still allow mood matching
      }
      // mood filter (explicit tag click)
      if (moodFilterState) {
        const mf = moodFilterState.toLowerCase();
        if (Array.isArray(track.moods) && track.moods.map(m=>m.toLowerCase()).includes(mf)) return true;
        // also check singular `mood` prop if present
        if (track.mood && (Array.isArray(track.mood) ? track.mood.map(m=>m.toLowerCase()).includes(mf) : String(track.mood).toLowerCase() === mf)) return true;
        return false;
      }
      // if no filters, include track if has preview
      if (!q && !moodFilterState) return track.hasPreview;
      // otherwise include (fallback)
      return true;
    });

  if (loading) {
    return <div className="search-box">Loading...</div>;
  }

  const moodFilter = (m) => {
    // set explicit mood filter; clicking the same mood toggles it off
    if (!m) { setMoodFilterState(''); setQ(''); return; }
    if (moodFilterState && moodFilterState.toLowerCase() === m.toLowerCase()) {
      setMoodFilterState('');
      setQ('');
    } else {
      setMoodFilterState(m);
      setQ('');
    }
  };

  return (
    <div>
      <div className="search-box">
        <h2>Discover Music</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => moodFilter('happy')}>Happy</button>
          <button onClick={() => moodFilter('sad')}>Sad</button>
          <button onClick={() => moodFilter('study')}>Study</button>
          <button onClick={() => moodFilter('devotional')}>Devotional</button>
          <button onClick={() => moodFilter('love')}>Love</button>
        </div>
        <form onSubmit={search}>
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)}
            placeholder="Search by title, artist, or genre"
          />
        </form>
      </div>
      
      <div className="track-grid">
        {filteredTracks.map(track => (
          <div key={track.url} className="track-card">
            <div className="track-image-container">
              <img
                src={track.coverImage}
                alt={track.title}
                className="track-image"
              />
              {track.hasPreview && (
                <button className="play-button" onClick={() => togglePlay(track)}>
                  {playingTrack === track.url ? '⏸️' : '▶️'}
                </button>
              )}
            </div>
            <div className="track-info">
              <h3 className="track-title">{track.title}</h3>
              <p className="track-artist">{track.artist}</p>
              <p className="track-genre">{track.genre} • {track.duration}</p>
                {/* Mood tags */}
                <div style={{ marginTop: 8 }}>
                  {(track.moods || []).slice(0,5).map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => moodFilter(m)}
                      style={{
                        marginRight: 6,
                        marginBottom: 6,
                        padding: '4px 8px',
                        borderRadius: 12,
                        border: '1px solid rgba(0,0,0,0.12)',
                        background: (moodFilterState && moodFilterState.toLowerCase() === String(m).toLowerCase()) ? '#dfefff' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="track-actions">
                <ActionMenu
                  track={track}
                  onAddFavorite={addFavorite}
                  onAddDiary={addDiary}
                  onAddToPlaylist={addToPlaylist}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <audio ref={audioRef} onEnded={() => setPlayingTrack(null)} />
    </div>
  );
}