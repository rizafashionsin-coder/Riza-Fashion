import React from 'react';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';

export default function MobileNav({
  currentPage,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenAccount,
  currentUser
}) {
  return (
    <div className="mobile-bottom-nav">
      <button 
        className={`mobile-nav-item ${currentPage === 'home' ? 'active' : ''}`}
        onClick={() => onNavigate('home')}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button 
        className={`mobile-nav-item ${currentPage === 'shop' ? 'active' : ''}`}
        onClick={() => onNavigate('shop')}
      >
        <Compass size={20} />
        <span>Shop</span>
      </button>

      <button 
        className={`mobile-nav-item ${currentPage === 'wishlist' ? 'active' : ''} badge-container`}
        onClick={() => onNavigate('wishlist')}
      >
        <Heart size={20} />
        {wishlistCount > 0 && <span className="action-badge bg-primary">{wishlistCount}</span>}
        <span>Wishlist</span>
      </button>

      <button 
        className="mobile-nav-item badge-container"
        onClick={onOpenCart}
      >
        <ShoppingBag size={20} />
        {cartCount > 0 && <span className="action-badge bg-accent">{cartCount}</span>}
        <span>Cart</span>
      </button>

      <button 
        className="mobile-nav-item"
        onClick={onOpenAccount}
      >
        <User size={20} />
        <span>{currentUser ? 'Profile' : 'Account'}</span>
      </button>
    </div>
  );
}
