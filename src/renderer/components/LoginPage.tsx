import React, { useState } from 'react';
import hotelImage from './img/images.jpeg';

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
  const [username, setUsername] = useState('admin'); // Default to admin for PIN-style login
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const switchUser = (newUsername: string) => {
    setUsername(newUsername);
    setPassword('');
    setError('');
    setShowUserSelection(false);
  };

  return (
    <div className="login-container">
      <div className="login-grid">
        {/* Left Column */}
        <div className="login-left-column">
          <div className="login-image-wrapper">
            <img
              src={hotelImage}
              alt="Hotel"
              className="login-image"
            />
            <div className="login-overlay">
              <div className="login-branding">
                <h1 className="login-hotel-name">Rama Resort</h1>
                <p className="login-hotel-tagline">Luxury & Comfort</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="login-right-column">
          <div className="login-content">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account</p>

            {/* User Switch Button */}
            <button 
              type="button" 
              onClick={() => setShowUserSelection(!showUserSelection)}
              className="login-switch-button"
            >
              Switch User
            </button>

            {/* User Selection Panel */}
            {showUserSelection && (
              <div className="login-user-panel">
                <div className="login-user-options">
                  <div 
                    className="login-user-option"
                    onClick={() => switchUser('admin')}
                  >
                    <div className="login-user-avatar">A</div>
                    <div className="login-user-info">
                      <div className="login-user-name">Administrator</div>
                      <div className="login-user-role">Admin</div>
                    </div>
                  </div>
                  <div 
                    className="login-user-option"
                    onClick={() => switchUser('user')}
                  >
                    <div className="login-user-avatar">U</div>
                    <div className="login-user-info">
                      <div className="login-user-name">Hotel User</div>
                      <div className="login-user-role">Staff</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Username Field (Hidden but functional) */}
              <input
                type="hidden"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {/* Password Input */}
              <div className="login-input-group">
                <label className="login-label">Password</label>
                <div className="login-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="login-input"
                    disabled={loading}
                    autoComplete="current-password"
                    maxLength={20}
                  />
                  <svg
                    className="login-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <button
                    type="button"
                    className="login-toggle-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* Sign In Button with loader */}
              <button
                type="submit"
                className="login-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="login-spinner"></div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
