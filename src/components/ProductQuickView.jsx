import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Heart, ShoppingBag, Plus, Minus, Send, Check } from 'lucide-react';

export default function ProductQuickView({
  product,
  onClose,
  onAddToCart,
  allProducts,
  onQuickView,
  isWishlisted,
  onWishlistToggle,
  onAddReview // persists review additions in parent state
}) {
  if (!product) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const modalRef = useRef(null);

  // Reset local selections when product changes
  useEffect(() => {
    setActiveImageIdx(0);
    const initialSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Free Size';
    setSelectedSize(initialSize);

    const initialColor = (product.colors && product.colors.length > 0) 
      ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name)
      : '';
    setSelectedColor(initialColor);
    setQuantity(1);
    setFormSuccess(false);
    setReviewName('');
    setReviewRating(5);
    setReviewText('');
    
    // Auto-scroll modal to top
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [product]);

  // Click outside to close modal
  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  const handleQuantityChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= 10) {
      setQuantity(newQty);
    }
  };

  const handleAddReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName || !reviewText) return;

    const newReview = {
      id: Date.now(),
      userName: reviewName,
      rating: Number(reviewRating),
      date: new Date().toISOString().split('T')[0],
      text: reviewText
    };

    onAddReview(product.id, newReview);
    setFormSuccess(true);
    
    // Clear fields
    setReviewName('');
    setReviewRating(5);
    setReviewText('');

    setTimeout(() => {
      setFormSuccess(false);
    }, 4000);
  };

  // Find related products in same category (exclude current)
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container" ref={modalRef}>
        
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close details">
          <X size={24} />
        </button>

        <div className="modal-body-grid">
          {/* Column 1: Images */}
          <div className="modal-images-col">
            <div className="modal-main-image">
              <img 
                src={product.images[activeImageIdx]} 
                alt={product.name} 
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="modal-thumbnails">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-btn ${activeImageIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Details */}
          <div className="modal-details-col">
            <span className="details-category-tag">{product.category.toUpperCase()}</span>
            <h2 className="details-title">{product.name}</h2>
            
            {/* Ratings Header */}
            <div className="details-rating-row">
              <div className="details-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    fill={star <= Math.round(product.rating) ? "var(--accent)" : "none"}
                    stroke={star <= Math.round(product.rating) ? "var(--accent-dark)" : "var(--border-medium)"}
                  />
                ))}
              </div>
              <span className="details-rating-avg">{product.rating.toFixed(1)} / 5</span>
              <span className="details-rating-count">({product.reviews.length} customer reviews)</span>
            </div>

            {/* Pricing */}
            <div className="details-price-row">
              <span className="details-current-price">₹{product.salePrice || product.price}</span>
              {product.salePrice && product.salePrice < product.price && (
                <>
                  <span className="details-original-price">₹{product.price}</span>
                  <span className="details-discount-pill">{product.discount}% OFF</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="details-description">{product.description}</p>

            {/* Specifications bullet points */}
            <ul className="details-bullets">
              {product.details.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>

            {/* Product Variants Pickers */}
            <div className="variants-container">
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="variant-group">
                  <span className="variant-label">Color: <strong>{selectedColor}</strong></span>
                  <div className="color-swatches">
                    {product.colors.map((col, idx) => {
                      const colorName = typeof col === 'string' ? col : col.name;
                      const colorCode = typeof col === 'string' ? (
                        col.toLowerCase().includes('lavender') ? '#B06BB3' :
                        col.toLowerCase().includes('rose') ? '#D4A5A5' :
                        col.toLowerCase().includes('white') ? '#FFFFFF' :
                        col.toLowerCase().includes('charcoal') ? '#2D2D2D' :
                        col.toLowerCase().includes('lilac') ? '#E9D8EF' :
                        col.toLowerCase().includes('wine') ? '#8E24AA' : '#DECFE5'
                      ) : col.code;

                      return (
                        <button
                          key={idx}
                          className={`color-swatch-btn ${selectedColor === colorName ? 'active' : ''}`}
                          onClick={() => setSelectedColor(colorName)}
                          title={colorName}
                        >
                          <span 
                            className="swatch-color"
                            style={{ backgroundColor: colorCode }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="variant-group">
                  <span className="variant-label">Size: <strong>{selectedSize}</strong></span>
                  <div className="size-pills">
                    {product.sizes.map((size, idx) => {
                      const isOutOfStock = product.sizeStock && product.sizeStock[size] === 0;
                      return (
                        <button
                          key={idx}
                          className={`size-pill-btn ${selectedSize === size ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          disabled={isOutOfStock}
                          style={isOutOfStock ? { opacity: 0.4, textDecoration: 'line-through', cursor: 'not-allowed' } : {}}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar: Qty + Cart + Wishlist */}
            <div className="details-actions-bar">
              <div className="qty-selector">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} aria-label="Decrease quantity">
                  <Minus size={14} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= 10} aria-label="Increase quantity">
                  <Plus size={14} />
                </button>
              </div>

              <button className="btn btn-primary details-cart-cta" onClick={handleAddCart} aria-label="Add this product to shopping cart">
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <button
                className={`details-wishlist-cta ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistClick}
                aria-label="Add to Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? "var(--primary)" : "none"} />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Sticky Add To Cart - bottom anchor for mobile drapes */}
        <div className="mobile-sticky-action-bar">
          <div className="sticky-info">
            <span className="sticky-title">{product.name}</span>
            <span className="sticky-price">₹{product.salePrice || product.price}</span>
          </div>
          <button className="btn btn-primary btn-sticky-add" onClick={handleAddCart}>
            Add To Cart
          </button>
        </div>

        {/* Reviews Section */}
        <div className="modal-reviews-section">
          <hr className="section-divider" />
          <h3 className="reviews-section-title">Customer Reviews</h3>
          
          <div className="reviews-grid">
            {/* Left: Reviews List */}
            <div className="reviews-list-col">
              {product.reviews.length === 0 ? (
                <p className="no-reviews-text">No reviews yet. Be the first to share your thoughts!</p>
              ) : (
                <div className="reviews-scroller">
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="review-item animate-fade">
                      <div className="review-item-header">
                        <strong className="review-author">{rev.userName}</strong>
                        <span className="review-date">{rev.date}</span>
                      </div>
                      
                      <div className="review-item-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={12} 
                            fill={star <= rev.rating ? "var(--accent)" : "none"} 
                            stroke={star <= rev.rating ? "var(--accent-dark)" : "var(--border-medium)"} 
                          />
                        ))}
                      </div>
                      <p className="review-text">{rev.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Write Review Form */}
            <div className="reviews-form-col">
              <h4 className="form-title">Write a Review</h4>
              {formSuccess ? (
                <div className="form-success-alert animate-fade">
                  <Check size={20} />
                  <span>Thank you! Your review has been added.</span>
                </div>
              ) : (
                <form onSubmit={handleAddReviewSubmit} className="review-form">
                  <div className="form-row">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Ayesha Sharma"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Rating</label>
                    <div className="stars-input-container">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className="star-input-btn"
                          onClick={() => setReviewRating(num)}
                          title={`${num} Stars`}
                        >
                          <Star 
                            size={20} 
                            fill={num <= reviewRating ? "var(--accent)" : "none"} 
                            stroke={num <= reviewRating ? "var(--accent-dark)" : "var(--border-medium)"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Review details</label>
                    <textarea
                      rows="3"
                      className="form-input text-area-input"
                      placeholder="Tell us about the fabric, drape, size, and fit..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-dark btn-submit-review">
                    <Send size={14} />
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="modal-related-section">
            <hr className="section-divider" />
            <h3 className="related-section-title">You May Also Like</h3>
            
            <div className="related-products-grid">
              {relatedProducts.map((relProduct) => (
                <div 
                  key={relProduct.id} 
                  className="related-item-card"
                  onClick={() => onQuickView(relProduct)}
                >
                  <div className="related-img-box">
                    <img src={relProduct.images[0]} alt={relProduct.name} />
                  </div>
                  <div className="related-info">
                    <h4 className="related-name">{relProduct.name}</h4>
                    <span className="related-price">₹{relProduct.salePrice || relProduct.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
