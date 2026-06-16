import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Sarah Matthews",
      role: "Verified Buyer",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
      text: "I ordered the Organza Saree for my engagement party. The drape was pure elegance, and the soft lavender color is stunning in photos! The premium fabric exceeded my expectations, and the shipping was incredibly fast."
    },
    {
      id: 2,
      name: "Neha Patel",
      role: "Loyal Customer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
      text: "Riza Fashions has become my go-to boutique. The Aria Floral Kurti fits like a dream, and the georgette is so breathable. The customer support is quick, polite, and helped me customize my order size."
    },
    {
      id: 3,
      name: "Fatima Khan",
      role: "Verified Buyer",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
      text: "The Modal Hijabs in Rose Gold and Lilac are absolutely beautiful. They hold their shape perfectly, provide wonderful volume, and don't slide. I've recommended Riza Fashions to all my friends!"
    }
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-play timer
  useEffect(() => {
    const slideTimer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [activeIdx]);

  const handlePrev = () => {
    setActiveIdx(prev => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx(prev => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="testimonials-section section">
      <div className="container">
        
        <div className="section-header">
          <span className="section-subtitle">Customer Voices</span>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-description">
            Read real stories from our valued customers who celebrate their elegant journeys in Riza Fashions.
          </p>
        </div>

        <div className="testimonials-slider-container">
          {/* Quote Mark background decor */}
          <Quote className="quote-decor-left" size={140} />
          
          <button className="slider-arrow-btn arrow-prev" onClick={handlePrev} aria-label="Previous review">
            <ChevronLeft size={24} />
          </button>
          
          <button className="slider-arrow-btn arrow-next" onClick={handleNext} aria-label="Next review">
            <ChevronRight size={24} />
          </button>

          {/* Active testimonial card */}
          <div className="testimonial-card-slide animate-fade">
            <div className="client-image-box">
              <img src={reviews[activeIdx].image} alt={reviews[activeIdx].name} />
            </div>
            
            <div className="client-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={18} 
                  fill={star <= reviews[activeIdx].rating ? "var(--accent)" : "none"} 
                  stroke={star <= reviews[activeIdx].rating ? "var(--accent-dark)" : "var(--border-medium)"}
                />
              ))}
            </div>

            <p className="client-review-text">"{reviews[activeIdx].text}"</p>
            
            <div className="client-bio">
              <strong className="client-name">{reviews[activeIdx].name}</strong>
              <span className="client-role">{reviews[activeIdx].role}</span>
            </div>
          </div>

          {/* Dots selector indicators */}
          <div className="slider-dots-row">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                className={`slider-dot ${activeIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
