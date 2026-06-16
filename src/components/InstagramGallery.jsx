import { Heart } from 'lucide-react';

const Instagram = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
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

export default function InstagramGallery() {
  const images = [
    {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
      likes: "1.2k"
    },
    {
      url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80",
      likes: "940"
    },
    {
      url: "https://images.unsplash.com/photo-1608930261073-455b55021571?auto=format&fit=crop&w=400&q=80",
      likes: "2.1k"
    },
    {
      url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
      likes: "1.5k"
    },
    {
      url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80",
      likes: "870"
    },
    {
      url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
      likes: "1.8k"
    }
  ];

  return (
    <section className="instagram-section section">
      <div className="container">
        
        <div className="section-header">
          <span className="section-subtitle">Style Lookbook</span>
          <h2 className="section-title">Shop The Look on Instagram</h2>
          <p className="section-description">
            Share your style journey! Tag us on Instagram using <strong>#RizaElegance</strong> to be featured on our digital lookbook wall.
          </p>
        </div>

        <div className="instagram-grid">
          {images.map((item, idx) => (
            <a 
              key={idx} 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="instagram-grid-item"
            >
              <img src={item.url} alt={`Lookbook ${idx}`} loading="lazy" />
              
              {/* Overlay elements */}
              <div className="instagram-overlay">
                <div className="overlay-elements-row">
                  <div className="likes-indicator">
                    <Heart size={16} fill="var(--secondary)" />
                    <span>{item.likes}</span>
                  </div>
                  <Instagram size={24} className="insta-icon" />
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
