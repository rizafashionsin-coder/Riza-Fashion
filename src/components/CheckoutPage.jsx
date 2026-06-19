import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, ShieldCheck, ShoppingBag, ChevronRight, Tag } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';

export default function CheckoutPage({
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
  // Helper keys
  const getItemKey = (item) => `${item.id}-${item.selectedSize || 'Free Size'}-${item.selectedColor || ''}`;
  const itemsMatch = (itemA, itemB) => {
    return itemA.id === itemB.id &&
           (itemA.selectedSize || 'Free Size') === (itemB.selectedSize || 'Free Size') &&
           (itemA.selectedColor || '') === (itemB.selectedColor || '');
  };

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Prefill authenticated user info
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      if (user.displayName) setName(user.displayName);
      if (user.email) setEmail(user.email);
    }
  }, []);

  // Load Buy Now item if it exists
  const buyNowInfo = useMemo(() => {
    try {
      const saved = localStorage.getItem('buyNowItem');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const isBuyNowMode = !!buyNowInfo;

  // Find matching item in cart
  const buyNowCartItem = useMemo(() => {
    if (!buyNowInfo) return null;
    return cart.find(item => itemsMatch(item, buyNowInfo));
  }, [cart, buyNowInfo]);

  // Determine optional items in cart
  const optionalCartItems = useMemo(() => {
    if (!isBuyNowMode) return [];
    return cart.filter(item => !buyNowCartItem || !itemsMatch(item, buyNowCartItem));
  }, [cart, isBuyNowMode, buyNowCartItem]);

  // Track optional items selected state
  const [selectedOptionalKeys, setSelectedOptionalKeys] = useState({});

  const toggleOptionalItem = (itemKey) => {
    setSelectedOptionalKeys(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Derive the active items in the checkout
  const selectedCheckoutItems = useMemo(() => {
    if (!isBuyNowMode) return cart;
    const list = [];
    if (buyNowCartItem) {
      list.push(buyNowCartItem);
    } else if (buyNowInfo) {
      list.push(buyNowInfo);
    }
    optionalCartItems.forEach(item => {
      const key = getItemKey(item);
      if (selectedOptionalKeys[key]) {
        list.push(item);
      }
    });
    return list;
  }, [cart, isBuyNowMode, buyNowCartItem, buyNowInfo, optionalCartItems, selectedOptionalKeys]);

  // Calculations
  const subtotal = selectedCheckoutItems.reduce((sum, item) => {
    const liveProd = (products || []).find(p => p.id === item.id) || item;
    const price = liveProd.salePrice || liveProd.price;
    return sum + (price * item.quantity);
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
  // Free shipping is based on RAW SUBTOTAL (before coupon).
  // Coupon discounts reduce product price, not shipping eligibility.
  const shippingThreshold = deliverySettings
    ? (deliverySettings.freeShippingThreshold || 1499)
    : 1499;

  const shippingCharge = useMemo(() => {
    // No items → no shipping
    if (subtotal === 0) return 0;

    // Tamil Nadu — district-wise charge from Firebase
    const isTN = stateVal.trim().toLowerCase() === 'tamil nadu' || stateVal.trim().toLowerCase() === 'tamilnadu';
    if (isTN) {
      const selectedDistrict = city.trim().toLowerCase();
      if (
        deliverySettings &&
        deliverySettings.charges &&
        deliverySettings.charges[selectedDistrict] !== undefined
      ) {
        return Number(deliverySettings.charges[selectedDistrict]);
      }
      return 90; // Fallback for unrecognised TN district
    }

    // Default non-TN shipping
    return deliverySettings ? (Number(deliverySettings.defaultCharge) || 150) : 150;
  }, [subtotal, stateVal, city, deliverySettings]);

  // ─── FINAL TOTAL ──────────────────────────────────────────────────────────
  // Formula: Subtotal + ShippingCharge - CouponDiscount
  const discountAmount = discount;
  const finalTotal = subtotal + shippingCharge - discountAmount;

  // ─── DISTRICT CHANGE LOGGER ──────────────────────────────────────────────
  // Fires every time the user picks a different city / district.
  useEffect(() => {
    const selectedDistrict = (city || '').trim().toLowerCase();
    const shippingSettings  = deliverySettings || null;
    console.log("Selected District:", selectedDistrict);
    console.log("Shipping Settings:", shippingSettings);
    console.log("Shipping Charge:", shippingCharge);
    console.log("Subtotal:", subtotal);
    console.log("Final Total:", finalTotal);
    console.log("--- threshold:", shippingThreshold, "| subtotal >= threshold?", subtotal >= shippingThreshold);
  }, [city, shippingCharge, finalTotal]);

  // Handle place order submit
  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (selectedCheckoutItems.length === 0 || isProcessing) return;

    // Verify user is authenticated before opening Razorpay
    if (!auth.currentUser) {
      alert("Please login to complete your payment and order.");
      setIsProcessing(false);
      onNavigate('home');
      return;
    }

    // Generate simulated Order ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `RIZA-${randomNum}`;

    // ─── DEBUG LOGS ───────────────────────────────────────────────────────────
    console.log('Subtotal:', subtotal);
    console.log('Shipping:', shippingCharge);
    console.log('Discount:', discountAmount);
    console.log('Final Total:', finalTotal);
    console.log('Razorpay Amount (paise):', finalTotal * 100);
    console.log('District selected:', city, '| State:', stateVal);
    console.log('deliverySettings charges:', deliverySettings?.charges);

    const orderDetails = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customer: { name, email, phone },
      shipping: { address, city, state: stateVal, pinCode },
      items: [...selectedCheckoutItems],
      pricing: { 
        subtotal, 
        discount: discountAmount, 
        coupon: appliedCoupon ? appliedCoupon.code : '', 
        shipping: shippingCharge, 
        total: finalTotal 
      },
      notes: orderNotes,
      status: 'Ordered', // Ordered -> Processing -> Shipped -> Out for Delivery -> Delivered
      timeline: [
        { label: 'Order Confirmed', time: 'Just now', done: true },
        { label: 'Processing at warehouse', time: 'Expected in 4 hours', done: false },
        { label: 'Dispatched to logistics', time: 'Pending', done: false },
        { label: 'Out for Delivery', time: 'Pending', done: false },
        { label: 'Delivered', time: 'Pending', done: false }
      ]
    };

    const clearSelectedItems = () => {
      const remainingItems = cart.filter(item => !selectedCheckoutItems.some(sel => getItemKey(sel) === getItemKey(item)));
      onClearCart(remainingItems);
      // Clean up buyNowItem from localStorage after purchase
      try {
        localStorage.removeItem('buyNowItem');
      } catch (err) {
        console.error(err);
      }
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
      amount: finalTotal * 100, // Amount in paise — Subtotal + Shipping - Coupon Discount
      currency: "INR",
      name: "Riza Fashions",
      description: `Payment for Order #${orderId}`,
      image: "https://riza-fashions-c2d77.web.app/favicon-icon.png",
      handler: async function (response) {
        // Increment coupon usedCount in Firestore if coupon was applied
        if (appliedCoupon) {
          try {
            const couponRef = doc(db, 'coupons', appliedCoupon.code);
            await updateDoc(couponRef, {
              usedCount: increment(1)
            });
            console.log("Successfully incremented usedCount for coupon:", appliedCoupon.code);
          } catch (couponErr) {
            console.error("Failed to increment coupon usedCount:", couponErr);
          }
        }

        const finalOrder = {
          ...orderDetails,
          paymentMethod: 'razorpay',
          paymentStatus: 'Paid',
          orderStatus: 'Pending',
          razorpayPaymentId: response.razorpay_payment_id
        };

        onPlaceOrder(orderId, finalOrder);
        clearSelectedItems();
        try {
          localStorage.setItem('lastPlacedOrderId', orderId);
        } catch (err) {
          console.error(err);
        }
        setIsProcessing(false);
        onNavigate('orders');
      },
      prefill: {
        name,
        email,
        contact: phone
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

  if (cart.length === 0) {
    return (
      <div className="container text-center" style={{ padding: '100px 20px' }}>
        <ShoppingBag size={64} className="color-primary" style={{ marginBottom: '20px' }} />
        <h2>Your Cart is Empty</h2>
        <p>There are no items in your checkout catalog. Add products to cart first.</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => onNavigate('home')}>
          Return to Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page-container container">
      
      {/* Breadcrumb Row */}
      <nav className="breadcrumb-nav margin-bottom">
        <button onClick={() => onNavigate('home')}>Home</button>
        <ChevronRight size={12} className="breadcrumb-separator" />
        <button onClick={() => onNavigate('cart')}>Your Cart</button>
        <ChevronRight size={12} className="breadcrumb-separator" />
        <span className="breadcrumb-active">Checkout Billing</span>
      </nav>

      <div className="section-header text-left">
        <h1 className="section-title">Billing Details</h1>
      </div>

      <form onSubmit={handlePlaceOrderSubmit} className="checkout-layout-grid">
        
        {/* Left: Shipping Forms */}
        <div className="checkout-forms-column">
          
          {/* Buy Now checkout customization */}
          {isBuyNowMode && (
            <div className="checkout-form-card" style={{ borderLeft: '4px solid var(--primary)', background: '#FDFBFD' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <span>📦 Buy Now Purchase Choice</span>
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                You are purchasing this product now. Add additional cart items if desired.
              </p>

              {/* Selected Locked Product */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Selected Product (Locked)
                </span>
                {(() => {
                  const item = buyNowCartItem || buyNowInfo;
                  if (!item) return null;
                  const liveProd = (products || []).find(p => p.id === item.id) || item;
                  const itemPrice = liveProd.salePrice || liveProd.price;
                  const itemImage = liveProd.images ? liveProd.images[0] : item.images[0];
                  const itemName = liveProd.name || item.name;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#FFF', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
                      <input type="checkbox" checked disabled style={{ accentColor: 'var(--primary)', cursor: 'not-allowed', width: '18px', height: '18px' }} />
                      <img src={itemImage} alt="" style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <strong style={{ fontSize: '0.9rem', display: 'block' }}>{itemName}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Size: {item.selectedSize} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''} • Qty: {item.quantity}
                        </span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        ₹{itemPrice * item.quantity}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Optional Cart Items list */}
              {optionalCartItems.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    Optional Cart Items (Select to combine)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {optionalCartItems.map((item, idx) => {
                      const itemKey = getItemKey(item);
                      const isChecked = !!selectedOptionalKeys[itemKey];
                      const liveProd = (products || []).find(p => p.id === item.id) || item;
                      const itemPrice = liveProd.salePrice || liveProd.price;
                      const itemImage = liveProd.images ? liveProd.images[0] : item.images[0];
                      const itemName = liveProd.name || item.name;
                      return (
                        <label 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '16px', 
                            padding: '12px', 
                            background: isChecked ? 'var(--bg-secondary)' : '#FFF', 
                            borderRadius: '8px', 
                            border: isChecked ? '1px solid var(--primary-light)' : '1px solid var(--border-light)', 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            margin: 0
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => toggleOptionalItem(itemKey)} 
                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <img src={itemImage} alt="" style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--charcoal)' }}>{itemName}</strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Size: {item.selectedSize} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''} • Qty: {item.quantity}
                            </span>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--charcoal)' }}>
                            ₹{itemPrice * item.quantity}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Details Box */}
          <div className="checkout-form-card">
            <h3>Customer Contact</h3>
            <div className="checkout-form-row grid-2-col">
              <div className="form-field">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Maya Iyer" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="98765 43210" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                  required 
                />
              </div>
            </div>
            <div className="form-field">
              <label>Email Address (For Order Tracking Receipt)</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="maya@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Shipping Destination Box */}
          <div className="checkout-form-card">
            <h3>Delivery Address</h3>
            <div className="form-field">
              <label>Street Address</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Flat No, Wing, Apartment Name, Street Name" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                required 
              />
            </div>
            
            <div className="checkout-form-row grid-3-col">
              <div className="form-field">
                <label>State</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Tamil Nadu or Maharashtra" 
                  value={stateVal} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setStateVal(val);
                    if (val.trim().toLowerCase() === 'tamil nadu' || val.trim().toLowerCase() === 'tamilnadu') {
                      setCity(prev => tnDistrictsList.map(d => d.toLowerCase()).includes(prev.toLowerCase()) ? prev : 'Chennai');
                    }
                  }}
                  required 
                />
              </div>
              <div className="form-field">
                <label>City / District</label>
                {(stateVal.trim().toLowerCase() === 'tamil nadu' || stateVal.trim().toLowerCase() === 'tamilnadu') ? (
                  <select
                    className="form-input"
                    value={tnDistrictsList.map(d => d.toLowerCase()).includes(city.toLowerCase()) ? city : 'Chennai'}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  >
                    {tnDistrictsList.map(dist => (
                      <option key={dist.toLowerCase()} value={dist}>{dist}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Mumbai" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    required 
                  />
                )}
              </div>
              <div className="form-field">
                <label>PIN Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="400001" 
                  value={pinCode} 
                  onChange={(e) => setPinCode(e.target.value)}
                  pattern="[0-9]{6}"
                  title="Please enter a valid 6-digit postal code"
                  required 
                />
              </div>
            </div>

            <div className="form-field">
              <label>Order Notes / Customization Requests (Optional)</label>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Special delivery requests or custom size measurements..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="checkout-form-card">
            <h3>Payment Mode</h3>
            <p>Payments are handled securely via Razorpay. Choose to pay using cards, UPI, or net banking.</p>

            {/* Razorpay Platform Assurance */}
            <div className="razorpay-prep-alert" style={{ background: '#F9F0FA', border: '1px solid #E1BEE7', color: '#6A1B9A', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <ShieldCheck size={20} className="secure-badge-icon" style={{ color: '#8E24AA', flexShrink: 0 }} />
              <div className="alert-content" style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', color: '#4A148C' }}>Razorpay Secure Gateway Active</strong>
                <p style={{ margin: '2px 0 0 0', color: '#7B1FA2', fontSize: '0.8rem' }}>
                  Guarantees safe payment processing. Card details are never collected or stored on our servers.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Summary Column */}
        <aside className="checkout-summary-column">
          <div className="summary-card">
            <h3 className="summary-card-title">Order Summary</h3>
            
            {/* Scrollable list of items */}
            <div className="checkout-items-list">
              {selectedCheckoutItems.map((item, idx) => {
                const liveProd = (products || []).find(p => p.id === item.id) || item;
                const itemPrice = liveProd.salePrice || liveProd.price;
                const itemImage = liveProd.images ? liveProd.images[0] : item.images[0];
                const itemName = liveProd.name || item.name;
                return (
                  <div key={idx} className="checkout-item-summary-row">
                    <div className="checkout-item-image">
                      <img src={itemImage} alt={itemName} />
                      <span className="item-qty-badge">{item.quantity}</span>
                    </div>
                    <div className="checkout-item-details">
                      <h4>{itemName}</h4>
                      <span>Size: {item.selectedSize} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''}</span>
                    </div>
                    <span className="checkout-item-total-price">₹{itemPrice * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Section */}
            <div className="cart-coupon-section" style={{ marginTop: '20px', marginBottom: '16px' }}>
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

            {/* Price Calculations */}
            <div className="summary-rows" style={{ marginTop: '20px' }}>
              <div className="summary-row">
                <span>Subtotal Items</span>
                <span>₹{subtotal}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="summary-row discount-row" style={{ color: '#2e7d32' }}>
                  <span>Promo Discount ({appliedCoupon ? appliedCoupon.code : ''})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
 
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}</span>
              </div>
 
              <div className="summary-divider"></div>
 
              <div className="summary-row total-row">
                <span>Payable Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block place-order-submit-btn"
              disabled={isProcessing}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {isProcessing ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Processing Payment...
                </>
              ) : (
                `Pay Securely with Razorpay (₹${finalTotal})`
              )}
            </button>
            
            <p className="summary-assurance-text text-center">
              🛡️ Safe and Encrypted Payments. 100% Genuine Riza Garments.
            </p>
          </div>
        </aside>

      </form>
    </div>
  );
}
