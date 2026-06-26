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

  // Filter sizes based on selected color's available sizes from variants matrix
  const validSizes = React.useMemo(() => {
    if (!product) return [];
    if (product.variants && Array.isArray(product.variants)) {
      const variant = product.variants.find(v => v.colorName === selectedColor);
      return variant && variant.sizes ? Object.keys(variant.sizes) : [];
    }
    // Backward compatibility fallback
    const colObj = product.colors?.find(c => (typeof c === 'string' ? c : c.name) === selectedColor);
    if (colObj && colObj.sizes) {
      return (product.sizes || []).filter(sz => colObj.sizes.includes(sz));
    }
    return product.sizes || [];
  }, [product, selectedColor]);

  // Selected size's live stock quantity
  const selectedVariantStock = React.useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return 0;
    if (product.variants && Array.isArray(product.variants)) {
      const variant = product.variants.find(v => v.colorName === selectedColor);
      return variant && variant.sizes && variant.sizes[selectedSize] !== undefined ? variant.sizes[selectedSize] : 0;
    }
    // Backward compatibility fallback
    return product.sizeStock && product.sizeStock[selectedSize] !== undefined ? product.sizeStock[selectedSize] : 0;
  }, [product, selectedColor, selectedSize]);

  // Selected variant-specific title / name
  const currentTitle = React.useMemo(() => {
    if (!product) return '';
    if (product.variants && Array.isArray(product.variants) && selectedColor) {
      const variant = product.variants.find(v => v.colorName === selectedColor);
      if (variant && variant.name) {
        return variant.name;
      }
    }
    return product.name || '';
  }, [product, selectedColor]);

  // Selected variant-specific description
  const currentDescription = React.useMemo(() => {
    if (!product) return '';
    if (product.variants && Array.isArray(product.variants) && selectedColor) {
      const variant = product.variants.find(v => v.colorName === selectedColor);
      if (variant && variant.description) {
        return variant.description;
      }
    }
    return product.description || '';
  }, [product, selectedColor]);

  // Selected variant-specific specifications / details
  const currentDetails = React.useMemo(() => {
    if (!product) return [];
    if (product.variants && Array.isArray(product.variants) && selectedColor) {
      const variant = product.variants.find(v => v.colorName === selectedColor);
      if (variant && variant.details && variant.details.length > 0) {
        return variant.details;
      }
    }
    return product.details || [];
  }, [product, selectedColor]);

  // Handle color change (image swap + auto-adjust sizes)
  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    if (product.variants && Array.isArray(product.variants)) {
      const variant = product.variants.find(v => v.colorName === colorName);
      if (variant) {
        if (variant.imageIndex !== undefined && variant.imageIndex !== -1 && product.images[variant.imageIndex]) {
          setActiveImageIdx(variant.imageIndex);
        }
        const nextValidSizes = variant.sizes ? Object.keys(variant.sizes) : [];
        if (nextValidSizes.length > 0) {
          if (!nextValidSizes.includes(selectedSize)) {
            setSelectedSize(nextValidSizes[0]);
          }
        } else {
          setSelectedSize('');
        }
      }
    } else {
      // Backward compatibility fallback
      const colObj = product.colors?.find(c => (typeof c === 'string' ? c : c.name) === colorName);
      if (colObj) {
        if (colObj.imageIndex !== undefined && colObj.imageIndex !== -1 && product.images[colObj.imageIndex]) {
          setActiveImageIdx(colObj.imageIndex);
        }
        const nextValidSizes = colObj.sizes 
          ? (product.sizes || []).filter(sz => colObj.sizes.includes(sz))
          : product.sizes || [];
        if (nextValidSizes.length > 0) {
          if (!nextValidSizes.includes(selectedSize)) {
            setSelectedSize(nextValidSizes[0]);
          }
        } else {
          setSelectedSize('');
        }
      }
    }
  };

  // Handle thumbnail image click and auto-adjust color variant
  const handleImageChange = (idx) => {
    setActiveImageIdx(idx);
    
    // Find a variant that matches the selected image index
    if (product.variants && Array.isArray(product.variants)) {
      const matchingVariant = product.variants.find(v => v.imageIndex === idx);
      if (matchingVariant) {
        setSelectedColor(matchingVariant.colorName);
        const nextValidSizes = matchingVariant.sizes ? Object.keys(matchingVariant.sizes) : [];
        if (nextValidSizes.length > 0) {
          if (!nextValidSizes.includes(selectedSize)) {
            setSelectedSize(nextValidSizes[0]);
          }
        } else {
          setSelectedSize('');
        }
      }
    } else if (product.colors && Array.isArray(product.colors)) {
      // Backward compatibility fallback
      const matchingCol = product.colors.find(c => (typeof c === 'object' && c.imageIndex === idx));
      if (matchingCol) {
        const colName = typeof matchingCol === 'string' ? matchingCol : matchingCol.name;
        setSelectedColor(colName);
        const nextValidSizes = matchingCol.sizes 
          ? (product.sizes || []).filter(sz => matchingCol.sizes.includes(sz))
          : product.sizes || [];
        if (nextValidSizes.length > 0) {
          if (!nextValidSizes.includes(selectedSize)) {
            setSelectedSize(nextValidSizes[0]);
          }
        } else {
          setSelectedSize('');
        }
      }
    }
  };

  // Reset local selections when product changes
  useEffect(() => {
    setActiveImageIdx(0);
    
    let initialColor = '';
    if (product.variants && product.variants.length > 0) {
      initialColor = product.variants[0].colorName;
    } else if (product.colors && product.colors.length > 0) {
      initialColor = typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name;
    }
    setSelectedColor(initialColor);

    let initialValidSizes = [];
    if (product.variants && Array.isArray(product.variants)) {
      const variant = product.variants.find(v => v.colorName === initialColor);
      initialValidSizes = variant && variant.sizes ? Object.keys(variant.sizes) : [];
    } else {
      const colObj = product.colors?.find(c => (typeof c === 'string' ? c : c.name) === initialColor);
      initialValidSizes = (colObj && colObj.sizes)
        ? (product.sizes || []).filter(sz => colObj.sizes.includes(sz))
        : product.sizes || [];
    }

    const initialSize = (initialValidSizes && initialValidSizes.length > 0) ? initialValidSizes[0] : 'Free Size';
    setSelectedSize(initialSize);
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
      variantStock: selectedVariantStock,
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
                    onClick={() => handleImageChange(idx)}
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
            <h2 className="details-title">{currentTitle}</h2>
            
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
            <div className="details-price-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="details-current-price">₹{product.salePrice || product.price}</span>
                {product.salePrice && product.salePrice < product.price && (
                  <>
                    <span className="details-original-price" style={{ textDecoration: 'line-through', color: 'var(--text-light)' }}>₹{product.price}</span>
                    <span className="details-discount-pill" style={{ background: 'var(--accent)', color: 'var(--charcoal)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{product.discount}% OFF</span>
                  </>
                )}
              </div>
              {product.salePrice && product.salePrice < product.price && (
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-dark)', fontWeight: 600 }}>
                  Save ₹{product.price - product.salePrice}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="details-description">{currentDescription}</p>

            {/* Specifications bullet points */}
            {currentDetails && currentDetails.length > 0 && (
              <ul className="details-bullets">
                {currentDetails.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            )}

            {/* Product Variants Pickers */}
            <div className="variants-container">
              {/* Color Selection */}
              {((product.variants && product.variants.length > 0) || (product.colors && product.colors.length > 0)) && (
                <div className="variant-group">
                  <span className="variant-label">Color: <strong>{selectedColor}</strong></span>
                  <div className="color-swatches">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.map((v, idx) => (
                        <button
                          key={idx}
                          className={`color-swatch-btn ${selectedColor === v.colorName ? 'active' : ''}`}
                          onClick={() => handleColorChange(v.colorName)}
                          title={v.colorName}
                        >
                          <span 
                            className="swatch-color"
                            style={{ backgroundColor: v.colorCode || '#DECFE5' }}
                          />
                        </button>
                      ))
                    ) : (
                      product.colors.map((col, idx) => {
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
                            onClick={() => handleColorChange(colorName)}
                            title={colorName}
                          >
                            <span 
                              className="swatch-color"
                              style={{ backgroundColor: colorCode }}
                            />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {validSizes && validSizes.length > 0 && (
                <div className="variant-group">
                  <span className="variant-label">Size: <strong>{selectedSize}</strong></span>
                  <div className="size-pills">
                    {validSizes.map((size, idx) => {
                      let isOutOfStock = false;
                      if (product.variants && Array.isArray(product.variants)) {
                        const variant = product.variants.find(v => v.colorName === selectedColor);
                        isOutOfStock = variant && variant.sizes && variant.sizes[size] !== undefined ? variant.sizes[size] === 0 : false;
                      } else {
                        isOutOfStock = product.sizeStock && product.sizeStock[size] === 0;
                      }
                      return (
                        <button
                          key={idx}
                          className={`size-pill-btn ${selectedSize === size ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          disabled={isOutOfStock}
                          style={isOutOfStock ? { opacity: 0.4, textDecoration: 'line-through', cursor: 'not-allowed' } : {}}
                        >
                          {size} {isOutOfStock ? <span style={{ fontSize: '0.65rem', marginLeft: '4px', opacity: 0.8 }}>(Out of Stock)</span> : ''}
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

              <button 
                className="btn btn-primary details-cart-cta" 
                onClick={handleAddCart} 
                disabled={selectedVariantStock === 0}
                style={selectedVariantStock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                aria-label="Add this product to shopping cart"
              >
                <ShoppingBag size={18} />
                {selectedVariantStock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
          <button 
            className="btn btn-primary btn-sticky-add" 
            onClick={handleAddCart}
            disabled={selectedVariantStock === 0}
            style={selectedVariantStock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {selectedVariantStock === 0 ? 'Out of Stock' : 'Add To Cart'}
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
