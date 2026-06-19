import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Search, Heart, ShoppingBag, User, Menu, X, Tag } from 'lucide-react';

export default function Navbar({
  cartCount,
  wishlistCount,
  onNavigate,
  currentPage,
  searchQuery,
  setSearchQuery,
  onOpenCart,
  onOpenAccount,
  currentUser,
  categories,
  settings
}) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Handle header background opacity change on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dynamicLinks = categories && categories.length > 0
    ? categories.map(cat => ({ label: cat.name, view: 'shop', category: cat.id }))
    : [
        { label: 'Sarees', view: 'shop', category: 'sarees' },
        { label: 'Kurtis', view: 'shop', category: 'kurtis' },
        { label: 'Maxi', view: 'shop', category: 'maxi' },
        { label: 'Night Wears', view: 'shop', category: 'nightwear' },
        { label: 'Hijabs', view: 'shop', category: 'hijabs' },
        { label: 'Accessories', view: 'shop', category: 'accessories' }
      ];

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Shop', view: 'shop' },
    ...dynamicLinks,
    { label: 'Sale', view: 'shop', isSale: true },
    { label: 'Contact', view: 'contact' }
  ];

  const handleLinkClick = (link) => {
    setIsMobileMenuOpen(false);
    if (link.isSale) {
      onNavigate(link.view, null, true);
    } else {
      onNavigate(link.view, link.category || null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('shop');
    setIsSearchVisible(false);
  };

  const isLinkActive = (link) => {
    if (link.view === 'home') {
      return currentPage === 'home';
    }
    if (link.view === 'contact') {
      return currentPage === 'contact';
    }
    if (link.view === 'shop') {
      if (link.isSale) return false;
      if (link.category) {
        const path = window.location.pathname.toLowerCase();
        let catUrl = link.category;
        if (link.category === 'nightwear') catUrl = 'nightwears';
        return path === `/category/${catUrl}`;
      } else {
        return window.location.pathname.toLowerCase() === '/shop';
      }
    }
    return currentPage === link.view;
  };

  return (
    <>
      <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-announcement">
          <p>
            <Tag size={12} className="inline-icon" /> Free Express Shipping on Orders Above ₹1499! Use Code: <strong>WELCOME10</strong>
          </p>
        </div>
        <div className="navbar-container container">
          {/* Mobile Menu Icon */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div className="navbar-logo" onClick={() => onNavigate('home')}>
            <img src="/logo-purple.png" alt="Riza Fashions" className="navbar-brand-logo" />
          </div>

          {/* Desktop Links */}
          <nav className="navbar-desktop-nav">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                className={`navbar-link ${isLinkActive(link) ? 'active' : ''} ${link.isSale ? 'sale-link' : ''}`}
                onClick={() => handleLinkClick(link)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="navbar-actions">
            {/* Search Bar Toggle */}
            <div className="navbar-search-wrapper">
              <button
                className="navbar-action-btn"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                aria-label="Toggle Search"
              >
                <Search size={20} />
              </button>
              {isSearchVisible && (
                <form onSubmit={handleSearchSubmit} className="navbar-search-form animate-slide-down">
                  <input
                    type="text"
                    placeholder="Search premium collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="search-submit-btn">Go</button>
                </form>
              )}
            </div>

            {/* Wishlist Link */}
            <button
              className="navbar-action-btn badge-container"
              onClick={() => onNavigate('wishlist')}
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && <span className="action-badge bg-primary">{wishlistCount}</span>}
            </button>

            {/* Cart Link */}
            <button
              className="navbar-action-btn badge-container"
              onClick={onOpenCart}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="action-badge bg-accent">{cartCount}</span>}
            </button>

            {/* Auth Links */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '8px' }}>
                <button
                  className="navbar-link"
                  onClick={() => navigate('/profile')}
                  style={{ fontSize: '0.85rem', fontWeight: 500 }}
                >
                  Profile
                </button>
                <button
                  className="navbar-link"
                  onClick={() => navigate('/orders')}
                  style={{ fontSize: '0.85rem', fontWeight: 500 }}
                >
                  Orders
                </button>
                <button
                  className="navbar-link"
                  onClick={handleLogout}
                  style={{ fontSize: '0.85rem', fontWeight: 500, color: '#B71C1C' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '8px' }}>
                <button
                  className="navbar-link"
                  onClick={() => navigate('/login')}
                  style={{ fontSize: '0.85rem', fontWeight: 500 }}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      <div className={`navbar-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="drawer-content animate-zoom">
          <div className="drawer-header">
            <h3>Menu</h3>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Menu">
              <X size={24} />
            </button>
          </div>

          <div className="drawer-search">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit"><Search size={18} /></button>
              </div>
            </form>
          </div>

          <nav className="drawer-nav">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                className={`drawer-link ${link.isSale ? 'sale-link' : ''}`}
                onClick={() => handleLinkClick(link)}
              >
                {link.label}
              </button>
            ))}
            {/* Dynamic Policy Pages in Mobile Menu */}
            <div style={{ margin: '15px 0 5px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company & Policies</div>
            <button className="drawer-link" onClick={() => { setIsMobileMenuOpen(false); onNavigate('about'); }}>About Us</button>
            <button className="drawer-link" onClick={() => { setIsMobileMenuOpen(false); onNavigate('contact'); }}>Contact Us</button>
            <button className="drawer-link" onClick={() => { setIsMobileMenuOpen(false); onNavigate('shipping-policy'); }}>Shipping Policy</button>
            <button className="drawer-link" onClick={() => { setIsMobileMenuOpen(false); onNavigate('refund-policy'); }}>Refund Policy</button>
            <button className="drawer-link" onClick={() => { setIsMobileMenuOpen(false); onNavigate('terms-conditions'); }}>Terms & Conditions</button>
            <button className="drawer-link" onClick={() => { setIsMobileMenuOpen(false); onNavigate('privacy-policy'); }}>Privacy Policy</button>

            {/* Mobile Auth Links */}
            <div style={{ margin: '15px 0', borderTop: '1px solid var(--border-light)' }}></div>
            {currentUser ? (
              <>
                <button
                  className="drawer-link"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/profile'); }}
                >
                  Profile
                </button>
                <button
                  className="drawer-link"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/orders'); }}
                >
                  Orders
                </button>
                <button
                  className="drawer-link"
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  style={{ color: '#B71C1C' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="drawer-link"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                >
                  Login
                </button>
                <button
                  className="drawer-link"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/login?mode=register'); }}
                  style={{ color: 'var(--primary)' }}
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
