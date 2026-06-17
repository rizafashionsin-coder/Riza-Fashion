import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, Check } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  activeCoupon,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  // Calculations
  const subtotal = cart.reduce((total, item) => total + (item.salePrice || item.price) * item.quantity, 0);
  
  let discountAmount = 0;
  let couponLabel = '';
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      let discVal = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount > 0 && discVal > appliedCoupon.maxDiscount) {
        discVal = appliedCoupon.maxDiscount;
      }
      discountAmount = Math.round(discVal);
      couponLabel = `${appliedCoupon.value}% OFF`;
    } else if (appliedCoupon.type === 'fixed') {
      let discVal = appliedCoupon.value;
      if (discVal > subtotal) {
        discVal = subtotal;
      }
      discountAmount = Math.round(discVal);
      couponLabel = `₹${appliedCoupon.value} OFF`;
    }
  }

  const shippingThreshold = 1499;
  const shippingFee = subtotal > 0 && (subtotal - discountAmount) >= shippingThreshold ? 0 : 99;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleApplyCouponSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;
    const res = await onApplyCoupon(cleanCode);
    if (res && res.success) {
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError(res ? res.error : 'Invalid coupon code');
    }
  };

  const handleRemoveCouponClick = () => {
    onRemoveCoupon();
    setCouponError('');
  };

  return (
    <div className="cart-drawer-wrapper">
      <div className="cart-drawer-overlay" onClick={onClose}></div>
      <div className="cart-drawer-container animate-slide-in-right">
        
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="header-title-row">
            <ShoppingBag size={20} className="color-primary" />
            <h3>Your Cart</h3>
            <span className="cart-badge bg-primary">{cart.length}</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        {/* Content body */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBag size={64} className="empty-icon" />
              <h4>Your Cart is Empty</h4>
              <p>Looks like you haven't added any products to your cart yet. Discover elegance crafted for every woman.</p>
              <button 
                className="btn btn-primary btn-empty-cart-shop"
                onClick={() => {
                  onClose();
                  onCheckout('shop'); // navigates to shop
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-scroller">
              {cart.map((item, idx) => {
                const itemPrice = item.salePrice || item.price;
                return (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="cart-item">
                    
                    {/* Item Image */}
                    <div className="cart-item-img-box">
                      <img src={item.images[0]} alt={item.name} />
                    </div>

                    {/* Item Info */}
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      
                      <div className="cart-item-variants">
                        {item.selectedSize && (
                          <span className="variant-badge">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="variant-badge">Color: {item.selectedColor}</span>
                        )}
                      </div>

                      <div className="cart-item-price-row">
                        <span className="item-price">₹{itemPrice}</span>
                        
                        {/* Qty adjusters */}
                        <div className="cart-qty-selector">
                          <button 
                            onClick={() => onUpdateQuantity(item, -1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="cart-qty-value">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item, 1)}
                            disabled={item.quantity >= 10}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Trash Button */}
                    <button 
                      className="cart-item-remove-btn" 
                      onClick={() => onRemoveItem(item)}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions summary */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            
            {/* Coupon Code Section */}
            <div className="cart-coupon-section">
              {activeCoupon ? (
                <div className="active-coupon-pill animate-fade">
                  <div className="coupon-left">
                    <Tag size={14} className="coupon-icon-active" />
                    <span>Coupon <strong>{activeCoupon}</strong> applied ({couponLabel})</span>
                  </div>
                  <button className="remove-coupon-btn" onClick={handleRemoveCouponClick}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="coupon-form">
                  <input
                    type="text"
                    className="form-input coupon-input"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" className="coupon-apply-submit">Apply</button>
                </form>
              )}
              {couponError && <p className="coupon-error-text animate-slide-down">{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div className="cart-pricing-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Shipping Fee</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="shipping-free text-success">FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              
              {shippingFee > 0 && (
                <p className="shipping-upsell-text">
                  Add <strong>₹{shippingThreshold - (subtotal - discountAmount)}</strong> more to unlock <strong>FREE SHIPPING!</strong>
                </p>
              )}

              <hr className="summary-divider" />

              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="cart-footer-actions">
              <button className="btn btn-primary checkout-btn" onClick={onCheckout}>
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>
              <button className="continue-shopping-btn" onClick={onClose}>
                Continue Shopping
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
