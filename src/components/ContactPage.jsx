import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, ChevronRight, Check } from 'lucide-react';

export default function ContactPage({ onNavigate, settings }) {
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

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setContactSubmitted(false), 6000);
  };

  return (
    <div className="page-contact-container">
      <div className="container">
        
        {/* Breadcrumb Row */}
        <nav className="breadcrumb-nav margin-bottom" style={{ paddingTop: '20px' }}>
          <button onClick={() => onNavigate('home')}>Home</button>
          <ChevronRight size={12} className="breadcrumb-separator" />
          <span className="breadcrumb-active">Contact Stylist</span>
        </nav>

        <div className="checkout-layout-grid contact-layout-grid" style={{ paddingBottom: '80px', marginTop: '10px' }}>
          
          {/* Left: Contact Form Card */}
          <div className="checkout-forms-column">
            <div className="checkout-form-card">
              <h2 className="contact-panel-title" style={{ fontFamily: 'var(--font-headings)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
                Write To Our Stylists
              </h2>
              <p className="contact-panel-desc" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                Have inquiries regarding customization border embroidery, custom sizes fit, or bridal collections? Complete the form below, and our stylist designers will connect with you.
              </p>

              {contactSubmitted ? (
                <div className="contact-success-alert animate-fade" style={{ display: 'flex', gap: '16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px', border: '1px solid rgba(176,107,179,0.2)' }}>
                  <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={20} />
                  </div>
                  <div className="alert-content">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Message Transmitted Successfully</h3>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>Thank you! Our personal fashion stylist will contact you at your email address within 2-4 hours.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="contact-form">
                  <div className="checkout-form-row grid-2-col">
                    <div className="form-field">
                      <label>Your Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Maya Iyer" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        placeholder="e.g. maya@gmail.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-field" style={{ marginTop: '20px' }}>
                    <label>Subject</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Saree border customization enquiry" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-field" style={{ marginTop: '20px', marginBottom: '24px' }}>
                    <label>Message details</label>
                    <textarea 
                      className="form-input text-area-input" 
                      rows="5" 
                      placeholder="Tell us how we can help you..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-dark btn-block">
                    Send Enquiry Message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Direct Channels Sidebar */}
          <aside className="checkout-summary-column">
            
            <div className="summary-card" style={{ marginBottom: '24px' }}>
              <h3 className="summary-card-title" style={{ marginBottom: '20px' }}>Direct Support</h3>
              <ul className="channel-links" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {contact.mobileNumber && (
                  <li style={{ display: 'flex', gap: '16px' }}>
                    <Phone className="channel-icon" style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--charcoal)' }}>Stylist Helpline</strong>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{contact.mobileNumber} (10:00 AM - 7:00 PM IST)</p>
                    </div>
                  </li>
                )}
                {contact.businessEmail && (
                  <li style={{ display: 'flex', gap: '16px' }}>
                    <MessageSquare className="channel-icon" style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--charcoal)' }}>Email Enquiries</strong>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{contact.businessEmail}</p>
                    </div>
                  </li>
                )}
                {contact.businessAddress && (
                  <li style={{ display: 'flex', gap: '16px' }}>
                    <MapPin className="channel-icon" style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--charcoal)' }}>Flagship Boutique</strong>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{contact.businessAddress}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <div className="summary-card" style={{ marginBottom: '24px' }}>
              <h3 className="summary-card-title" style={{ marginBottom: '16px' }}>Store Hours</h3>
              <table className="hours-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 500 }}>Monday - Saturday</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>10:00 AM - 8:00 PM</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 500 }}>Sunday</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>11:00 AM - 6:00 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* WhatsApp Chat CTA */}
            {contact.whatsAppNumber && (
              <a 
                href={`https://wa.me/${contact.whatsAppNumber.replace(/[^0-9]/g, '')}`}
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-accent btn-block"
                style={{ display: 'flex', gap: '10px', padding: '16px 0', justifyContent: 'center' }}
              >
                <MessageSquare size={18} />
                <span>Chat on WhatsApp</span>
              </a>
            )}

          </aside>

        </div>
      </div>
    </div>
  );
}
