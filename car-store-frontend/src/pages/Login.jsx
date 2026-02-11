import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, LogIn } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { access_token } = response.data;
      
      // Decode JWT to get user info (simple base64 decode)
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const userData = {
        id: payload.user_id,
        email: payload.email,
        role: payload.role,
      };

      login(access_token, userData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '2rem' }}>
          <div className="card-body">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                background: 'var(--primary)',
                borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                <Car size={32} color="white" />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Welcome Back
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Sign in to access your account
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={loading}
              >
                <LogIn size={18} />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '500' }}>
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
