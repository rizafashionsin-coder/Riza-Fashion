import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CategorySection({ onNavigate, categories }) {
  const displayCategories = categories ? categories.filter(cat => cat.active !== false) : [];

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
