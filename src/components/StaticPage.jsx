import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function StaticPage({ pageId, title, onNavigate }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'websiteSettings', pageId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content || '');
        } else {
          setError('Page content not found.');
        }
      } catch (err) {
        console.error(`Error loading page ${pageId}:`, err);
        setError('Failed to load page content.');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageId]);

  return (
    <div className="page-static-container section animate-fade" style={{ minHeight: '60vh', background: 'var(--bg-secondary)', paddingTop: '40px' }}>
      <div className="container">
        {/* Breadcrumb Row */}
        <nav className="breadcrumb-nav margin-bottom" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <button onClick={() => onNavigate('home')} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Home</button>
          <ChevronRight size={12} style={{ margin: '0 8px', color: 'var(--text-light)' }} />
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{title}</span>
        </nav>

        <div className="static-page-card" style={{ background: '#FFF', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <h1 style={{ fontFamily: 'var(--font-headings)', fontSize: '2.5rem', marginBottom: '24px', color: 'var(--charcoal)', borderBottom: '2px solid var(--border-light)', paddingBottom: '12px', fontWeight: 700 }}>
            {title}
          </h1>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
            </div>
          ) : error ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#B71C1C', padding: '16px', background: '#FFF8F8', borderRadius: '8px', border: '1px solid #FFCDD2' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          ) : (
            <div 
              style={{ 
                fontSize: '1rem', 
                lineHeight: '1.75', 
                color: 'var(--text-main)', 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'var(--font-body)',
                wordBreak: 'break-word'
              }}
            >
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
