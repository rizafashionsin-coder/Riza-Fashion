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

        <div className="categories-round-list">
          {displayCategories.map((category, idx) => (
            <button 
              key={category.id || idx} 
              className="category-round-item"
              onClick={() => onNavigate('shop', category.id)}
            >
              <div className="category-round-image-wrapper">
                <img 
                  className="category-round-img"
                  src={category.image} 
                  alt={category.name} 
                  loading="lazy"
                />
              </div>
              <span className="category-round-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
