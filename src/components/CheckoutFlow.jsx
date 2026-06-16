import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, CreditCard, ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';

export default function CheckoutFlow({
  isOpen,
  onClose,
  cart,
  activeCoupon,
  onClearCart,
  onPlaceOrder,
  onNavigate
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // Steps: 1 = Shipping, 2 = Payment, 3 = Confirmation
  
  // Shipping fields
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Payment fields
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Calculations
  const subtotal = cart.reduce((total, item) => total + (item.salePrice || item.price) * item.quantity, 0);
  
  let discountPercentage = 0;
  if (activeCoupon === 'RIZA50') {
    discountPercentage = 50;
  } else if (activeCoupon === 'WELCOME10') {
    discountPercentage = 10;
  }

  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const grandTotal = subtotal - discountAmount + (subtotal - discountAmount >= 1499 ? 0 : 99);

  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    }
  };

  const handlePlaceOrderSubmit = (e) => {
    e.preventDefault();
    // Simulate placing order
    const orderId = `RIZA-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedOrderId(orderId);

    const orderDetails = {
      orderId,
      date: new Date().toISOString().split('T')[0],
      items: [...cart],
      shippingInfo: { ...shippingForm },
      totals: {
        subtotal,
        discountAmount,
        grandTotal
      },
      status: 'Ordered' // Timeline: Ordered -> Processing -> Shipped -> Out for Delivery -> Delivered
    };

    onPlaceOrder(orderId, orderDetails);
    onClearCart();
    setStep(3);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(generatedOrderId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTrackOrderClick = () => {
    onClose();
    onNavigate('tracking');
  };

  return (
    <div className="checkout-modal-wrapper">
      <div className="checkout-modal-overlay" onClick={onClose}></div>
      <div className="checkout-modal-container animate-zoom">
        
        {/* Header */}
        <div className="checkout-modal-header">
          <h3>Checkout</h3>
          <button className="checkout-close-btn" onClick={onClose} aria-label="Close checkout">
            <X size={22} />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="checkout-steps-indicator">
          <div className={`step-node ${step >= 1 ? 'active' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">Shipping</span>
          </div>
          <div className={`step-connector ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-node ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Payment</span>
          </div>
          <div className={`step-connector ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step-node ${step >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">Confirmation</span>
          </div>
        </div>

        {/* Body content */}
        <div className="checkout-modal-body">
          
          {step === 1 && (
            <div className="checkout-step-1-grid">
              
              {/* Form Col */}
              <form onSubmit={handleNextStep} className="checkout-shipping-form">
                <h4 className="checkout-subtitle">Shipping Information</h4>
                
                <div className="form-group-row">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-input"
                      placeholder="Jane Doe"
                      value={shippingForm.fullName}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-row grid-2-col">
                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="jane.doe@example.com"
                      value={shippingForm.email}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="9876543210"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-field">
                    <label>Address Details</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      placeholder="Flat, Building, Street address"
                      value={shippingForm.address}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-row grid-2-col">
                  <div className="form-field">
                    <label>City / Town</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      placeholder="Mumbai"
                      value={shippingForm.city}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Pincode / Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="form-input"
                      placeholder="400001"
                      value={shippingForm.postalCode}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>

                <div className="checkout-step-footer">
                  <button type="submit" className="btn btn-primary btn-next-step">
                    Continue to Payment
                    <ArrowRight size={18} />
                  </button>
                </div>

              </form>

              {/* Order Summary Sidebar Col */}
              <div className="checkout-summary-sidebar">
                <h4 className="sidebar-title">Order Summary</h4>
                <div className="sidebar-items-list">
                  {cart.map((item, idx) => (
                    <div key={idx} className="sidebar-item">
                      <img src={item.images[0]} alt={item.name} />
                      <div className="sidebar-item-info">
                        <h5>{item.name}</h5>
                        <span>Qty: {item.quantity} • Size: {item.selectedSize}</span>
                      </div>
                      <span className="sidebar-item-price">₹{(item.salePrice || item.price) * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <hr className="summary-divider" />
                <div className="sidebar-pricing">
                  <div className="sidebar-pricing-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="sidebar-pricing-row discount-row">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="sidebar-pricing-row">
                    <span>Shipping Fee</span>
                    <span>{subtotal - discountAmount >= 1499 ? 'FREE' : '₹99'}</span>
                  </div>
                  <hr className="summary-divider" />
                  <div className="sidebar-pricing-row total-row">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {step === 2 && (
            <form onSubmit={handlePlaceOrderSubmit} className="checkout-payment-form">
              <div className="checkout-step-1-grid">
                
                {/* Form Col */}
                <div className="payment-fields-wrapper">
                  <h4 className="checkout-subtitle">Secure Payment</h4>
                  <div className="secure-badge-row">
                    <ShieldCheck size={18} className="color-success" />
                    <span>Your transaction is encrypted and 100% secure.</span>
                  </div>

                  <div className="form-group-row">
                    <div className="form-field">
                      <label>Name on Card</label>
                      <input
                        type="text"
                        name="cardName"
                        className="form-input"
                        placeholder="Jane Doe"
                        value={paymentForm.cardName}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-field">
                      <label>Card Number</label>
                      <div className="card-input-wrapper">
                        <input
                          type="text"
                          name="cardNumber"
                          className="form-input card-number-input"
                          placeholder="4111 2222 3333 4444"
                          maxLength="19"
                          value={paymentForm.cardNumber}
                          onChange={handlePaymentChange}
                          required
                        />
                        <CreditCard size={18} className="card-input-icon" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group-row grid-2-col">
                    <div className="form-field">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        className="form-input"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={paymentForm.expiry}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>CVV / Security Code</label>
                      <input
                        type="password"
                        name="cvv"
                        className="form-input"
                        placeholder="•••"
                        maxLength="3"
                        value={paymentForm.cvv}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-step-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-back-step"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary btn-place-order">
                      Pay ₹{grandTotal} & Place Order
                    </button>
                  </div>
                </div>

                {/* Info Sidebar Col */}
                <div className="checkout-summary-sidebar bg-light">
                  <h4 className="sidebar-title">Billing Address</h4>
                  <div className="billing-details-preview">
                    <strong>{shippingForm.fullName}</strong>
                    <p>{shippingForm.address}</p>
                    <p>{shippingForm.city} - {shippingForm.postalCode}</p>
                    <p>Phone: {shippingForm.phone}</p>
                  </div>
                  
                  <hr className="summary-divider" />
                  <div className="sidebar-pricing-row total-row">
                    <span>Amount Due</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

              </div>
            </form>
          )}

          {step === 3 && (
            <div className="checkout-confirmation-wrapper animate-fade">
              <CheckCircle2 size={72} className="confirmation-success-icon" />
              <h2 className="confirmation-title">Thank You For Your Order!</h2>
              <p className="confirmation-subtitle">
                Your order has been placed successfully. A receipt and shipment confirmation have been sent to <strong>{shippingForm.email}</strong>.
              </p>

              {/* Order Tracking Code Display */}
              <div className="tracking-code-card">
                <span className="tracking-card-label">Order Tracking ID:</span>
                <div className="tracking-code-copier">
                  <code className="order-id-code">{generatedOrderId}</code>
                  <button className="order-copy-btn" onClick={handleCopyOrderId}>
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="tracking-card-help">
                  Copy this ID. You can enter this ID in the <strong>Order Tracking</strong> tab in the navigation menu to check your package shipment status live.
                </p>
              </div>

              <div className="confirmation-actions">
                <button className="btn btn-primary btn-confirm-track" onClick={handleTrackOrderClick}>
                  Track Your Order
                </button>
                <button className="btn btn-secondary btn-confirm-home" onClick={() => { onClose(); onNavigate('home'); }}>
                  Return to Home
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
