import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const bubbleCoordinates = [
  { top: '15%', left: '-5%' },  // Index 0: Sarees (top-left)
  { top: '22%', right: '-4%' }, // Index 1: Kurtis (top-right)
  { top: '48%', left: '-7%' },  // Index 2: Maxi (center-left)
  { top: '80%', right: '-3%' }, // Index 3: Nightwear (bottom-right)
  { top: '78%', left: '-2%' },  // Index 4: Hijabs (bottom-left)
  { top: '50%', right: '-6%' }  // Index 5: Accessories (center-right)
];

const presetStyles = {
  sarees: {
    gradient: 'linear-gradient(135deg, #F8F4FA 0%, #E9D8EF 100%)', // Soft Lavender
    accentColor: '#B06BB3',
    glowColor: 'rgba(176, 107, 179, 0.4)',
    tagline: 'Exquisite Heritage Organza & Silk'
  },
  kurtis: {
    gradient: 'linear-gradient(135deg, #FFF1F3 0%, #FAD0D6 100%)', // Soft Rose Pink
    accentColor: '#D8A7B1', // Rose Gold Accent
    glowColor: 'rgba(216, 167, 177, 0.45)',
    tagline: 'Fusion of Ethnic Chikankari & Modern Flair'
  },
  maxi: {
    gradient: 'linear-gradient(135deg, #FAF2F3 0%, #E8C1C7 100%)', // Dusty Rose
    accentColor: '#C58A96',
    glowColor: 'rgba(197, 138, 150, 0.4)',
    tagline: 'Flowing Silhouettes for Modern Evenings'
  },
  nightwear: {
    gradient: 'linear-gradient(135deg, #F6EFF9 0%, #D7BDE2 100%)', // Light Purple
    accentColor: '#8E4F90',
    glowColor: 'rgba(142, 79, 144, 0.4)',
    tagline: 'Slip Into Unrivaled Satin Loungewear'
  },
  hijabs: {
    gradient: 'linear-gradient(135deg, #FDFCF9 0%, #F5EFEB 100%)', // Cream + Beige
    accentColor: '#C4A484', // Warm Beige Accent
    glowColor: 'rgba(196, 164, 132, 0.4)',
    tagline: 'Lightweight & Breathable Premium Drapes'
  },
  accessories: {
    gradient: 'linear-gradient(135deg, #FCFAF4 0%, #F0E6D2 100%)', // Luxury Gold Tint
    accentColor: '#D4AF37', // Gold Accent
    glowColor: 'rgba(212, 175, 55, 0.4)',
    tagline: 'Luxury Crossbodies & Fine Jewelry Pieces'
  }
};

