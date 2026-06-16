import React from 'react';
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
  onAddToCart,
  onQuickView,
  onNavigate
}) {
  const { id, name, price, salePrice, discount, rating, images, isNew } = product;
  const primaryImage = images[0];
  const hoverImage = images[1] || images[0];

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onWishlistToggle(product);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    <div className="product-card animate-zoom" onClick={() => onNavigate('product', null, false, false, id)}>
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
          <img src={hoverImage} alt={name} className="product-img-hover" loading="lazy" />
        </div>

        {/* Hover Action Bar */}
        <div className="product-actions-overlay">
          <button 
            className="product-overlay-btn" 
            onClick={handleQuickViewClick}
            title="Quick View"
          >
            <Eye size={18} />
            <span>Quick View</span>
          </button>
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
        
        <div className="product-price-row">
          <div className="prices-wrapper">
            <span className="current-price">₹{salePrice || price}</span>
            {salePrice && salePrice < price && (
              <span className="original-price">₹{price}</span>
            )}
          </div>

          <button 
            className="product-add-cart-btn" 
            onClick={handleAddToCartClick}
            title="Add to Cart"
          >
            <ShoppingCart size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
