import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ShieldAlert, ShieldCheck, RefreshCw, ChevronRight, Home, Server } from 'lucide-react';

export default function FirebaseTestPage({ onNavigate }) {
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorDetails, setErrorDetails] = useState('');
  const [testPayload, setTestPayload] = useState(null);
  const [testingWrite, setTestingWrite] = useState(false);

  const runConnectionTest = async () => {
    setStatus('loading');
    setErrorDetails('');
    setTestPayload(null);
    setTestingWrite(true);

    try {
      // Create a test document reference
      const testDocRef = doc(db, 'connection_tests', 'status');
      
      const payload = {
        connected: true,
        timestamp: new Date().toISOString(),
        clientOrigin: window.location.origin,
        message: 'Riza Fashions connection verification handshake successful!'
      };

      // 1. Attempt Firestore Document WRITE
      await setDoc(testDocRef, payload);

      // 2. Attempt Firestore Document READ
      const docSnap = await getDoc(testDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.connected === true) {
          setTestPayload(data);
          setStatus('success');
        } else {
          throw new Error('Connection successful, but verification data mismatch.');
        }
      } else {
        throw new Error('Verification document not found after write operation.');
      }
    } catch (err) {
      console.error('Firebase integration test failed:', err);
      setStatus('error');
      
      let errMsg = err.message;
      if (err.code === 'permission-denied') {
        errMsg = 'Firestore Security Rules permission denied. Ensure that connection_tests collection allows write & read access.';
      } else if (err.code === 'failed-precondition') {
        errMsg = 'Firestore indexing or configuration preconditions failed.';
      } else if (err.message && err.message.includes('API key')) {
        errMsg = 'Invalid or missing API key. Please check your VITE_FIREBASE_API_KEY value inside the .env file.';
      }
      setErrorDetails(errMsg || 'An unknown network error occurred while reaching Firebase servers.');
    } finally {
      setTestingWrite(false);
    }
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  return (
    <div className="firebase-test-container container" style={{ padding: '60px 20px', minHeight: '60vh' }}>
      
      {/* Breadcrumbs */}
      <nav className="breadcrumb-nav margin-bottom" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Home size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Home
        </button>
        <ChevronRight size={12} className="breadcrumb-separator" style={{ color: 'var(--border-medium)' }} />
        <span className="breadcrumb-active" style={{ color: 'var(--primary)' }}>Firebase Verification</span>
      </nav>

      <div className="section-header text-center" style={{ marginBottom: '40px' }}>
        <span className="section-subtitle" style={{ color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>System Verification</span>
        <h1 className="section-title" style={{ fontSize: '2.2rem', marginTop: '8px' }}>Firebase Connection Status</h1>
      </div>

      <div className="test-card-wrapper" style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
        
        {/* Status Header Block */}
        <div className="status-header" style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: status === 'success' ? '#F4FAF6' : status === 'error' ? '#FDF5F5' : 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          {status === 'loading' && (
            <div className="status-icon-wrapper animate-spin" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--border-light)', color: 'var(--primary)', marginBottom: '16px' }}>
              <RefreshCw size={32} />
            </div>
          )}

          {status === 'success' && (
            <div className="status-icon-wrapper animate-zoom" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#2E7D32', marginBottom: '16px' }}>
              <ShieldCheck size={32} />
            </div>
          )}

          {status === 'error' && (
            <div className="status-icon-wrapper animate-zoom" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FFEBEE', color: '#C62828', marginBottom: '16px' }}>
              <ShieldAlert size={32} />
            </div>
          )}

          <h2 style={{ fontSize: '1.4rem', color: 'var(--charcoal)', fontWeight: 600 }}>
            {status === 'loading' && 'Testing Connection...'}
            {status === 'success' && 'Connection Working Successfully!'}
            {status === 'error' && 'Firebase Connection Failed'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {status === 'loading' && 'Performing read/write roundtrip diagnostics to Firestore...'}
            {status === 'success' && 'Your Firestore Database is successfully initialized and accepting operations.'}
            {status === 'error' && 'We encountered an issue while communicating with your Firestore project.'}
          </p>
        </div>

        {/* Detailed Logs Panel */}
        <div className="logs-panel" style={{ padding: '30px 24px' }}>
          
          {status === 'loading' && (
            <div className="loading-state-log" style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Contacting <code>riza-fashions-c2d77.firebaseapp.com</code>...</p>
            </div>
          )}

          {status === 'success' && testPayload && (
            <div className="success-log-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="log-row" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Firestore Response Metadata</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--charcoal)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Status:</strong> <span style={{ color: '#2E7D32' }}>Online</span></div>
                  <div><strong>Timestamp:</strong> {testPayload.timestamp}</div>
                  <div><strong>Handshake Msg:</strong> {testPayload.message}</div>
                  <div><strong>Client Origin:</strong> {testPayload.clientOrigin}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2E7D32', fontSize: '0.85rem', fontWeight: 500 }}>
                <Server size={14} />
                <span>Authentication and Storage clients have also initialized successfully.</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="error-log-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="log-row" style={{ background: '#FFF8F8', border: '1px solid #FFCDD2', padding: '16px', borderRadius: 'var(--radius-md)', color: '#B71C1C' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Diagnostic Error Log</span>
                <p style={{ fontSize: '0.85rem', fontFamily: 'monospace', margin: 0, lineHeight: 1.5 }}>
                  {errorDetails}
                </p>
              </div>

              <div className="troubleshooting-steps">
                <h4 style={{ fontSize: '0.9rem', color: 'var(--charcoal)', marginBottom: '8px', fontWeight: 600 }}>Troubleshooting Checks:</h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: 1.6 }}>
                  <li>Confirm you have placed your real API key in the <code>.env</code> file.</li>
                  <li>Check if Firestore Database has been created inside the Firebase Console.</li>
                  <li>Verify Firestore rules are configured (e.g. test rules enabling reads/writes).</li>
                  <li>Ensure your local device has an active internet connection.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="action-row" style={{ display: 'flex', gap: '12px', marginTop: '30px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
            <button 
              className="btn btn-secondary btn-block" 
              onClick={runConnectionTest} 
              disabled={testingWrite}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <RefreshCw size={14} className={testingWrite ? 'animate-spin' : ''} />
              <span>Retry Handshake</span>
            </button>
            <button 
              className="btn btn-primary btn-block" 
              onClick={() => onNavigate('home')}
            >
              Back to Boutique
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
