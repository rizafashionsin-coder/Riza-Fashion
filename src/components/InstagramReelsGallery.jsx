import React from 'react';
import InstagramReelCard from './InstagramReelCard';

const InstagramIcon = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    width="20" 
    height="20" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const reels = [
  "https://www.instagram.com/reel/DZc53JciFCO/?utm_source=ig_embed&utm_campaign=loading",
  "https://www.instagram.com/reel/DZAMp59SkK7/?utm_source=ig_embed&utm_campaign=loading",
  "https://www.instagram.com/reel/DYwv95lB5M5/?utm_source=ig_embed&utm_campaign=loading",
  "https://www.instagram.com/reel/DYE70q6C4N6/?utm_source=ig_embed&utm_campaign=loading"
];

export default function InstagramReelsGallery() {
  return (
    <section className="instagram-reels-section section">
      <div className="container">
        
        <div className="section-header text-center">
          <span className="section-subtitle">Trending Highlights</span>
          <h2 className="section-title">Follow Us On Instagram</h2>
          <div className="instagram-handle-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            <InstagramIcon style={{ color: 'var(--primary)' }} />
            <a 
              href="https://www.instagram.com/rizafashions.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
              className="instagram-link"
            >
              @rizafashions.in
            </a>
          </div>
          <p className="section-description" style={{ marginTop: '10px' }}>
            Catch our latest collections in motion! Explore dynamic styling guides, boutique drops, and design reels.
          </p>
        </div>

        <div className="instagram-reels-grid">
          {reels.map((url, idx) => (
            <InstagramReelCard key={idx} url={url} />
          ))}
        </div>

      </div>
    </section>
  );
}
