import { Mail, Phone, MapPin, Heart } from 'lucide-react';

const Instagram = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
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

const Facebook = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Youtube = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export default function Footer({ onNavigate, settings, categories }) {
  const handleLinkClick = (view, category = null) => {
    onNavigate(view, category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contact = settings || {
    businessName: "Riza Fashions",
    businessEmail: "care@rizafashions.com",
    customerSupportEmail: "support@rizafashions.com",
    mobileNumber: "+91 98765 43210",
    whatsAppNumber: "919876543210",
    businessAddress: "102, Lavender Boulevard, Fashion District, Mumbai, 400001",
    instagramLink: "https://instagram.com",
    facebookLink: "https://facebook.com",
    youtubeLink: "https://youtube.com"
  };

  return (
    <footer className="footer">
      <div className="container footer-grid-container">
        
        {/* About Column */}
        <div className="footer-col about-col">
          <div className="footer-logo" onClick={() => handleLinkClick('home')}>
            <img src="/logo-transparent.png" className="footer-brand-logo" alt="Riza Fashions" />
          </div>
          <p className="footer-about-text">
            Elegance crafted for every woman. We design premium garments using the finest fabrics, detailed embroidery, and contemporary cuts to celebrate your unique identity.
          </p>
          <div className="footer-social-row">
            {contact.instagramLink && (
              <a href={contact.instagramLink} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            )}
            {contact.facebookLink && (
              <a href={contact.facebookLink} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            )}
            {contact.youtubeLink && (
              <a href={contact.youtubeLink} target="_blank" rel="noreferrer" aria-label="Youtube">
                <Youtube size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Company Column */}
        <div className="footer-col">
          <h4>Company</h4>
          <ul className="footer-links-list">
            <li><button onClick={() => handleLinkClick('about')}>About Us</button></li>
            <li><button onClick={() => handleLinkClick('contact')}>Contact Us</button></li>
            <li><button onClick={() => handleLinkClick('shop')}>Shop Collections</button></li>
          </ul>
        </div>

        {/* Categories Column */}
        <div className="footer-col">
          <h4>Categories</h4>
          <ul className="footer-links-list">
            {categories && categories.length > 0 ? (
              categories.filter(cat => cat.active !== false).map(cat => (
                <li key={cat.id}>
                  <button onClick={() => handleLinkClick('shop', cat.id)}>{cat.name}</button>
                </li>
              ))
            ) : (
              <>
                <li><button onClick={() => handleLinkClick('shop', 'sarees')}>Sarees Collection</button></li>
                <li><button onClick={() => handleLinkClick('shop', 'kurtis')}>Kurtis & Anarkalis</button></li>
                <li><button onClick={() => handleLinkClick('shop', 'maxi')}>Maxi Gowns</button></li>
                <li><button onClick={() => handleLinkClick('shop', 'nightwear')}>Satin Night Wears</button></li>
                <li><button onClick={() => handleLinkClick('shop', 'hijabs')}>Premium Hijabs</button></li>
                <li><button onClick={() => handleLinkClick('shop', 'accessories')}>Women Accessories</button></li>
              </>
            )}
          </ul>
        </div>

        {/* Customer Service Column */}
        <div className="footer-col">
          <h4>Customer Service</h4>
          <ul className="footer-links-list">
            <li><button onClick={() => handleLinkClick('shipping-policy')}>Shipping Policy</button></li>
            <li><button onClick={() => handleLinkClick('refund-policy')}>Refund Policy</button></li>
            <li><button onClick={() => handleLinkClick('terms-conditions')}>Terms & Conditions</button></li>
            <li><button onClick={() => handleLinkClick('privacy-policy')}>Privacy Policy</button></li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="footer-col contact-col">
          <h4>Contact Us</h4>
          <ul className="footer-contact-list">
            {contact.businessAddress && (
              <li>
                <MapPin size={16} className="contact-icon" style={{ flexShrink: 0 }} />
                <span>{contact.businessAddress}</span>
              </li>
            )}
            {contact.mobileNumber && (
              <li>
                <Phone size={16} className="contact-icon" style={{ flexShrink: 0 }} />
                <span>{contact.mobileNumber}</span>
              </li>
            )}
            {contact.whatsAppNumber && (
              <li>
                <Phone size={16} className="contact-icon" style={{ flexShrink: 0 }} />
                <span>WhatsApp: +{contact.whatsAppNumber}</span>
              </li>
            )}
            {contact.businessEmail && (
              <li>
                <Mail size={16} className="contact-icon" style={{ flexShrink: 0 }} />
                <span>{contact.businessEmail}</span>
              </li>
            )}
          </ul>
        </div>

      </div>

      {/* Footer Bottom copyright and payments */}
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p className="copyright-text">
            © 2026 Riza Fashions. Crafted with <Heart size={10} fill="var(--accent)" className="copyright-heart" /> for elegant souls.
          </p>
          
          <div className="payment-badges-row">
            <span className="payment-badge" title="Visa">Visa</span>
            <span className="payment-badge" title="Mastercard">Mastercard</span>
            <span className="payment-badge" title="Google Pay">GPay</span>
            <span className="payment-badge" title="Apple Pay">Apple Pay</span>
            <span className="payment-badge" title="UPI Secure">UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
