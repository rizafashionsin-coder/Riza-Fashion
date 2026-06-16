import React, { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="newsletter-section section">
      <div className="container">
        
        <div className="newsletter-card animate-slide-up">
          <div className="newsletter-overlay-gradient"></div>
          
          <div className="newsletter-content">
            
            {/* Header info */}
            <div className="newsletter-header-info">
              <div className="newsletter-sparkle-row">
                <Sparkles size={16} className="color-accent" />
                <span>Join The Riza Circle</span>
              </div>
              <h2 className="newsletter-title">Get Exclusive Fashion Updates</h2>
              <p className="newsletter-description">
                Subscribe to our newsletter to receive weekly style lookbooks, private capsule drops, and early invitations to 50% flash sales.
              </p>
            </div>

            {/* Interactive Form or Success State */}
            {isSubscribed ? (
              <div className="newsletter-success-message animate-fade">
                <div className="success-icon-badge">
                  <Check size={28} />
                </div>
                <div className="success-text-info">
                  <h3>Subscription Successful!</h3>
                  <p>
                    Welcome to the Riza family. Use code <code className="success-coupon-code">WELCOME10</code> at checkout to get <strong>10% OFF</strong> your first order!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <div className="newsletter-input-wrapper">
                  <Mail size={18} className="mail-input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email Address for newsletter"
                  />
                </div>
                <button type="submit" className="btn btn-accent newsletter-subscribe-btn">
                  Subscribe
                </button>
              </form>
            )}

            <p className="newsletter-footer-text">
              We care about your privacy. Unsubscribe at any time.
            </p>

          </div>
        </div>

      </div>
    </section>
  );
}
