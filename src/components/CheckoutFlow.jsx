import React, { useState, useMemo, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, CreditCard, ShieldCheck, CheckCircle2, Copy, Check, Tag } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';

export default function CheckoutFlow({
  isOpen,
  onClose,
  cart,
  products = [],
  activeCoupon,
  onClearCart,
  onPlaceOrder,
  onNavigate,
  deliverySettings
}) {

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
  const [paymentMethod, setPaymentMethod] = useState('phonepe');

  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Calculations
  const subtotal = cart.reduce((total, item) => {
    const liveProd = (products || []).find(p => p.id === item.id) || item;
    return total + (liveProd.salePrice || liveProd.price) * item.quantity;
  }, 0);
  
  // Dynamic Coupon Validation & State
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Auto-apply coupon from props if it exists
  useEffect(() => {
    if (activeCoupon) {
      validateAndApplyCoupon(activeCoupon);
    }
  }, [activeCoupon, subtotal]);

  const validateAndApplyCoupon = async (codeToApply) => {
    if (!codeToApply) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const code = codeToApply.trim().toUpperCase();
      const couponDocRef = doc(db, 'coupons', code);
      const couponSnap = await getDoc(couponDocRef);

      if (!couponSnap.exists()) {
        setCouponError("Coupon code does not exist.");
        setAppliedCoupon(null);
        setValidatingCoupon(false);
        return;
      }

      const couponData = couponSnap.data();

      // Check active status
      if (couponData.active === false) {
        setCouponError("This coupon is currently inactive.");
        setAppliedCoupon(null);
        setValidatingCoupon(false);
        return;
      }

      // Check expiry date
      if (couponData.expiryDate) {
        const expiry = new Date(couponData.expiryDate);
        if (expiry < new Date()) {
          setCouponError("This coupon has expired.");
          setAppliedCoupon(null);
          setValidatingCoupon(false);
          return;
        }
      }

      // Check total limit
      if (couponData.totalLimit > 0 && (couponData.usedCount || 0) >= couponData.totalLimit) {
        setCouponError("This coupon's usage limit has been reached.");
        setAppliedCoupon(null);
        setValidatingCoupon(false);
        return;
      }

      // Check minimum order amount
      if (couponData.minOrderAmount > 0 && subtotal < couponData.minOrderAmount) {
        setCouponError(`Minimum order amount of ₹${couponData.minOrderAmount} is required for this coupon.`);
        setAppliedCoupon(null);
        setValidatingCoupon(false);
        return;
      }

      // Check per-user limit
      const user = auth.currentUser;
      if (user && couponData.perUserLimit > 0) {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          where('couponCode', '==', code)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size >= couponData.perUserLimit) {
          setCouponError(`You have reached the maximum usage limit (${couponData.perUserLimit}) for this coupon.`);
          setAppliedCoupon(null);
          setValidatingCoupon(false);
          return;
        }
      }

      // All validation passed
      setAppliedCoupon(couponData);
      setCouponError('');
    } catch (err) {
      console.error("Error validating coupon:", err);
      setCouponError("Error validating coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Coupon Discount
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      let discVal = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount > 0 && discVal > appliedCoupon.maxDiscount) {
        discVal = appliedCoupon.maxDiscount;
      }
      return Math.round(discVal);
    } else if (appliedCoupon.type === 'fixed') {
      let discVal = appliedCoupon.value;
      if (discVal > subtotal) {
        discVal = subtotal;
      }
      return Math.round(discVal);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  // ─── SHIPPING CHARGE CALCULATION ──────────────────────────────────────────
  // Free shipping threshold is based on RAW SUBTOTAL only.
  // Coupon discounts reduce the product price, NOT the shipping eligibility.
  const shippingThreshold = deliverySettings
    ? (deliverySettings.freeShippingThreshold || 1499)
    : 1499;

  const shippingCharge = useMemo(() => {
    // No items in cart → no shipping
    if (subtotal === 0) return 0;

    const stateVal = (shippingForm.state || '').trim().toLowerCase();
    const cityVal  = (shippingForm.city  || '').trim().toLowerCase();

    // Tamil Nadu — use district-specific charge from Firebase
    if (stateVal === 'tamil nadu' || stateVal === 'tamilnadu') {
      if (
        deliverySettings &&
        deliverySettings.charges &&
        deliverySettings.charges[cityVal] !== undefined
      ) {
        return Number(deliverySettings.charges[cityVal]);
      }
      return 90; // Fallback for unrecognised TN district
    }

    // All other states → default charge
    return deliverySettings ? (Number(deliverySettings.defaultCharge) || 150) : 150;
  }, [subtotal, shippingForm.state, shippingForm.city, deliverySettings]);

  // ─── FINAL TOTAL ──────────────────────────────────────────────────────────
  // Formula: Subtotal + ShippingCharge - CouponDiscount
  const discountAmount = discount;
  const finalTotal = subtotal + shippingCharge - discountAmount;


  // ─── DISTRICT CHANGE LOGGER ──────────────────────────────────────────────
  // Fires every time the user picks a different city / district.
  useEffect(() => {
    const selectedDistrict = (shippingForm.city || '').trim().toLowerCase();
    const shippingSettings  = deliverySettings || null;
    console.log("Selected District:", selectedDistrict);
    console.log("Shipping Settings:", shippingSettings);
    console.log("Shipping Charge:", shippingCharge);
    console.log("Subtotal:", subtotal);
    console.log("Final Total:", finalTotal);
    console.log("--- threshold:", shippingThreshold, "| subtotal >= threshold?", subtotal >= shippingThreshold);
  }, [shippingForm.city, shippingCharge, finalTotal]);

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

    // ─── DEBUG LOGS ───────────────────────────────────────────────────────────
    console.log('Subtotal:', subtotal);
    console.log('Shipping:', shippingCharge);
    console.log('Discount:', discountAmount);
    console.log('Final Total:', finalTotal);
    console.log('Razorpay Amount (paise):', finalTotal * 100);
    console.log('District selected:', shippingForm.city, '| State:', shippingForm.state);
    console.log('deliverySettings charges:', deliverySettings?.charges);

    const orderId = `RIZA-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedOrderId(orderId);

    const baseOrderDetails = {
      orderId,
      date: new Date().toISOString().split('T')[0],
      items: [...cart],
      shippingInfo: { ...shippingForm },
      pricing: {
        subtotal,
        discount: discountAmount,
        coupon: appliedCoupon ? appliedCoupon.code : '',
        shipping: shippingCharge,
        total: finalTotal
      },
      status: 'Ordered'
    };

    setIsProcessing(true);

    try {
      const finalDetails = {
        ...baseOrderDetails,
        paymentMethod: 'phonepe',
        paymentStatus: 'Pending',
        orderStatus: 'Pending'
      };
      
      await onPlaceOrder(orderId, finalDetails);

      const workerUrl = import.meta.env.VITE_PHONEPE_WORKER_URL || 'https://riza-payment-worker.rizafashions-in.workers.dev';
      const redirectUrl = `${window.location.origin}/orders?gateway=phonepe&transactionId=${orderId}`;

      const res = await fetch(`${workerUrl}/api/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: orderId,
          userId: auth.currentUser.uid,
          amount: finalTotal,
          phone: shippingForm.phone,
          redirectUrl: redirectUrl
        })
      });

      const data = await res.json();
      if (data && data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error("PhonePe payment initiation failed:", data);
        alert(`PhonePe Payment failed: ${data.message || 'Verification error'}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("PhonePe initiation call error:", error);
      alert("Failed to connect to PhonePe gateway. Please try again.");
      setIsProcessing(false);
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

  if (!isOpen) return null;

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
                  {cart.map((item, idx) => {
                    const liveProd = (products || []).find(p => p.id === item.id) || item;
                    const itemPrice = liveProd.salePrice || liveProd.price;
                    const variant = liveProd.variants?.find(v => v.colorName === item.selectedColor);
                    const imageIndex = variant && variant.imageIndex !== undefined && variant.imageIndex !== -1 ? variant.imageIndex : 0;
                    const itemImage = liveProd.images && liveProd.images[imageIndex] ? liveProd.images[imageIndex] : (item.images ? item.images[0] : '');
                    const itemName = liveProd.name || item.name;
                    return (
                      <div key={idx} className="sidebar-item">
                        <img src={itemImage} alt={itemName} />
                        <div className="sidebar-item-info">
                          <h5>{itemName}</h5>
                          <span>Qty: {item.quantity} • Size: {item.selectedSize}</span>
                        </div>
                        <span className="sidebar-item-price">₹{itemPrice * item.quantity}</span>
                      </div>
                    );
                  })}
                </div>
                 <hr className="summary-divider" />
                 
                 {/* Coupon Code Section */}
                 <div className="cart-coupon-section" style={{ marginBottom: '16px' }}>
                   {appliedCoupon ? (
                     <div className="active-coupon-pill animate-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>
                       <div className="coupon-left" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <Tag size={14} className="coupon-icon-active" style={{ color: '#2e7d32' }} />
                         <span>Coupon <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`} OFF)</span>
                       </div>
                       <button type="button" className="remove-coupon-btn" onClick={() => { setAppliedCoupon(null); setCouponInput(''); }} style={{ color: '#c62828', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                         Remove
                       </button>
                     </div>
                   ) : (
                     <div style={{ display: 'flex', gap: '8px' }}>
                       <input
                         type="text"
                         className="form-input coupon-input"
                         placeholder="Enter Coupon Code"
                         value={couponInput}
                         onChange={(e) => setCouponInput(e.target.value)}
                         style={{ flex: 1, padding: '8px 14px', fontSize: '0.8rem', borderRadius: '20px', border: '1px solid var(--border-medium)', background: '#FFF' }}
                       />
                       <button 
                         type="button" 
                         className="coupon-apply-submit" 
                         onClick={() => validateAndApplyCoupon(couponInput)}
                         disabled={validatingCoupon || !couponInput.trim()}
                         style={{ background: 'var(--charcoal)', color: 'var(--secondary)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                       >
                         {validatingCoupon ? '...' : 'Apply'}
                       </button>
                     </div>
                   )}
                   {couponError && <p className="coupon-error-text animate-slide-down" style={{ fontSize: '0.75rem', color: '#c62828', marginTop: '6px', paddingLeft: '8px' }}>{couponError}</p>}
                 </div>

                 <div className="sidebar-pricing">
                   <div className="sidebar-pricing-row">
                     <span>Subtotal</span>
                     <span>₹{subtotal}</span>
                   </div>
                   {discountAmount > 0 && (
                     <div className="sidebar-pricing-row discount-row" style={{ color: '#2e7d32' }}>
                       <span>Discount ({appliedCoupon ? appliedCoupon.code : ''})</span>
                       <span>-₹{discountAmount}</span>
                     </div>
                   )}
                   <div className="sidebar-pricing-row">
                     <span>Shipping Fee</span>
                     <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
                   </div>
                   <hr className="summary-divider" />
                   <div className="sidebar-pricing-row total-row">
                     <span>Total</span>
                     <span>₹{finalTotal}</span>
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
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Secure payment processed via PhonePe:
                  </p>

                  <div className="payment-methods-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
                    {/* PhonePe Option (Static) */}
                    <div 
                      style={{
                        border: '2px solid #5f259f',
                        background: '#f5f0fa',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid #5f259f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5f259f' }} />
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#333', fontSize: '0.85rem' }}>PhonePe</strong>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>UPI, Cards, NetBanking</span>
                      </div>
                      <span style={{
                        position: 'absolute',
                        top: '-9px',
                        right: '8px',
                        background: '#5f259f',
                        color: '#fff',
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>Secure</span>
                    </div>
                  </div>

                  {/* Platform Assurance */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F5ECFA', border: '1px solid #E2D0F0', color: '#5f259f', padding: '16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px' }}>
                    <ShieldCheck size={20} style={{ flexShrink: 0, color: '#5f259f' }} />
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ color: '#3c007a' }}>PhonePe Secure Checkout</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#5f259f', fontSize: '0.8rem' }}>
                        Guarantees safe payment processing. Card and bank details are never stored on our servers.
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
                        `Pay Securely with PhonePe (₹${finalTotal})`
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
                    <span>₹{finalTotal}</span>
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
