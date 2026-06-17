import React, { useState } from 'react';
import { Trash2, ShoppingBag, Plus, Minus, Tag, ChevronRight } from 'lucide-react';

export default function CartPage({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
  activeCoupon,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  triggerAuthCheck
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + (price * item.quantity);
  }, 0);

  // Coupon Discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      let discVal = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount > 0 && discVal > appliedCoupon.maxDiscount) {
        discVal = appliedCoupon.maxDiscount;
      }
      discount = Math.round(discVal);
    } else if (appliedCoupon.type === 'fixed') {
      let discVal = appliedCoupon.value;
      if (discVal > subtotal) {
        discVal = subtotal;
      }
      discount = Math.round(discVal);
    }
  }

  // Shipping (Free above 1499, else 150)
  const shippingThreshold = 1499;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 150;
  const total = subtotal - discount + shippingCost;

  const handleApplyCouponClick = async (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const res = await onApplyCoupon(code);
    if (res && res.success) {
      setCouponInput('');
    } else {
      setCouponError(res ? res.error : 'Invalid coupon code.');
    }
  };

  const handleRemoveCouponClick = () => {
    onRemoveCoupon();
  };

  return (
    <div className="cart-page-container container">
      {/* Breadcrumb Row */}
      <nav className="breadcrumb-nav margin-bottom">
        <button onClick={() => onNavigate('home')}>Home</button>
        <ChevronRight size={12} className="breadcrumb-separator" />
        <span className="breadcrumb-active">Your Cart</span>
      </nav>

      <div className="section-header text-left">
        <h1 className="section-title">Shopping Bag</h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-state text-center" style={{ padding: '80px 20px' }}>
          <ShoppingBag size={64} className="empty-icon" style={{ marginBottom: '20px', color: 'var(--primary-light)' }} />
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any luxury pieces to your cart yet. Explore our premium collections to get started.</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => onNavigate('shop', 'sarees')}>
            Explore Collections
          </button>
        </div>
      ) : (
        <div className="cart-layout-grid">
          
          {/* Left: Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-header">
              <div className="header-cell item-info-cell">Product Details</div>
              <div className="header-cell item-price-cell">Price</div>
              <div className="header-cell item-quantity-cell">Quantity</div>
              <div className="header-cell item-total-cell">Total</div>
            </div>

            <div className="cart-items-flow">
              {cart.map((item, idx) => {
                const itemPrice = item.salePrice || item.price;
                return (
                  <div key={idx} className="cart-item-row">
                    
                    {/* Visual details */}
                    <div className="item-info-cell">
                      <div className="cart-item-visual">
                        <img src={item.images[0]} alt={item.name} />
                      </div>
                      <div className="cart-item-meta">
                        <h3 className="cart-item-name" onClick={() => onNavigate('product', null, false, false, item.id)}>
                          {item.name}
                        </h3>
                        <div className="cart-item-variants">
                          <span>Size: <strong>{item.selectedSize}</strong></span>
                          {item.selectedColor && (
                            <span>Color: <strong>{item.selectedColor}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="item-price-cell">
                      <span className="cart-unit-price">₹{itemPrice}</span>
                      {item.salePrice && item.salePrice < item.price && (
                        <span className="cart-unit-original-price">₹{item.price}</span>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="item-quantity-cell">
                      <div className="quantity-adjuster quantity-adjuster-small">
                        <button onClick={() => onUpdateQuantity(item, -1)}>
                          <Minus size={12} />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item, 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button className="remove-item-link-btn" onClick={() => onRemoveItem(item)}>
                        Remove
                      </button>
                    </div>

                    {/* Line total & Delete */}
                    <div className="item-total-cell">
                      <span className="cart-line-total">₹{itemPrice * item.quantity}</span>
                      <button 
                        className="cart-item-delete-btn" 
                        onClick={() => onRemoveItem(item)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Coupon Code Block */}
            <div className="cart-coupon-card">
              <h3>Have a Promotional Coupon?</h3>
              <p>Apply valid discount codes to claim exclusive savings on your checkout summary.</p>
              
              {activeCoupon ? (
                <div className="active-coupon-pill animate-fade">
                  <Tag size={16} className="coupon-icon" />
                  <span>Coupon <strong>{activeCoupon}</strong> Applied successfully!</span>
                  <button className="remove-coupon-btn" onClick={handleRemoveCouponClick}>Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponClick} className="coupon-apply-form">
                  <div className="coupon-input-box">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="form-input"
                    />
                    {couponError && <span className="coupon-error-text">{couponError}</span>}
                  </div>
                  <button type="submit" className="btn btn-dark">
                    Apply Code
                  </button>
                </form>
              )}
              
              <div className="coupon-helper-tips">
                <span>💡 Tip: Try coupons created via the Admin Dashboard (e.g. WELCOME10)</span>
              </div>
            </div>

          </div>

          {/* Right: Order Summary Sidebar */}
          <aside className="cart-summary-sidebar">
            <div className="summary-card">
              <h3 className="summary-card-title">Billing Summary</h3>
              
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Cart Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Coupon Discount ({activeCoupon})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping Cost</span>
                  <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
                </div>
                
                {shippingCost > 0 && (
                  <div className="shipping-threshold-banner">
                    <span>Add <strong>₹{shippingThreshold - subtotal}</strong> more to qualify for <strong>FREE EXPRESS SHIPPING</strong>!</span>
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button className="btn btn-primary btn-block checkout-proceed-btn" onClick={() => {
                triggerAuthCheck(() => {
                  try {
                    localStorage.removeItem('buyNowItem');
                  } catch (err) {
                    console.error(err);
                  }
                  onNavigate('checkout');
                }, "Please login to continue shopping.");
              }}>
                Proceed to Checkout
              </button>
              
              <div className="trust-badges-list">
                <p>🔒 SSL Encrypted checkout. Easy 15-day return policy.</p>
              </div>
            </div>
          </aside>

        </div>
      )}
    </div>
  );
}
