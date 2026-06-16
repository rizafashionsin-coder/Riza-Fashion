import React, { useState } from 'react';
import { Search, MapPin, Calendar, Package, Truck, Compass, CheckCircle } from 'lucide-react';

// Fallback mock database for standard order tracking tests
const fallbackOrders = {
  'RIZA-1001': {
    orderId: 'RIZA-1001',
    date: '2026-06-14',
    status: 'Delivered',
    shippingInfo: {
      fullName: 'Amina Begum',
      address: 'Lane 4, Park Street, Flat 3B',
      city: 'Kolkata',
      postalCode: '700016',
      phone: '9830012345'
    },
    totals: { grandTotal: 2398 },
    items: [
      { name: 'Meera Lavender Organza Saree', quantity: 1, selectedSize: 'Free Size', selectedColor: 'Lavender Purple', salePrice: 1999 }
    ]
  },
  'RIZA-2026': {
    orderId: 'RIZA-2026',
    date: '2026-06-15',
    status: 'Shipped',
    shippingInfo: {
      fullName: 'Riya Sharma',
      address: 'Apt 501, Lavender Heights, Juhu',
      city: 'Mumbai',
      postalCode: '400049',
      phone: '9820054321'
    },
    totals: { grandTotal: 3437 },
    items: [
      { name: 'Aria Floral Anarkali Kurti', quantity: 2, selectedSize: 'M', selectedColor: 'Ivory Lavender', salePrice: 1249 },
      { name: 'Elena Rose Gold Pendant Set', quantity: 1, selectedSize: 'Free Size', selectedColor: 'Rose Gold', salePrice: 799 }
    ]
  }
};

export default function OrderTracker({ ordersList }) {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const cleanId = orderIdInput.trim().toUpperCase();
    
    // Check global state orders list first
    let foundOrder = ordersList ? ordersList[cleanId] : null;

    // Check mock fallbacks if not found
    if (!foundOrder) {
      foundOrder = fallbackOrders[cleanId];
    }

    if (foundOrder) {
      setActiveOrder(foundOrder);
      setErrorMsg('');
    } else {
      setActiveOrder(null);
      setErrorMsg('No order found with this tracking ID. Try: RIZA-2026 or RIZA-1001');
    }
  };

  const steps = [
    { label: 'Ordered', status: 'Ordered', icon: Package, desc: 'Your order has been placed and received.' },
    { label: 'Processing', status: 'Processing', icon: Compass, desc: 'Your items are being checked, folded, and packed in luxury wrap.' },
    { label: 'Shipped', status: 'Shipped', icon: Truck, desc: 'Your package is handed over to our courier partner.' },
    { label: 'Out for Delivery', status: 'Out for Delivery', icon: MapPin, desc: 'Our delivery agent is arriving in your area today.' },
    { label: 'Delivered', status: 'Delivered', icon: CheckCircle, desc: 'Package delivered safely. Enjoy your Riza Fashions apparel!' }
  ];

  // Helper to determine active step indexes
  const getStepIndex = (status) => {
    switch (status) {
      case 'Ordered': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <section className="order-tracker-section section">
      <div className="container">
        
        <div className="section-header">
          <span className="section-subtitle">Real-time Shipping</span>
          <h2 className="section-title">Track Your Order</h2>
          <p className="section-description">
            Enter your tracking ID to see your order status, packed items, and delivery journey timelines.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="tracker-input-card">
          <form onSubmit={handleTrackSubmit} className="tracker-form">
            <div className="tracker-input-wrapper">
              <Search size={20} className="tracker-search-icon" />
              <input
                type="text"
                placeholder="Enter Order Tracking ID (e.g. RIZA-2026)"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary tracker-btn">
              Track Order
            </button>
          </form>
          {errorMsg && <p className="tracker-error animate-slide-down">{errorMsg}</p>}
        </div>

        {/* Tracking Results Details Display */}
        {activeOrder && (
          <div className="tracker-results-container animate-fade">
            
            {/* Top row summaries */}
            <div className="results-header-summary">
              <div className="summary-left">
                <h3>Order #{activeOrder.orderId}</h3>
                <div className="summary-date-row">
                  <Calendar size={14} />
                  <span>Placed on: <strong>{activeOrder.date}</strong></span>
                </div>
              </div>
              <div className="summary-right">
                <span className="tracker-status-badge">
                  Status: <strong>{activeOrder.status}</strong>
                </span>
              </div>
            </div>

            {/* Shipment Timeline */}
            <div className="tracker-timeline-wrapper">
              <div className="timeline-horizontal-bar">
                <div 
                  className="timeline-progress-fill" 
                  style={{ width: `${(currentStepIdx / 4) * 100}%` }}
                ></div>
              </div>

              <div className="timeline-nodes-row">
                {steps.map((stepNode, idx) => {
                  const StepIcon = stepNode.icon;
                  const isCompleted = idx <= currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  return (
                    <div 
                      key={idx} 
                      className={`timeline-node-container ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                    >
                      <div className="node-icon-circle">
                        <StepIcon size={18} />
                      </div>
                      <span className="node-label">{stepNode.label}</span>
                      <p className="node-desc">{stepNode.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Cards Grid splits */}
            <div className="tracker-details-grid">
              
              {/* Shipping Card */}
              <div className="tracker-info-card">
                <h4>Delivery Address</h4>
                <div className="info-card-body">
                  <strong>{activeOrder.shippingInfo.fullName}</strong>
                  <p>{activeOrder.shippingInfo.address}</p>
                  <p>{activeOrder.shippingInfo.city} - {activeOrder.shippingInfo.postalCode}</p>
                  <p className="info-card-phone">Phone: {activeOrder.shippingInfo.phone}</p>
                </div>
              </div>

              {/* Items Card */}
              <div className="tracker-info-card">
                <h4>Items Ordered</h4>
                <div className="info-card-body items-list-body">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="tracker-item-row">
                      <div className="item-name-specs">
                        <strong>{item.name}</strong>
                        {item.selectedSize && (
                          <span>Size: {item.selectedSize} {item.selectedColor && `• Color: ${item.selectedColor}`}</span>
                        )}
                      </div>
                      <span className="item-qty-price">
                        {item.quantity} x ₹{item.salePrice || item.price}
                      </span>
                    </div>
                  ))}
                  
                  <hr className="tracker-divider" />
                  
                  <div className="tracker-total-row">
                    <span>Total Paid:</span>
                    <strong>₹{activeOrder.totals?.grandTotal || activeOrder.totals?.subtotal || activeOrder.grandTotal}</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
