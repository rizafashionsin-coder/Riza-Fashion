import React, { useState, useEffect } from 'react';
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
  currentUser
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Shop', view: 'shop' },
    { label: 'Sarees', view: 'shop', category: 'sarees' },
    { label: 'Kurtis', view: 'shop', category: 'kurtis' },
    { label: 'Maxi', view: 'shop', category: 'maxi' },
    { label: 'Night Wears', view: 'shop', category: 'nightwear' },
    { label: 'Hijabs', view: 'shop', category: 'hijabs' },
    { label: 'Accessories', view: 'shop', category: 'accessories' },
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

            {/* Account Link */}
            <button 
              className="navbar-action-btn"
              onClick={onOpenAccount}
              aria-label="Account"
              style={currentUser ? { borderRadius: '20px', padding: '6px 14px', gap: '8px', display: 'flex', alignItems: 'center' } : {}}
            >
              <User size={20} />
              {currentUser && (
                <span className="navbar-username" style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.email}
                </span>
              )}
            </button>
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
          </nav>
        </div>
      </div>
    </>
  );
}
