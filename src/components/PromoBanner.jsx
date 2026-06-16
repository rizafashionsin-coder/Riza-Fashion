import React, { useState, useEffect } from 'react';
import { Clock, Copy, Check, ArrowRight } from 'lucide-react';

export default function PromoBanner({ onNavigate }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19
  });
  const [isCopied, setIsCopied] = useState(false);

  // Countdown ticking effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset timer to keep the UI active
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('RIZA50');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className="promo-banner-section section">
      <div className="promo-banner-bg-overlay"></div>
      <div className="container promo-banner-container">
        
        <div className="promo-banner-content animate-slide-up">
          <span className="promo-banner-tag">Flash Sale</span>
          <h2 className="promo-banner-title">Limited Time Offer</h2>
          <h3 className="promo-banner-subtitle">Up to 50% OFF on Selected Collections</h3>
          
          <p className="promo-banner-text">
            Indulge in sheer luxury. Elevate your wardrobe with premium traditional organza drapes, hand-embroidered Anarkali kurtis, and designer maxi gowns at half price.
          </p>

          {/* Countdown timer */}
          <div className="countdown-container">
            <div className="countdown-box">
              <span className="countdown-time">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="countdown-label">Hours</span>
            </div>
            <div className="countdown-divider">:</div>
            <div className="countdown-box">
              <span className="countdown-time">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="countdown-label">Mins</span>
            </div>
            <div className="countdown-divider">:</div>
            <div className="countdown-box">
              <span className="countdown-time">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="countdown-label">Secs</span>
            </div>
          </div>

          {/* Interactive Coupon Code Display */}
          <div className="coupon-code-wrapper">
            <span className="coupon-description">Use Coupon Code:</span>
            <div className="coupon-badge-container">
              <code className="coupon-code-text">RIZA50</code>
              <button 
                className="coupon-copy-btn" 
                onClick={handleCopyCoupon}
                title="Copy Coupon Code"
              >
                {isCopied ? <Check size={16} className="color-success" /> : <Copy size={16} />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="promo-banner-actions">
            <button 
              className="btn btn-accent btn-promo-sale"
              onClick={() => onNavigate('shop', null, true)} // Navigates to shop with sale items filtered
            >
              Shop The Sale
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Floating Side Fashion Card Illustration */}
        <div className="promo-banner-visual">
          <div className="visual-card">
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" 
              alt="Model Promo" 
              className="visual-image"
            />
            <div className="visual-discount-badge">
              <strong>50%</strong>
              <span>OFF</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
