import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (err) { console.warn(err); }
    };
    load();
  }, []);

  if (!stats) return <div className="card">Loading admin stats...</div>;

  return (
    <div className="card">
      <h3>Admin</h3>
      <div>Users: {stats.users}</div>
      <div>Playlists: {stats.playlists}</div>
      <div>Tracks: {stats.tracks}</div>
    </div>
  );
}