import React, { useState, useEffect } from 'react';

// Extend the global Window interface to include our electronAPI
declare global {
  interface Window {
    electronAPI: {
      sendMessage: (message: string) => void;
      onMessage: (callback: (message: string) => void) => void;
    };
  }
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🚀 Electron React TypeScript</h1>
          <div className="status-indicator">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="content-container">
          <div className="welcome-section">
            <h2>Welcome to Your Electron App, Rafi Ali!</h2>
            <p>This is a modern Electron application built with React and TypeScript.</p>
          </div>

          <div className="message-section">
            <div className="message-input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message and press Enter..."
                className="message-input"
                disabled={!isConnected}
              />
              <button
                onClick={handleSendMessage}
                className="send-button"
                disabled={!isConnected || !message.trim()}
              >
                Send
              </button>
            </div>

            <div className="messages-container">
              <h3>Received Messages:</h3>
              <div className="messages-list">
                {receivedMessages.length === 0 ? (
                  <p className="no-messages">No messages received yet...</p>
                ) : (
                  receivedMessages.map((msg, index) => (
                    <div key={index} className="message-item">
                      <span className="message-text">{msg}</span>
                      <span className="message-time">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="features-section">
            <h3>Features:</h3>
            <ul className="features-list">
              <li>✅ Electron with React and TypeScript</li>
              <li>✅ Modern UI with CSS Grid and Flexbox</li>
              <li>✅ Secure IPC communication</li>
              <li>✅ Hot reloading in development</li>
              <li>✅ Webpack bundling</li>
              <li>✅ Cross-platform compatibility</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App; 