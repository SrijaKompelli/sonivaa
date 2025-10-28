import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Playlists({ user }) {
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/playlists/me');
      setLists(data);
    } catch (err) { console.warn(err); }
  };

  useEffect(()=>{ load(); }, []);

  const create = async () => {
    try {
      const { data } = await api.post('/playlists', { title, description: '', moodTags: [] });
      setLists(prev => [data, ...prev]);
      setTitle('');
    } catch (err) {
      console.error('Playlist create error:', err);
      const errorMessage = err.response?.data?.message || 'Create failed';
      alert(errorMessage);
    }
  };

  return (
    <div className="card">
      <h3>Your Playlists</h3>
      <div className="create">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="New playlist title" />
        <button onClick={create}>Create</button>
      </div>
      <ul>
        {lists.map(l=> (
          <li key={l._id}>
            <strong>{l.title}</strong>
            <div>{l.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}