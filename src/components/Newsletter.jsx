import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Newsletter() {
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
              <p className="newsletter-description" style={{ marginBottom: 0 }}>
                Subscribe to our newsletter to receive weekly style lookbooks, private capsule drops, and early invitations to 50% flash sales.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

