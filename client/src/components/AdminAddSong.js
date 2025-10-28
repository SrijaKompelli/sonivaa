import React, { useState } from 'react';
import api from '../services/api';

export default function AdminAddSong() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [url, setUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [moods, setMoods] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
  const payload = { title, artist, genre, url, coverImage };
  // accept comma-separated moods, convert to array
  const moodArr = moods.split(',').map(m => m.trim()).filter(Boolean);
  if (moodArr.length) payload.mood = moodArr;
      await api.post('/tracks', payload);
      alert('Track added');
      setTitle(''); setArtist(''); setGenre(''); setUrl(''); setCoverImage('');
  setMoods('');
    } catch (err) {
      alert(err.response?.data?.message || 'Add failed');
    }
  };

  return (
    <div className="card" style={{ padding: 12 }}>
      <h3>Add Track</h3>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <input value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Artist" />
        <input value={genre} onChange={e=>setGenre(e.target.value)} placeholder="Genre" />
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Audio URL" />
        <input value={coverImage} onChange={e=>setCoverImage(e.target.value)} placeholder="Cover image URL" />
        <input value={moods} onChange={e=>setMoods(e.target.value)} placeholder="Moods (comma-separated)" />
        <button type="submit">Add Track</button>
      </form>
    </div>
  );
}
