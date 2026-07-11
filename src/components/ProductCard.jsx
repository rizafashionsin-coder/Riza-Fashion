import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/cloudinary';

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
          <img src={getOptimizedImageUrl(primaryImage, 400)} alt={name} className="product-img-primary" loading="lazy" />
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

        {/* Share Link */}
        <ShareButton productId={id} productName={name} />
      </div>
    </div>
  );
}

function ShareButton({ productId, productName }) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = (e) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${productId}`;

    if (navigator.share) {
      navigator.share({
        title: productName,
        text: `Check out this product on Riza Fashions: ${productName}`,
        url: productUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(productUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Legacy fallback
        const el = document.createElement('textarea');
        el.value = productUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginTop: '8px',
        background: 'none',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px 10px',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        justifyContent: 'center'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.color = 'var(--primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.color = 'var(--text-muted)';
      }}
      title="Share this product"
    >
      {copied ? (
        <span>✅ Link Copied!</span>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>Share Link</span>
        </>
      )}
    </button>
  );
}
