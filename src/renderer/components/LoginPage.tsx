import React, { useState, useEffect } from 'react';

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
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [dbMessage, setDbMessage] = useState('');
  const [dbLoading, setDbLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const result = await window.electronAPI.getAllUsers();
      if (result && Array.isArray(result)) {
        setUsers(result);
      } else {
        console.error('Failed to fetch users:', result);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

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

  const handleUploadDatabase = async () => {
    try {
      setDbLoading(true);
      setDbMessage('');
      
      // Use Electron's dialog API for file selection
      const result = await window.electronAPI.selectDatabaseFile();
      
      if (result.success && result.filePath) {
        try {
          const uploadResult = await window.electronAPI.uploadDatabase(result.filePath);
          if (uploadResult.success) {
            setDbMessage(`✅ ${uploadResult.message} Backup created at: ${uploadResult.backupPath}`);
            // Refresh users after database update
            await fetchUsers();
          } else {
            setDbMessage(`❌ ${uploadResult.message}`);
          }
        } catch (error: any) {
          setDbMessage(`❌ Error: ${error.message}`);
        }
      } else {
        setDbMessage('ℹ️ No file selected');
      }
      
    } catch (error: any) {
      setDbMessage(`❌ Error: ${error.message}`);
    } finally {
      setDbLoading(false);
    }
  };

  const handleExportDatabase = async () => {
    try {
      setDbLoading(true);
      setDbMessage('');
      
      const result = await window.electronAPI.exportDatabase();
      if (result.success) {
        setDbMessage(`✅ ${result.message} Exported to: ${result.filePath}`);
      } else {
        setDbMessage(`ℹ️ ${result.message}`);
      }
    } catch (error: any) {
      setDbMessage(`❌ Error: ${error.message}`);
    } finally {
      setDbLoading(false);
    }
  };

  return (
    <div className="elegant-login-container">
      <div className="elegant-login-content">
        {/* Profile Avatar */}
        <div className="profile-avatar">
          <div className="avatar-circle">
            👤
          </div>
        </div>

        {/* User Name */}
        <div className="user-display-name">
          <div style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Rama Resortu
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '400', opacity: '0.8' }}>
            Luxury & Comfort
          </div>
        </div>
        
        {/* User Switch Button */}
        <div className="user-switch-section">
          <button 
            type="button" 
            onClick={() => setShowUserSelection(!showUserSelection)}
            className="user-switch-btn"
          >
            Switch User
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="elegant-login-form">
          {/* Username Field (Hidden but functional) */}
          <input
            type="hidden"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Password/PIN Input */}
          <div className="pin-input-container">
            <div className="pin-input-wrapper">
              {/* Padlock icon removed */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your PIN"
                disabled={loading}
                autoComplete="current-password"
                className="pin-input"
                maxLength={20}
              />
              <button 
                type="button" 
                className="pin-visibility-toggle"
                onClick={() => {
                  const input = document.querySelector('.pin-input') as HTMLInputElement;
                  if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                  }
                }}
              >
                👁️
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="elegant-error-message">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Forgot PIN Link - Removed for security reasons */}
        {/* Demo Info - Removed for security reasons */}

        {/* User Selection (Hidden by default) */}
        {showUserSelection && (
          <div className="user-selection-panel">
            <div className="user-option" onClick={() => switchUser('admin')}>
              <div className="user-avatar">👨‍💼</div>
              <div className="user-info">
                <div className="user-name">Administrator</div>
                <div className="user-role">Admin</div>
              </div>
            </div>
            <div className="user-option" onClick={() => switchUser('user')}>
              <div className="user-avatar">👤</div>
              <div className="user-info">
                <div className="user-name">Hotel User</div>
                <div className="user-role">Staff</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner-elegant">⏳</div>
            <div className="loading-text">Authenticating...</div>
          </div>
        )}

        {/* Users Table Section */}
        <div className="users-table-section">
          <h3>Users Table</h3>
          <button 
            type="button" 
            onClick={fetchUsers}
            className="refresh-users-btn"
            disabled={usersLoading}
          >
            {usersLoading ? 'Refreshing...' : 'Refresh Users'}
          </button>
          
          <div className="users-table-container">
            <pre className="users-json-display">
              {usersLoading ? 'Loading users...' : JSON.stringify(users, null, 2)}
            </pre>
          </div>
        </div>

        {/* Database Management Section */}
        <div className="database-management-section">
          <h3>🗄️ Database Management</h3>
          <p>
            For super users: Upload updated database files or export current database
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              type="button" 
              onClick={handleUploadDatabase}
              disabled={dbLoading}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: dbLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: dbLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📁 Upload Database
            </button>
            
            <button 
              type="button" 
              onClick={handleExportDatabase}
              disabled={dbLoading}
              style={{
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: dbLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: dbLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📤 Export Database
            </button>
          </div>
          
          {/* Database Message */}
          {dbMessage && (
            <div className={`database-message ${
              dbMessage.includes('✅') ? 'success' : 
              dbMessage.includes('❌') ? 'error' : 'info'
            }`}>
              {dbMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
