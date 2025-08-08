import React, { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'manager';
  name: string;
  isActive: boolean;
  createdDate: string;
}

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await window.electronAPI.authenticateUser(username, password);
      
      if (result.success && result.user) {
        console.log('Login successful:', result.user);
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('hotel123');
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Hotel Logo/Header */}
        <div className="login-header">
          <div className="hotel-logo">
            <div className="logo-icon">🏨</div>
            <h1>Hotel Paradise</h1>
            <p>Management System</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Signing In...
              </>
            ) : (
              <>
                <span className="button-icon">🚪</span>
                Sign In
              </>
            )}
          </button>

          {/* Demo Credentials Button */}
          <div className="demo-section">
            <button 
              type="button" 
              onClick={() => setShowDemo(!showDemo)}
              className="demo-toggle"
            >
              {showDemo ? '🙈 Hide Demo Info' : '👀 Show Demo Credentials'}
            </button>
            
            {showDemo && (
              <div className="demo-info">
                <p><strong>Demo Account:</strong></p>
                <p>Username: <code>admin</code></p>
                <p>Password: <code>hotel123</code></p>
                <button 
                  type="button"
                  onClick={fillDemoCredentials}
                  className="fill-demo-button"
                >
                  🎯 Fill Demo Credentials
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>🌟 Welcome to Hotel Paradise Management System 🌟</p>
          <p className="subtitle">Manage your hotel operations with ease</p>
        </div>
      </div>


    </div>
  );
};

export default LoginPage;
