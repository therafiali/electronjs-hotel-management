import React, { useState, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import LoginPage from './components/LoginPage';

// User interface
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'manager';
  name: string;
  isActive: boolean;
  createdDate: string;
}

// Extend the global Window interface to include our electronAPI
declare global {
  interface Window {
    electronAPI: {
      sendMessage: (message: string) => void;
      onMessage: (callback: (message: string) => void) => void;
      authenticateUser: (username: string, password: string) => Promise<any>;
      getAllUsers: () => Promise<User[]>;
      saveInvoice: (invoice: any) => Promise<any>;
      getAllInvoices: () => Promise<any[]>;
    };
  }
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'form' | 'list' | 'debug'>('form');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [debugData, setDebugData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for messages from the main process
    if (window.electronAPI) {
      window.electronAPI.onMessage((msg: string) => {
        setReceivedMessages(prev => [...prev, msg]);
      });
      setIsConnected(true);
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && window.electronAPI) {
      window.electronAPI.sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleInvoiceSubmit = async (invoiceData: any) => {
    try {
      setLoading(true);
      console.log('Saving invoice to database:', invoiceData);
      
      // Save to database
      const result = await window.electronAPI.saveInvoice(invoiceData);
      console.log('Invoice saved successfully:', result);
      
      // Refresh invoices list
      await loadInvoices();
      
      // Switch to list view
      setCurrentView('list');
      alert('Invoice created and saved to database successfully!');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice to database!');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceClick = (invoice: any) => {
    console.log('Invoice clicked:', invoice);
    alert(`Invoice ${invoice.id} details:\nGuest: ${invoice.guestInfo.name}\nTotal: $${invoice.total}`);
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const allInvoices = await window.electronAPI.getAllInvoices();
      setInvoices(allInvoices);
      console.log('Loaded invoices from database:', allInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDebugData = async () => {
    try {
      setLoading(true);
      console.log('Loading real data from database...');
      
      // Get real data from database
      const realData = await window.electronAPI.getAllInvoices();
      
      // Log to console for easy viewing
      console.log('🔍 Real getAllInvoices() Data:', realData);
      console.log('📊 Total invoices in database:', realData.length);
      if (realData.length > 0) {
        console.log('📋 First invoice details:', realData[0]);
      }
      
      setDebugData(JSON.stringify(realData, null, 2));
    } catch (error) {
      console.error('Error loading debug data:', error);
      setDebugData('Error loading data from database: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Authentication handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    console.log('User logged in successfully:', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView('form');
    console.log('User logged out');
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏨 Hotel Paradise Management System</h1>
          <div className="header-right">
            <div className="user-info">
              <span className="user-greeting">
                Welcome, <strong>{currentUser?.name}</strong>
              </span>
              <span className="user-role">({currentUser?.role})</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              🚪 Logout
            </button>
            <div className="status-indicator">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'form' ? (
          <div>
            <InvoiceForm onSubmit={handleInvoiceSubmit} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={async () => {
                  await loadInvoices();
                  setCurrentView('list');
                }}
                style={{
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginRight: '10px'
                }}
              >
                View Invoice List
              </button>
              <button 
                onClick={async () => {
                  setCurrentView('debug');
                  await loadDebugData();
                }}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Debug Data Preview
              </button>
            </div>
          </div>
        ) : currentView === 'list' ? (
          <div>
            <InvoiceList 
              invoices={invoices} 
              onInvoiceClick={handleInvoiceClick}
            />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => setCurrentView('form')}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginRight: '10px'
                }}
              >
                Create New Invoice
              </button>
              <button 
                onClick={async () => {
                  setCurrentView('debug');
                  await loadDebugData();
                }}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Debug Data Preview
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2>🔍 Real Database Data Preview</h2>
              <p>This shows the actual data from getAllInvoices() in your database</p>
            </div>
            {loading && (
              <div style={{ textAlign: 'center', margin: '20px' }}>
                <p>Loading data from database...</p>
              </div>
            )}
            <div style={{ 
              background: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '8px',
              padding: '20px',
              margin: '20px',
              maxHeight: '500px',
              overflow: 'auto'
            }}>
              <pre style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#333'
              }}>
                {debugData || 'Click "Load Real Data" to see actual database content'}
              </pre>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={loadDebugData}
                disabled={loading}
                style={{
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  marginRight: '10px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Loading...' : 'Load Real Data'}
              </button>
              <button 
                onClick={() => setCurrentView('form')}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginRight: '10px'
                }}
              >
                Back to Form
              </button>
              <button 
                onClick={async () => {
                  await loadInvoices();
                  setCurrentView('list');
                }}
                style={{
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Back to List
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App; 