import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Playlists from './components/Playlists';
import Search from './components/Search';
import AdminDashboard from './components/AdminDashboard';
import AdminAddSong from './components/AdminAddSong';
import Profile from './components/Profile';
import api from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // parsed is expected to be { token, user }
        if (parsed.token) api.setToken(parsed.token);
        if (parsed.user) setUser(parsed.user);
        else setUser(parsed);
      } catch (err) {
        console.warn('Failed to parse stored auth:', err);
      }
    }
  }, []);

  const onLogin = (data) => {
    localStorage.setItem('auth', JSON.stringify(data));
    setUser(data.user);
    api.setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
    api.setToken(null);
  };
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="app">
      <header>
        <h1>Soniva</h1>
        {user && (
          <div className="user-info">
            <button onClick={() => setShowProfile(p => !p)} style={{ marginRight: 8 }}>Profile</button>
            <span>{user.name}</span>
            <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
          </div>
        )}
      </header>

      {!user ? (
        <div className="auth-page">
          <div className="auth-forms">
            {!showRegister ? (
              <div className="auth-card">
                <h2>Welcome Back!</h2>
                <Login onLogin={onLogin} />
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                  Don't have an account?{' '}
                  <button onClick={() => setShowRegister(true)}>
                    Sign Up
                  </button>
                </p>
              </div>
            ) : (
              <div className="auth-card">
                <h2>Create Account</h2>
                <Register onLogin={onLogin} />
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                  Already have an account?{' '}
                  <button onClick={() => setShowRegister(false)}>
                    Sign In
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="app-grid">
          <div className="main-content">
            {showProfile ? <Profile /> : <Search />}
          </div>
          <div className="sidebar">
            <Playlists user={user} />
            {user.role === 'admin' && (
              <>
                <AdminAddSong />
                <AdminDashboard />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}