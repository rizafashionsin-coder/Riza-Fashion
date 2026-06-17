import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { User, Mail, Shield, Calendar, ShoppingBag, LogOut, Compass } from 'lucide-react';

export default function ProfilePage({ currentUser, setCurrentUser, onNavigate }) {
  if (!currentUser) {
    return (
      <div className="container text-center" style={{ padding: '100px 20px' }}>
        <User size={64} className="color-primary" style={{ marginBottom: '20px' }} />
        <h2>Not Authenticated</h2>
        <p>Please log in to view your profile dashboard.</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => onNavigate('home')}>
          Go back Home
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      onNavigate('home');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active Member';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="profile-page section animate-fade" style={{ background: 'var(--bg-secondary)', minHeight: 'calc(100vh - var(--header-height))', padding: '60px 20px' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        
        {/* Profile Header */}
        <div className="section-header text-center" style={{ marginBottom: '40px' }}>
          <span className="section-subtitle">Boutique Dashboard</span>
          <h2 className="section-title">My Riza Profile</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage your account settings, orders, and premium boutique choices.</p>
        </div>

        {/* Profile Details Card */}
        <div className="profile-card" style={{ background: '#FFF', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', padding: '40px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-light)', paddingBottom: '24px' }}>
            <div className="profile-avatar-circle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', marginBottom: '16px', border: '2px solid var(--border-medium)' }}>
              <User size={48} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '4px' }}>
              {currentUser.displayName || currentUser.fullName || 'Fashionista'}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--border-light)' }}>
              {currentUser.isAdmin ? '👑 Boutique Admin' : '✨ Valued Client'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--primary)', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <Mail size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', fontWeight: 500 }}>Email Address</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--charcoal)', fontWeight: 500 }}>{currentUser.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--primary)', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <Shield size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', fontWeight: 500 }}>Account ID (UID)</span>
                <code style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentUser.uid}</code>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--primary)', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', fontWeight: 500 }}>Member Since</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--charcoal)', fontWeight: 500 }}>
                  {formatDate(currentUser.createdAt || currentUser.metadata?.creationTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => onNavigate('orders')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: 'var(--radius-md)' }}
            >
              <ShoppingBag size={18} />
              <span>View My Orders</span>
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={() => onNavigate('shop')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', border: '1px solid var(--border-medium)', background: '#FFF', borderRadius: 'var(--radius-md)', color: 'var(--charcoal)' }}
            >
              <Compass size={18} />
              <span>Explore Collections</span>
            </button>
          </div>

          <button 
            className="btn btn-block" 
            onClick={handleLogout}
            style={{ width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#FFF8F8', border: '1px solid #FFCDD2', borderRadius: 'var(--radius-md)', color: '#B71C1C', fontWeight: 600 }}
          >
            <LogOut size={18} />
            <span>Sign Out of Account</span>
          </button>

        </div>

      </div>
    </div>
  );
}