export default function Hero({ onNavigate, categories, heroSlides }) {
  const slides = heroSlides || [];

  if (slides.length === 0) {
    return null;
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  
  const activeIndexBounded = activeIndex < slides.length ? activeIndex : 0;
  const activeSlide = slides[activeIndexBounded] || slides[0];
  
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(null);
  
  const minSwipeDistance = 50;

  // Autoplay intervals (4.5s) - pauses on mouse hover
  useEffect(() => {
    if (!isHovered && slides.length > 0) {
      timerRef.current = setInterval(() => {
        setActiveIndex(prev => (prev >= slides.length - 1 ? 0 : prev + 1));
      }, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, slides.length]);

  // Handle manual category switches
  const handleCategorySwitch = (idx) => {
    setActiveIndex(idx);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Mouse Move tracking for Parallax calculations
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const offsetX = (clientX - window.innerWidth / 2) * 0.02; // slow parallax speed
    const offsetY = (clientY - window.innerHeight / 2) * 0.02;
    setMouseOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffset({ x: 0, y: 0 });
    isDragging.current = false;
    dragStartX.current = null;
  };

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveIndex(prev => (prev >= slides.length - 1 ? 0 : prev + 1));
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (isRightSwipe) {
      setActiveIndex(prev => (prev <= 0 ? slides.length - 1 : prev - 1));
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Mouse Drag Swipe handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button') || e.target.closest('a')) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current || dragStartX.current === null) return;
    isDragging.current = false;
    const distance = dragStartX.current - e.clientX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveIndex(prev => (prev >= slides.length - 1 ? 0 : prev + 1));
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (isRightSwipe) {
      setActiveIndex(prev => (prev <= 0 ? slides.length - 1 : prev - 1));
      if (timerRef.current) clearInterval(timerRef.current);
    }
    dragStartX.current = null;
  };

  // Helper function to resolve dynamic CTA action link from admin slide dashboard
  const handleNavigateUrl = (link) => {
    if (!link) {
      onNavigate('shop');
      return;
    }
    const lowerLink = link.toLowerCase().trim();
    if (lowerLink.includes('/category/')) {
      const parts = link.split('/');
      const category = parts[parts.length - 1];
      onNavigate('shop', category);
    } else if (lowerLink.includes('/product/')) {
      const parts = link.split('/');
      const productId = parts[parts.length - 1];
      onNavigate('shop', null, false, false, productId);
    } else if (lowerLink.includes('shop')) {
      onNavigate('shop');
    } else if (lowerLink.includes('home') || lowerLink === '/') {
      onNavigate('home');
    } else {
      const cleanLink = link.startsWith('/') ? link.substring(1) : link;
      onNavigate(cleanLink);
    }
  };

  // Particles generator mock array
  const backgroundParticles = [
    { top: '15%', left: '10%', size: '6px', delay: '0s' },
    { top: '45%', left: '25%', size: '10px', delay: '1.5s' },
    { top: '75%', left: '8%', size: '8px', delay: '3s' },
    { top: '25%', left: '75%', size: '12px', delay: '0.8s' },
    { top: '60%', left: '90%', size: '7px', delay: '2.2s' },
    { top: '85%', left: '60%', size: '11px', delay: '1.2s' }
  ];

  return (
    <section 
      className="hero-luxury-section"
      style={{ background: activeSlide.gradient }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Floating Particles in background */}
      {backgroundParticles.map((pt, idx) => (
        <div
          key={idx}
          className="hero-particle"
          style={{
            top: pt.top,
            left: pt.left,
            width: pt.size,
            height: pt.size,
            backgroundColor: activeSlide.accentColor,
            animationDelay: pt.delay,
            transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`
          }}
        ></div>
      ))}

      <div className="container hero-luxury-container">
        
        {/* Left Side: Editorial Typography Content */}
        <div className="hero-editorial-content">
          <div className="hero-editorial-tag animate-fade" key={activeSlide.id + '-tag'}>
            <Sparkles size={14} style={{ color: activeSlide.accentColor }} />
            <span>{activeSlide.tagline || "NEW COLLECTION"}</span>
          </div>

          <h1 className="hero-editorial-title" key={activeSlide.id + '-title'} style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
            {activeSlide.title}
          </h1>

          <p className="hero-editorial-desc" key={activeSlide.id + '-desc'}>
            {activeSlide.description}
          </p>

          <div className="hero-editorial-actions">
            <button 
              className="btn btn-primary btn-luxury-shop"
              style={{ backgroundColor: activeSlide.accentColor, borderColor: activeSlide.accentColor, display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => handleNavigateUrl(activeSlide.link)}
            >
              {activeSlide.buttonText || 'Shop Now'}
              <ArrowRight size={18} />
            </button>
            <button 
              className="btn btn-secondary btn-luxury-arrivals"
              onClick={() => onNavigate('shop', null, false, true)}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Fashion Model Showcase */}
        <div className="hero-model-showcase">
          
          {/* Main Visual Image container */}
          <div 
            className="model-showcase-frame-wrapper"
            style={{ 
              transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
              boxShadow: `0 20px 50px ${activeSlide.glowColor || 'rgba(0,0,0,0.15)'}`
            }}
          >
            <div className="showcase-glow-backdrop" style={{ backgroundColor: activeSlide.accentColor }}></div>
            
            {/* Overlapping cross-fade images */}
            {slides.map((slide, idx) => (
              <img
                key={slide.id || idx}
                src={getOptimizedImageUrl(slide.image, 1200)}
                alt={slide.title || 'Slide Image'}
                className={`showcase-model-img ${activeIndexBounded === idx ? 'visible' : ''}`}
                loading="eager"
                draggable="false"
                style={{ pointerEvents: 'none' }}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Centered Indicator Dots */}
      <div className="hero-slider-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`hero-dot-btn ${activeIndexBounded === idx ? 'active' : ''}`}
            style={{
              backgroundColor: activeIndexBounded === idx ? activeSlide.accentColor : 'rgba(0,0,0,0.25)'
            }}
            onClick={() => handleCategorySwitch(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
