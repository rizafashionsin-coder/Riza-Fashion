import React, { useState, useEffect, useMemo } from 'react';
import { Star, Heart, ShoppingBag, Plus, Minus, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import ProductCard from './ProductCard';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getOptimizedImageUrl } from '../utils/cloudinary';

export default function ProductDetailsPage({
  productId,
  products,
  wishlist,
  onWishlistToggle,
  onAddToCart,
  onNavigate,
  onAddReview,
  triggerAuthCheck
}) {
  // Find current product from Firestore directly using product ID
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoadingProduct(true);
    const docRef = doc(db, 'products', productId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      } else {
        setProduct(null);
      }
      setLoadingProduct(false);
    }, (err) => {
      console.error("Failed to load product from Firestore:", err);
      setProduct(null);
      setLoadingProduct(false);
    });
    return () => unsubscribe();
  }, [productId]);

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

  // Filter sizes based on selected color's available sizes from variants matrix
  const validSizes = useMemo(() => {
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
  // Selected size's live stock quantity
  const selectedVariantStock = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return 0;
    if (product.variants && Array.isArray(product.variants)) {
      const variant = product.variants.find(v => v.colorName === selectedColor);
      return variant && variant.sizes && variant.sizes[selectedSize] !== undefined ? variant.sizes[selectedSize] : 0;
    }
    // Backward compatibility fallback
    return product.sizeStock && product.sizeStock[selectedSize] !== undefined ? product.sizeStock[selectedSize] : 0;
  }, [product, selectedColor, selectedSize]);

  // Selected variant-specific title / name
  const currentTitle = useMemo(() => {
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
  const currentDescription = useMemo(() => {
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
  const currentDetails = useMemo(() => {
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
        if (variant.imageIndices && Array.isArray(variant.imageIndices) && variant.imageIndices.length > 0) {
          setSelectedImageIdx(variant.imageIndices[0]);
        } else if (variant.imageIndex !== undefined && variant.imageIndex !== -1 && product.images[variant.imageIndex]) {
          setSelectedImageIdx(variant.imageIndex);
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
          setSelectedImageIdx(colObj.imageIndex);
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
    setSelectedImageIdx(idx);
    
    // Find a variant that matches the selected image index
    if (product.variants && Array.isArray(product.variants)) {
      const matchingVariant = product.variants.find(v => {
        if (v.imageIndices && Array.isArray(v.imageIndices)) {
          return v.imageIndices.includes(idx);
        }
        return v.imageIndex === idx;
      });
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

  // Set default selections
  useEffect(() => {
    if (product) {
      setSelectedImageIdx(0);
      
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

      // Meta Pixel ViewContent event tracking
      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: product.name,
          content_ids: [product.id],
          content_type: 'product',
          value: product.salePrice || product.price || 0,
          currency: 'INR'
        });
      }
    }
  }, [product]);

  // Related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  // Recently viewed products
  const recentlyViewed = useMemo(() => {
    if (!product) return [];
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

  // Display all product images in the gallery so users can see all options and click any image to swap colors
  const displayImages = useMemo(() => {
    if (!product) return [];
    return (product.images || []).map((img, idx) => ({ url: img, originalIdx: idx }));
  }, [product]);

  // Keep selectedImageIdx in sync when displayImages changes
  useEffect(() => {
    if (displayImages && displayImages.length > 0) {
      const isCurrentIdxValid = displayImages.some(imgItem => imgItem.originalIdx === selectedImageIdx);
      if (!isCurrentIdxValid) {
        setSelectedImageIdx(displayImages[0].originalIdx);
      }
    }
  }, [displayImages, selectedImageIdx]);

  if (loadingProduct) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

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
      variantStock: selectedVariantStock,
      quantity
    });
  };

  const handleBuyNowClick = () => {
    triggerAuthCheck(() => {
      const buyNowInfo = {
        id: product.id,
        selectedSize,
        selectedColor,
        variantStock: selectedVariantStock,
        quantity
      };
      try {
        localStorage.setItem('buyNowItem', JSON.stringify(buyNowInfo));
      } catch (err) {
        console.error(err);
      }
      onAddToCart({
        ...product,
        selectedSize,
        selectedColor,
        variantStock: selectedVariantStock,
        quantity
      });
      onNavigate('checkout');
    }, "Please login to continue shopping.");
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

  // (displayImages and its useEffect moved above early returns — see top of hooks section)

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
              {displayImages.map((imgItem, index) => (
                <button
                  key={index}
                  className={`gallery-thumb-btn ${selectedImageIdx === imgItem.originalIdx ? 'active' : ''}`}
                  onClick={() => handleImageChange(imgItem.originalIdx)}
                >
                  <img src={getOptimizedImageUrl(imgItem.url, 150)} alt={`${product.name} View ${index + 1}`} />
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
                src={getOptimizedImageUrl(primaryImage, 800)} 
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
            <h1 className="meta-title">{currentTitle}</h1>
            
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

            <p className="meta-short-description">{currentDescription}</p>

            {/* Variant options */}
            <div className="product-variants-section">
              {/* Colors */}
              {((product.variants && product.variants.length > 0) || (product.colors && product.colors.length > 0)) && (
                <div className="variant-group">
                  <span className="variant-label">Color: <strong>{selectedColor}</strong></span>
                  <div className="variant-bubbles">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.map((v, idx) => (
                        <button
                          key={idx}
                          className={`color-bubble-btn ${selectedColor === v.colorName ? 'active' : ''}`}
                          onClick={() => handleColorChange(v.colorName)}
                          title={v.colorName}
                          style={{ backgroundColor: v.colorCode || '#DECFE5' }}
                        />
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
                            className={`color-bubble-btn ${selectedColor === colorName ? 'active' : ''}`}
                            onClick={() => handleColorChange(colorName)}
                            title={colorName}
                            style={{ backgroundColor: colorCode }}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {validSizes && validSizes.length > 0 && (
                <div className="variant-group">
                  <span className="variant-label">Size: <strong>{selectedSize}</strong></span>
                  <div className="variant-sizes">
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
                          className={`size-badge-btn ${selectedSize === size ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
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
              <button 
                className="btn btn-primary" 
                onClick={handleAddToCartClick}
                disabled={selectedVariantStock === 0}
                style={selectedVariantStock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                <ShoppingBag size={18} />
                <span>{selectedVariantStock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
              
              <button 
                className="btn btn-accent" 
                onClick={handleBuyNowClick}
                disabled={selectedVariantStock === 0}
                style={selectedVariantStock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
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
              {currentDetails && currentDetails.length > 0 && (
                <div className="details-highlights">
                  <h4>Product Specifications</h4>
                  <ul className="spec-list">
                    {currentDetails.map((detail, idx) => (
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
