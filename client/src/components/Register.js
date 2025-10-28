import React, { useState } from 'react';
import api from '../services/api';

export default function Register({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      api.setToken(data.token);
      onLogin(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <form onSubmit={submit} className="card">
      <h3>Register</h3>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ color: '#b3b3b3' }}>Role:</label>
        <label style={{ color: '#b3b3b3' }}><input type="radio" name="role" value="user" checked={role==='user'} onChange={()=>setRole('user')} /> User</label>
        <label style={{ color: '#b3b3b3' }}><input type="radio" name="role" value="admin" checked={role==='admin'} onChange={()=>setRole('admin')} /> Admin</label>
      </div>
      <small style={{ color: '#b3b3b3' }}>If selecting Admin, an admin account will only be created if no admin exists yet.</small>
      <button type="submit">Register</button>
    </form>
  );
}