import React, { useState, useEffect, useMemo } from 'react';
import { Star, Heart, ShoppingBag, Plus, Minus, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductDetailsPage({
  productId,
  products,
  wishlist,
  onWishlistToggle,
  onAddToCart,
  onNavigate,
  onAddReview,
  onQuickView
}) {
  // Find current product
  const product = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [products, productId]);

  // States
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Set default selections
  useEffect(() => {
    if (product) {
      setSelectedImageIdx(0);
      setSelectedSize(product.sizes[0] || 'Free Size');
      setSelectedColor(product.colors[0] || '');
      setQuantity(1);
      setReviewSubmitted(false);

      // Track recently viewed in localStorage
      try {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filtered = viewed.filter(id => id !== product.id);
        const updated = [product.id, ...filtered].slice(0, 5); // store up to 5 items
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch (err) {
        console.error("localStorage access failed:", err);
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container text-center" style={{ padding: '100px 20px' }}>
        <AlertCircle size={48} className="color-primary" style={{ marginBottom: '20px' }} />
        <h2>Product Not Found</h2>
        <p>The product you are trying to view does not exist or has been removed from our catalog.</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => onNavigate('home')}>
          Back to Home Page
        </button>
      </div>
    );
  }

  // Related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  // Recently viewed products
  const recentlyViewed = useMemo(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Map to full product objects, excluding current product
      return ids
        .map(id => products.find(p => p.id === id))
        .filter(p => p && p.id !== product.id)
        .slice(0, 4);
    } catch {
      return [];
    }
  }, [products, product]);

  // Zoom mouse hover handler
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setMousePos({ x, y });
  };

  const handleWishlistClick = () => {
    onWishlistToggle(product);
  };

  const handleAddToCartClick = () => {
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
  };

  const handleBuyNowClick = () => {
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
    onNavigate('checkout');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName || !reviewText) return;
    
    const newReview = {
      id: Date.now(),
      userName: reviewName,
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      text: reviewText
    };

    onAddReview(product.id, newReview);
    setReviewName('');
    setReviewText('');
    setReviewSubmitted(true);
  };

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const primaryImage = product.images[selectedImageIdx] || product.images[0];

  return (
    <div className="product-details-page">
      <div className="container">
        
        {/* Breadcrumb Row */}
        <nav className="breadcrumb-nav margin-bottom">
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={12} className="breadcrumb-separator" />
          <button onClick={() => onNavigate('shop', product.category)}>{product.category.toUpperCase()}</button>
          <ChevronRight size={12} className="breadcrumb-separator" />
          <span className="breadcrumb-active">{product.name}</span>
        </nav>

        {/* Gallery + Meta layout */}
        <div className="product-layout-grid">
          
          {/* Left: Gallery Column */}
          <div className="product-gallery-container">
            {/* Sidebar Thumbnails */}
            <div className="product-gallery-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`gallery-thumb-btn ${selectedImageIdx === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIdx(idx)}
                >
                  <img src={img} alt={`${product.name} View ${idx + 1}`} />
                </button>
              ))}
            </div>

            {/* Main Stage Image with Zoom */}
            <div 
              className="product-gallery-main"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <img 
                src={primaryImage} 
                alt={product.name} 
                className="main-gallery-img"
                style={{
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: isZooming ? 'scale(1.5)' : 'scale(1)'
                }}
              />
              {product.isNew && <span className="product-tag product-tag-new">New</span>}
              {product.discount > 0 && <span className="product-tag product-tag-sale">-{product.discount}%</span>}
            </div>
          </div>

          {/* Right: Buy Column */}
          <div className="product-meta-container animate-fade">
            <span className="meta-category">{product.category}</span>
            <h1 className="meta-title">{product.name}</h1>
            
            {/* Review and Stars row */}
            <div className="meta-reviews-summary">
              <div className="stars-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.round(product.rating) ? "var(--accent)" : "none"} 
                    stroke="var(--accent-dark)" 
                  />
                ))}
              </div>
              <span className="rating-avg-text">{product.rating.toFixed(1)}</span>
              <span className="review-count-divider">|</span>
              <a href="#reviews" className="reviews-link-jump">
                {product.reviews.length} Customer Reviews
              </a>
            </div>

            {/* Pricing Details */}
            <div className="meta-pricing-box">
              <div className="current-price-row">
                <span className="meta-current-price">₹{product.salePrice || product.price}</span>
                {product.salePrice && product.salePrice < product.price && (
                  <span className="meta-original-price">₹{product.price}</span>
                )}
              </div>
              {product.discount > 0 && (
                <span className="meta-discount-tag">Save ₹{product.price - product.salePrice} ({product.discount}% OFF)</span>
              )}
            </div>

            <p className="meta-short-description">{product.description}</p>

            {/* Variant options */}
            <div className="product-variants-section">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="variant-group">
                  <span className="variant-label">Color: <strong>{selectedColor}</strong></span>
                  <div className="variant-bubbles">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        className={`color-bubble-btn ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        style={{
                          backgroundColor: color.toLowerCase().includes('lavender') ? '#B06BB3' :
                                           color.toLowerCase().includes('rose') ? '#D8A7B1' :
                                           color.toLowerCase().includes('white') ? '#FFFFFF' :
                                           color.toLowerCase().includes('charcoal') ? '#2D2D2D' :
                                           color.toLowerCase().includes('lilac') ? '#E9D8EF' :
                                           color.toLowerCase().includes('wine') ? '#8E24AA' : '#DECFE5'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="variant-group">
                  <span className="variant-label">Size: <strong>{selectedSize}</strong></span>
                  <div className="variant-sizes">
                    {product.sizes.map((size, idx) => (
                      <button
                        key={idx}
                        className={`size-badge-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Counter */}
            <div className="meta-quantity-section">
              <span className="variant-label">Quantity:</span>
              <div className="quantity-adjuster">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="meta-actions-grid">
              <button className="btn btn-primary" onClick={handleAddToCartClick}>
                <ShoppingBag size={18} />
                <span>Add to Cart</span>
              </button>
              
              <button className="btn btn-accent" onClick={handleBuyNowClick}>
                <span>Buy Now</span>
              </button>
              
              <button 
                className={`details-wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistClick}
                aria-label={isWishlisted ? "Remove from closet" : "Save in closet"}
              >
                <Heart size={20} fill={isWishlisted ? "var(--primary)" : "none"} />
              </button>
            </div>

            {/* Assurances highlights */}
            <div className="meta-specifications-box">
              {product.details && product.details.length > 0 && (
                <div className="details-highlights">
                  <h4>Product Specifications</h4>
                  <ul className="spec-list">
                    {product.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Reviews Section */}
        <section id="reviews" className="product-reviews-section section">
          <div className="section-header text-left">
            <h2 className="section-title">Client Reviews ({product.reviews.length})</h2>
          </div>

          <div className="reviews-layout-grid">
            {/* Left: Review List */}
            <div className="reviews-list-pane">
              {product.reviews.length === 0 ? (
                <div className="no-reviews-state">
                  <MessageSquare size={32} className="color-light" />
                  <p>No client reviews written yet. Be the first to express your thoughts on this statement piece.</p>
                </div>
              ) : (
                <div className="reviews-flow-list">
                  {product.reviews.map(rev => (
                    <div key={rev.id} className="review-card-item">
                      <div className="review-header-info">
                        <div className="reviewer-meta">
                          <span className="reviewer-name">{rev.userName}</span>
                          <span className="review-date">{rev.date}</span>
                        </div>
                        <div className="stars-row">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i < rev.rating ? "var(--accent)" : "none"} 
                              stroke="var(--accent-dark)" 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment-text">{rev.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Review Form */}
            <div className="reviews-form-pane">
              <div className="reviews-form-card">
                <h3>Submit A Review</h3>
                
                {reviewSubmitted ? (
                  <div className="review-success-panel animate-fade">
                    <p>Thank you! Your feedback has been received and added to this product's client catalog.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="review-mock-form">
                    <div className="form-field">
                      <label>Your Rating Score</label>
                      <div className="rating-select-stars">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const starVal = i + 1;
                          return (
                            <button
                              key={i}
                              type="button"
                              className="star-btn"
                              onClick={() => setReviewRating(starVal)}
                            >
                              <Star 
                                size={20} 
                                fill={starVal <= reviewRating ? "var(--accent)" : "none"} 
                                stroke="var(--accent-dark)" 
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Your Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Maya Iyer"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Review Description</label>
                      <textarea
                        className="form-input"
                        rows="4"
                        placeholder="Tell us about the drape comfort, sizing fits, and colors..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-dark btn-block">
                      Publish Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="product-suggestions-section section">
            <div className="section-header text-left">
              <h2 className="section-title">Related Statements</h2>
            </div>
            <div className="product-grid">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlist.some(item => item.id === p.id)}
                  onWishlistToggle={onWishlistToggle}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Products Grid */}
        {recentlyViewed.length > 0 && (
          <section className="product-suggestions-section section bg-secondary" style={{ borderRadius: 'var(--radius-lg)', padding: '40px 20px' }}>
            <div className="section-header text-left">
              <h2 className="section-title">Recently Viewed</h2>
            </div>
            <div className="product-grid">
              {recentlyViewed.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlist.some(item => item.id === p.id)}
                  onWishlistToggle={onWishlistToggle}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
