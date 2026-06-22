import React, { useState, useEffect, useRef } from 'react';

export default function InstagramReelCard({ url }) {
  const [isIntersected, setIsIntersected] = useState(false);
  const containerRef = useRef(null);

  // Lazy loading using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load a bit early before scrolling into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Instagram Embed script loader and processor
  useEffect(() => {
    if (!isIntersected) return;

    if (!window.instgrm) {
      const scriptId = 'instagram-embed-script';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }

      const handleLoad = () => {
        window.instgrm?.Embeds.process();
      };

      script.addEventListener('load', handleLoad);
      return () => {
        script.removeEventListener('load', handleLoad);
      };
    } else {
      // If script is already loaded, process the new blockquote
      // Give a tiny timeout to ensure DOM element is rendered
      const timer = setTimeout(() => {
        window.instgrm?.Embeds.process();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isIntersected, url]);

  return (
    <div 
      className="instagram-reel-card animate-zoom" 
      ref={containerRef}
      style={{
        background: '#FFF',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-light)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '480px',
        overflow: 'hidden',
        transition: 'var(--transition-normal)'
      }}
    >
      {isIntersected ? (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ width: '100%', margin: '0', padding: '0', border: 'none' }}
        >
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}
            >
              Loading Instagram Reel...
            </a>
          </div>
        </blockquote>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-light)' }}>
          <div className="spinner-placeholder" style={{ width: '32px', height: '32px', border: '2px solid var(--border-medium)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontSize: '0.8rem' }}>Scroll to load Reel</span>
        </div>
      )}
    </div>
  );
}
