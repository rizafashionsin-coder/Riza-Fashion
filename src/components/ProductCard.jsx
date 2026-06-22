import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
  onAddToCart,
  onNavigate
}) {
  const navigate = useNavigate();
  const { id, name, price, salePrice, discount, rating, images, isNew } = product;
  const primaryImage = images[0];

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate('product', null, false, false, id);
    } else {
      navigate(`/product/${id}`);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onWishlistToggle(product);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div className="product-card animate-zoom" onClick={handleCardClick}>
      {/* Image Gallery Wrapper */}
      <div className="product-image-container">
        {isNew && <span className="product-tag product-tag-new">New</span>}
        {discount > 0 && <span className="product-tag product-tag-sale">-{discount}%</span>}
        
        {/* Wishlist Button */}
        <button 
          className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "var(--primary)" : "none"} />
        </button>

        <div className="product-image-box">
          <img src={primaryImage} alt={name} className="product-img-primary" loading="lazy" />
        </div>
      </div>

      {/* Details Container */}
      <div className="product-info">
        {/* Rating stars */}
        <div className="product-rating">
          <Star size={12} fill="var(--accent)" stroke="var(--accent-dark)" />
          <span className="rating-value">{rating.toFixed(1)}</span>
        </div>

        <h3 className="product-name">{name}</h3>
        
        <div className="product-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
          <div className="prices-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="current-price" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--charcoal)' }}>₹{salePrice || price}</span>
              {salePrice && salePrice < price && (
                <span className="original-price" style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-light)' }}>₹{price}</span>
              )}
            </div>
            {salePrice && salePrice < price && (
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-dark)', fontWeight: 600 }}>
                Save ₹{price - salePrice} ({discount}% OFF)
              </span>
            )}
          </div>

          <button 
            className="product-add-cart-btn" 
            onClick={handleAddToCartClick}
            title="Add to Cart"
            style={{ flexShrink: 0 }}
          >
            <ShoppingCart size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
