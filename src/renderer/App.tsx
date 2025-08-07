import React, { useState, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';

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
  const [currentView, setCurrentView] = useState<'form' | 'list'>('form');
  const [invoices, setInvoices] = useState<any[]>([]);

  // Sample data for testing
  const sampleInvoices = [
    {
      id: '1',
      guestInfo: { 
        name: 'John Doe', 
        phone: '123-456-7890', 
        address: '123 Main St',
        checkIn: '2024-01-01', 
        checkOut: '2024-01-03' 
      },
      roomInfo: { 
        roomNumber: '101',
        roomType: 'Deluxe',
        pricePerNight: 200,
        nights: 2
      },
      foodItems: [
        { name: 'Breakfast', quantity: 2, price: 25 }
      ],
      taxRate: 5,
      discount: 0,
      subtotal: 450,
      tax: 22.5,
      total: 472.5,
      date: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      guestInfo: { 
        name: 'Jane Smith', 
        phone: '987-654-3210', 
        address: '456 Oak Ave',
        checkIn: '2024-01-05', 
        checkOut: '2024-01-07' 
      },
      roomInfo: { 
        roomNumber: '205',
        roomType: 'Suite',
        pricePerNight: 350,
        nights: 2
      },
      foodItems: [
        { name: 'Dinner', quantity: 1, price: 45 },
        { name: 'Room Service', quantity: 1, price: 30 }
      ],
      taxRate: 5,
      discount: 50,
      subtotal: 775,
      tax: 38.75,
      total: 763.75,
      date: '2024-01-05T14:30:00Z'
    }
  ];

  useEffect(() => {
    // Set sample data
    setInvoices(sampleInvoices);
  }, []);

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

  const handleInvoiceSubmit = (invoiceData: any) => {
    console.log('Invoice submitted:', invoiceData);
    // Add new invoice to the list
    const newInvoice = {
      ...invoiceData,
      id: Date.now().toString()
    };
    setInvoices(prev => [...prev, newInvoice]);
    // Switch to list view
    setCurrentView('list');
    alert('Invoice created successfully!');
  };

  const handleInvoiceClick = (invoice: any) => {
    console.log('Invoice clicked:', invoice);
    alert(`Invoice ${invoice.id} details:\nGuest: ${invoice.guestInfo.name}\nTotal: $${invoice.total}`);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏨 Hotel & Restaurant Invoice System</h1>
          <div className="status-indicator">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'form' ? (
          <div>
            <InvoiceForm onSubmit={handleInvoiceSubmit} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => setCurrentView('list')}
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
                View Invoice List
              </button>
            </div>
          </div>
        ) : (
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
                  fontSize: '14px'
                }}
              >
                Create New Invoice
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App; 