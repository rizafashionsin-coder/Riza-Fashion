import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Package, Truck, CheckCircle, Clock, ArrowLeft, ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getOptimizedImageUrl } from '../utils/cloudinary';

export default function CustomerOrdersPage({ currentUser, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userOrders = [];
      querySnapshot.forEach((doc) => {
        userOrders.push({ id: doc.id, ...doc.data() });
      });

      // Sort locally by createdAt (latest first) to prevent Firestore composite index requirements
      userOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      setOrders(userOrders);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to customer orders:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Helper to format date strings
  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#FFF3E0', text: '#E65100' }; // Amber
      case 'Confirmed': return { bg: '#E3F2FD', text: '#0D47A1' }; // Blue
      case 'Packed': return { bg: '#E8EAF6', text: '#3F51B5' }; // Indigo/Lavender
      case 'Shipped': return { bg: '#E8F5E9', text: '#2E7D32' }; // Green
      case 'Delivered': return { bg: '#E8F5E9', text: '#1B5E20' }; // Dark Green
      case 'Cancelled': return { bg: '#FFEBEE', text: '#C62828' }; // Red
      default: return { bg: 'var(--bg-secondary)', text: 'var(--charcoal)' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return Clock;
      case 'Confirmed': return Package;
      case 'Packed': return Package;
      case 'Shipped': return Truck;
      case 'Delivered': return CheckCircle;
      case 'Cancelled': return HelpCircle;
      default: return Package;
    }
  };

  const renderTimeline = (currentStatus) => {
    const steps = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
    const currentStepIndex = steps.indexOf(currentStatus);

    if (currentStatus === 'Cancelled') {
      return (
        <div style={{ background: '#FFEBEE', color: '#C62828', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <HelpCircle size={18} />
          <span>This order was cancelled. Please contact support if you have any questions.</span>
        </div>
      );
    }

    const activePercentage = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

    return (
      <div className="order-timeline-wrapper">
        <div className="order-timeline-steps">
          {/* Background Line with Nested Active Line */}
          <div className="order-timeline-line-bg">
            <div 
              className="order-timeline-line-active" 
              style={{ '--active-percentage': `${activePercentage}%` }}
            ></div>
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isActive = idx === currentStepIndex;
            
            return (
              <div 
                key={step} 
                className={`order-timeline-step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                {/* Dot */}
                <div className="order-timeline-step-dot">
                  {isCompleted ? '✓' : idx + 1}
                </div>
                {/* Label */}
                <span className="order-timeline-step-label">
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="container text-center" style={{ padding: '120px 20px', minHeight: '60vh' }}>
        <ShoppingBag size={64} className="color-primary" style={{ marginBottom: '20px' }} />
        <h2>Log In to View Orders</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Please log in to your account to review your Riza Fashions order history and live parcel tracking.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('home')}>
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="customer-orders-container container" style={{ paddingBottom: '80px', minHeight: '70vh' }}>
      {/* Breadcrumbs */}
      <nav className="breadcrumb-nav margin-bottom" style={{ marginTop: '20px' }}>
        <button onClick={() => onNavigate('home')}>Home</button>
        <ChevronRight size={12} className="breadcrumb-separator" />
        <span className="breadcrumb-active">My Orders</span>
      </nav>

      <div className="section-header text-left" style={{ marginBottom: '32px' }}>
        <h1 className="section-title">Order History</h1>
        <p className="section-description">Manage and review your premium garment orders and deliveries.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-wishlist-state text-center" style={{ background: '#FFF', padding: '60px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <ShoppingBag size={64} className="empty-icon" style={{ color: 'var(--text-light)', marginBottom: '20px' }} />
          <h3>No Orders Placed Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            You haven't made any purchases on your profile. Browse our exquisite collections to start shopping.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate('shop')}>
            Explore Shop Collections
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => {
            const statusStyle = getStatusColor(order.orderStatus || 'Pending');
            const StatusIcon = getStatusIcon(order.orderStatus || 'Pending');
            const isExpanded = !!expandedOrders[order.orderId];

            return (
              <div 
                key={order.orderId} 
                className="order-history-card"
              >
                {/* Header Row */}
                <div 
                  className="order-card-header"
                  style={{ borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none' }}
                  onClick={() => toggleOrderExpand(order.orderId)}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)', marginRight: '12px' }}>
                      Order #{order.orderId}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div 
                      style={{ 
                        background: statusStyle.bg, 
                        color: statusStyle.text, 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }}
                    >
                      <StatusIcon size={14} />
                      <span>{order.orderStatus || 'Pending'}</span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOrderExpand(order.orderId);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      <ChevronDown 
                        size={14} 
                        style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'none', 
                          transition: 'transform 0.2s ease' 
                        }} 
                      />
                    </button>
                  </div>
                </div>

                {/* Details Body */}
                {isExpanded && (
                  <div className="order-card-body">
                    
                    {/* Visual Status Timeline */}
                    {renderTimeline(order.orderStatus || 'Pending')}

                    {/* Columns Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                      {/* Items List */}
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--charcoal)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '16px', fontWeight: 600 }}>
                          Items Placed
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem' }}>
                              <img 
                                src={getOptimizedImageUrl(item.images ? item.images[0] : '', 100)} 
                                alt="" 
                                style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  Qty: {item.quantity} | Size: {item.selectedSize} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''}
                                </div>
                              </div>
                              <span style={{ fontWeight: 600 }}>₹{(item.salePrice || item.price) * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipment Info */}
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--charcoal)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '16px', fontWeight: 600 }}>
                          Shipping Address
                        </h4>
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--charcoal)' }}>
                          <strong>{order.customerName}</strong>
                          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>{order.shippingAddress}</p>
                          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Phone: {order.phone}</p>
                        </div>
                      </div>

                      {/* Summary & Payment Details */}
                      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--charcoal)', marginBottom: '16px', fontWeight: 600 }}>
                          Order Summary
                        </h4>
                        <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Subtotal:</span>
                            <span>₹{order.subtotal}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Shipping Fee:</span>
                            <span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>Payment Method:</span>
                            <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{order.paymentMethod}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>Payment Status:</span>
                            <span style={{ color: order.paymentStatus === 'Paid' ? '#2E7D32' : '#E65100', fontWeight: 600 }}>
                              {order.paymentStatus}
                            </span>
                          </div>
                          {order.razorpayPaymentId && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                              <span>Razorpay Payment ID:</span>
                              <code style={{ fontSize: '0.75rem' }}>{order.razorpayPaymentId}</code>
                            </div>
                          )}
                          <div style={{ height: '1px', background: 'var(--border-light)', margin: '8px 0' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)' }}>
                            <span>Grand Total:</span>
                            <span>₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
