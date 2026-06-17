import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, CreditCard, ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';
import { auth } from '../firebase';

export default function CheckoutFlow({
  isOpen,
  onClose,
  cart,
  activeCoupon,
  onClearCart,
  onPlaceOrder,
  onNavigate,
  deliverySettings
}) {
  if (!isOpen) return null;

  const tnDistrictsList = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
    "Vellore", "Viluppuram", "Virudhunagar"
  ];

  const [step, setStep] = useState(1); // Steps: 1 = Shipping, 2 = Payment, 3 = Confirmation
  
  // Shipping fields
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

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
  
  const shippingThreshold = deliverySettings ? (deliverySettings.freeShippingThreshold || 1499) : 1499;

  const shippingFee = (() => {
    const totalBeforeShipping = subtotal - discountAmount;
    if (totalBeforeShipping >= shippingThreshold || totalBeforeShipping === 0) return 0;

    const stateVal = shippingForm.state || '';
    const cityVal = shippingForm.city || '';

    const isTN = stateVal.trim().toLowerCase() === 'tamil nadu' || stateVal.trim().toLowerCase() === 'tamilnadu';
    if (isTN) {
      const selectedDistrict = cityVal.trim().toLowerCase();
      if (deliverySettings && deliverySettings.charges && deliverySettings.charges[selectedDistrict] !== undefined) {
        return Number(deliverySettings.charges[selectedDistrict]);
      }
      return 90; // Fallback district shipping fee
    }

    return deliverySettings ? (deliverySettings.defaultCharge || 150) : 150;
  })();

  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    }
  };

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    // Verify user is authenticated before opening Razorpay
    if (!auth.currentUser) {
      alert("Please login to complete your payment and order.");
      setIsProcessing(false);
      onClose();
      onNavigate('home');
      return;
    }

    // Simulate placing order
    const orderId = `RIZA-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedOrderId(orderId);

    const baseOrderDetails = {
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

    console.log("VITE_RAZORPAY_KEY_ID:", import.meta.env.VITE_RAZORPAY_KEY_ID);
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert("Payment gateway configuration is missing (Razorpay Key is not configured). Please contact support.");
      return;
    }
    setIsProcessing(true);

    const options = {
      key: razorpayKey,
      amount: grandTotal * 100, // paise
      currency: "INR",
      name: "Riza Fashions",
      description: `Payment for Order #${orderId}`,
      image: "https://riza-fashions-c2d77.web.app/favicon-icon.png",
      handler: function (response) {
        const finalDetails = {
          ...baseOrderDetails,
          paymentMethod: 'razorpay',
          paymentStatus: 'Paid',
          orderStatus: 'Pending',
          razorpayPaymentId: response.razorpay_payment_id
        };

        onPlaceOrder(orderId, finalDetails);
        try {
          localStorage.setItem('lastPlacedOrderId', orderId);
        } catch (err) {
          console.error(err);
        }
        onClearCart();
        setIsProcessing(false);
        onClose();
        onNavigate('orders');
      },
      prefill: {
        name: shippingForm.fullName,
        email: shippingForm.email,
        contact: shippingForm.phone
      },
      theme: {
        color: "#9C27B0"
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
          alert("Payment cancelled.");
        }
      }
    };

    try {
      console.log('RAZORPAY OPTIONS', options);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      console.error("Failed to load Razorpay popup:", err);
      alert("Could not load Razorpay. Please verify your internet connection.");
    }
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

                <div className="form-group-row grid-3-col">
                  <div className="form-field">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      placeholder="e.g. Tamil Nadu"
                      value={shippingForm.state}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShippingForm(prev => {
                          const updated = { ...prev, state: val };
                          if (val.trim().toLowerCase() === 'tamil nadu' || val.trim().toLowerCase() === 'tamilnadu') {
                            updated.city = tnDistrictsList.map(d => d.toLowerCase()).includes(prev.city.toLowerCase()) ? prev.city : 'Chennai';
                          }
                          return updated;
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>City / District</label>
                    {(shippingForm.state && (shippingForm.state.trim().toLowerCase() === 'tamil nadu' || shippingForm.state.trim().toLowerCase() === 'tamilnadu')) ? (
                      <select
                        name="city"
                        className="form-input"
                        value={tnDistrictsList.map(d => d.toLowerCase()).includes(shippingForm.city.toLowerCase()) ? shippingForm.city : 'Chennai'}
                        onChange={handleShippingChange}
                        required
                      >
                        {tnDistrictsList.map(dist => (
                          <option key={dist.toLowerCase()} value={dist}>{dist}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="city"
                        className="form-input"
                        placeholder="Mumbai"
                        value={shippingForm.city}
                        onChange={handleShippingChange}
                        required
                      />
                    )}
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
                    <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
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
                  <h4 className="checkout-subtitle">Payment Mode</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Payments are handled securely via Razorpay. Choose to pay using cards, UPI, or net banking.
                  </p>

                  {/* Razorpay Platform Assurance */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F9F0FA', border: '1px solid #E1BEE7', color: '#6A1B9A', padding: '16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px' }}>
                    <ShieldCheck size={20} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                    <div style={{ textAlign: 'left' }}>
                      <strong>Razorpay Secure Checkout</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#7B1FA2', fontSize: '0.8rem' }}>
                        Guarantees safe payment processing. Card details are never collected or stored on our servers.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-step-footer" style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-back-step"
                      onClick={() => setStep(1)}
                      disabled={isProcessing}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isProcessing}
                      style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                      {isProcessing ? (
                        <>
                          <div className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Processing Payment...
                        </>
                      ) : (
                        `Pay Securely with Razorpay (₹${grandTotal})`
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Sidebar Col */}
                <div className="checkout-summary-sidebar bg-light">
                  <h4 className="sidebar-title">Billing Address</h4>
                  <div className="billing-details-preview">
                    <strong>{shippingForm.fullName}</strong>
                    <p>{shippingForm.address}</p>
                    <p>{shippingForm.city}, {shippingForm.state || ''} - {shippingForm.postalCode}</p>
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
