import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CategorySection({ onNavigate, categories }) {
  const activeCategories = categories ? categories.filter(cat => cat.active !== false) : [];
  const displayCategories = activeCategories.length > 0 ? activeCategories : [
    {
      id: 'sarees',
      name: 'Sarees',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      description: 'Elegant drapes & silk fabrics',
      offer: 'Flat 10% OFF'
    },
    {
      id: 'kurtis',
      name: 'Kurtis',
      image: 'https://images.unsplash.com/photo-1608930261073-455b55021571?auto=format&fit=crop&w=600&q=80',
      description: 'Ethnic and modern wear fusion',
      offer: 'New Season'
    },
    {
      id: 'maxi',
      name: 'Maxi Dresses',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
      description: 'Flowing silhouettes for dinners',
      offer: 'Up to 30% OFF'
    },
    {
      id: 'nightwear',
      name: 'Night Wears',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
      description: 'Unwind in pure satin and cotton',
      offer: 'Buy 2 Get 1'
    },
    {
      id: 'hijabs',
      name: 'Hijabs',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      description: 'Breathable premium wraps',
      offer: 'Starting ₹399'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
      description: 'Luxury handbags & pendant sets',
      offer: 'Rose Gold Plated'
    }
  ];

  return (
    <section className="section categories-section bg-secondary">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Curated Collections</span>
          <h2 className="section-title">Shop By Category</h2>
          <p className="section-description">
            Explore our curated catalog of handpicked pieces designed to inspire. From premium organza sarees to luxury accessories.
          </p>
        </div>

        <div className="categories-grid">
          {displayCategories.map((category, idx) => (
            <div 
              key={category.id || idx} 
              className="category-card"
              onClick={() => onNavigate('shop', category.id)}
            >
              <div className="category-image-wrapper">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  loading="lazy"
                />
                <div className="category-overlay"></div>
                {category.offer && (
                  <span className="category-badge">{category.offer}</span>
                )}
              </div>
              
              <div className="category-content">
                <h3 className="category-title">{category.name}</h3>
                <p className="category-desc">{category.description}</p>
                <span className="category-btn">
                  Explore
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
