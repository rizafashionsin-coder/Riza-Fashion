import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

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

export default function Hero({ onNavigate, categories }) {
  const displayCategories = categories && categories.length > 0 ? categories : [
    {
      id: 'sarees',
      name: 'Sarees',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      description: 'Elegant drapes & silk fabrics'
    },
    {
      id: 'kurtis',
      name: 'Kurtis',
      image: 'https://images.unsplash.com/photo-1608930261073-455b55021571?auto=format&fit=crop&w=800&q=80',
      description: 'Ethnic and modern wear fusion'
    },
    {
      id: 'maxi',
      name: 'Maxis',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
      description: 'Flowing silhouettes for dinners'
    },
    {
      id: 'nightwear',
      name: 'Night Wears',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
      description: 'Unwind in pure satin and cotton'
    },
    {
      id: 'hijabs',
      name: 'Hijabs',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      description: 'Breathable premium wraps'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      description: 'Luxury handbags & pendant sets'
    }
  ];

  const slides = displayCategories.map(cat => {
    const stylePreset = presetStyles[cat.id] || {
      gradient: 'linear-gradient(135deg, #FDFCF9 0%, #F5EFEB 100%)',
      accentColor: '#B06BB3',
      glowColor: 'rgba(176, 107, 179, 0.3)',
      tagline: cat.description || 'Premium Custom Collection'
    };
    return {
      id: cat.id,
      name: cat.name,
      tagline: stylePreset.tagline,
      image: cat.image,
      gradient: stylePreset.gradient,
      accentColor: stylePreset.accentColor,
      glowColor: stylePreset.glowColor,
      textTag: cat.name
    };
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  
  const activeIndexBounded = activeIndex < slides.length ? activeIndex : 0;
  const activeSlide = slides[activeIndexBounded] || {
    id: 'default',
    name: 'Collection',
    tagline: 'Premium Women\'s Wear Collection',
    image: '',
    gradient: 'linear-gradient(135deg, #FDFCF9 0%, #F5EFEB 100%)',
    accentColor: '#B06BB3',
    glowColor: 'rgba(176, 107, 179, 0.3)',
    textTag: 'Collection'
  };
  
  const timerRef = useRef(null);

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
    // Force reset timer by temporarily toggling hover state
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
          <div className="hero-editorial-tag animate-fade">
            <Sparkles size={14} style={{ color: activeSlide.accentColor }} />
            <span>Premium Women's Wear Collection</span>
          </div>

          <h1 className="hero-editorial-title">
            Elegance Crafted <br />
            <span style={{ 
              color: activeSlide.accentColor,
              textShadow: `0 0 20px ${activeSlide.glowColor}`
            }}>
              For Every Woman
            </span>
          </h1>

          <h2 className="hero-editorial-tagline animate-slide-up" key={activeSlide.id}>
            {activeSlide.tagline}
          </h2>

          <p className="hero-editorial-desc">
            Discover premium fashion collections designed to celebrate your unique style. 
            Tailored with the finest fabrics, elegant drapes, and modern cuts.
          </p>

          <div className="hero-editorial-actions">
            <button 
              className="btn btn-primary btn-luxury-shop"
              style={{ backgroundColor: activeSlide.accentColor, borderColor: activeSlide.accentColor }}
              onClick={() => onNavigate('shop', activeSlide.id)}
            >
              Shop Now
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
              boxShadow: `0 20px 50px ${activeSlide.glowColor}`
            }}
          >
            <div className="showcase-glow-backdrop" style={{ backgroundColor: activeSlide.accentColor }}></div>
            
            {/* Overlapping cross-fade images */}
            {slides.map((slide, idx) => (
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.name}
                className={`showcase-model-img ${activeIndexBounded === idx ? 'visible' : ''}`}
                loading="eager"
              />
            ))}
          </div>

          {/* Desktop Circular Floating Category Nodes */}
          {slides.slice(0, 6).map((slide, idx) => {
            const isActive = activeIndexBounded === idx;
            return (
              <button
                key={slide.id}
                className={`category-float-node ${isActive ? 'active' : ''}`}
                style={{
                  ...bubbleCoordinates[idx],
                  transform: `translate(${mouseOffset.x * 1.5}px, ${mouseOffset.y * 1.5}px)`,
                  '--glow-color': slide.glowColor,
                  '--accent-color': slide.accentColor,
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.55)), url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onMouseEnter={() => handleCategorySwitch(idx)}
                onClick={() => onNavigate('shop', slide.id)}
              >
                <span className="node-text" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{slide.textTag}</span>
              </button>
            );
          })}

        </div>

      </div>

      {/* Mobile Swipeable Category Pills Bar */}
      <div className="mobile-category-swiper-bar">
        <div className="swiper-scroller no-scrollbar">
          {slides.map((slide, idx) => {
            const isActive = activeIndexBounded === idx;
            return (
              <button
                key={slide.id}
                className={`swiper-pill-btn ${isActive ? 'active' : ''}`}
                style={isActive ? { backgroundColor: slide.accentColor, color: '#fff' } : {}}
                onClick={() => onNavigate('shop', slide.id)}
              >
                {slide.name}
              </button>
            );
          })}
        </div>
      </div>

    </section>
  );
}
