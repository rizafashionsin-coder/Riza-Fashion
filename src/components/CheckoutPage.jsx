import React, { useState, useMemo } from 'react';
import { CreditCard, Truck, ShieldCheck, ShoppingBag, ChevronRight } from 'lucide-react';

export default function CheckoutPage({
  cart,
  activeCoupon,
  onClearCart,
  onPlaceOrder,
  onNavigate
}) {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  // Payment option selector
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + (price * item.quantity);
  }, 0);

  // Coupon Discount
  let discount = 0;
  if (activeCoupon === 'RIZA50') {
    discount = subtotal * 0.5;
  } else if (activeCoupon === 'WELCOME10') {
    discount = subtotal * 0.1;
  }

  // Shipping (Free above 1499, else 150)
  const shippingThreshold = 1499;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 150;
  const total = subtotal - discount + shippingCost;

  // Handle place order submit
  const handlePlaceOrderSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Generate simulated Order ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `RIZA-${randomNum}`;

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
      items: [...cart],
      pricing: { subtotal, discount, coupon: activeCoupon, shipping: shippingCost, total },
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

    // Trigger parent App state handlers
    onPlaceOrder(orderId, orderDetails);
    
    // Clear shopping cart
    onClearCart();
    
    // Redirect to Order Tracker search view, or directly search for this order
    // Wait! Let's pass orderId to the tracking page redirect
    onNavigate('tracking');
    
    // Push the tracking code directly into the browser storage so the OrderTracker can auto-fill it
    try {
      localStorage.setItem('lastPlacedOrderId', orderId);
    } catch (err) {
      console.error(err);
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
                <label>City</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Mumbai" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  required 
                />
              </div>
              <div className="form-field">
                <label>State</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Maharashtra" 
                  value={stateVal} 
                  onChange={(e) => setStateVal(e.target.value)}
                  required 
                />
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
            <h3>Payment Method</h3>
            <p>Select your secure checkout payment channel.</p>
            
            <div className="payment-options-list">
              <label className={`payment-option-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')} 
                />
                <CreditCard size={18} className="payment-option-icon" />
                <div className="option-label">
                  <strong>Credit / Debit Card</strong>
                  <span>Pay with Visa, Mastercard, RuPay</span>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'upi' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'upi'} 
                  onChange={() => setPaymentMethod('upi')} 
                />
                <Truck size={18} className="payment-option-icon" />
                <div className="option-label">
                  <strong>UPI Payment Gateway</strong>
                  <span>Pay instantly with GPay, PhonePe, Paytm</span>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')} 
                />
                <Truck size={18} className="payment-option-icon" />
                <div className="option-label">
                  <strong>Cash on Delivery (CoD)</strong>
                  <span>Pay with cash on parcel delivery (Additional ₹50 fee)</span>
                </div>
              </label>
            </div>

            {/* Razorpay Integration Preparation Info */}
            <div className="razorpay-prep-alert">
              <ShieldCheck size={20} className="secure-badge-icon" />
              <div className="alert-content">
                <strong>Razorpay Payments Platform Ready</strong>
                <p>
                  Checkout structure is prepared for live production. API connection endpoints and callback scripts can be integrated here inside the placeOrder handler.
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
              {cart.map((item, idx) => {
                const itemPrice = item.salePrice || item.price;
                return (
                  <div key={idx} className="checkout-item-summary-row">
                    <div className="checkout-item-image">
                      <img src={item.images[0]} alt={item.name} />
                      <span className="item-qty-badge">{item.quantity}</span>
                    </div>
                    <div className="checkout-item-details">
                      <h4>{item.name}</h4>
                      <span>Size: {item.selectedSize} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''}</span>
                    </div>
                    <span className="checkout-item-total-price">₹{itemPrice * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="summary-rows" style={{ marginTop: '20px' }}>
              <div className="summary-row">
                <span>Subtotal Items</span>
                <span>₹{subtotal}</span>
              </div>
              
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Promo Discount ({activeCoupon})</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Express Shipping</span>
                <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
              </div>

              {paymentMethod === 'cod' && (
                <div className="summary-row">
                  <span>CoD Handling Fee</span>
                  <span>₹50</span>
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Payable Total</span>
                <span>₹{total + (paymentMethod === 'cod' ? 50 : 0)}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block place-order-submit-btn">
              Securely Place Order
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
