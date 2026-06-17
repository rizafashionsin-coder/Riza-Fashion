import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Filter, SlidersHorizontal, Grid, List, X, Info } from 'lucide-react';
import ProductCard from './ProductCard';

export default function CategoryPage({
  categoryName,
  products,
  wishlist,
  onWishlistToggle,
  onAddToCart,
  onQuickView,
  onNavigate
}) {
  // Category configurations
  const categoryConfigs = {
    sarees: {
      title: "Sarees Collection",
      description: "Experience the timeless grace of Indian heritage. Our sarees are meticulously crafted from premium organza, Katan silk, and georgette, featuring hand-embroidered silver and gold zari work.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80"
    },
    kurtis: {
      title: "Kurtis & Anarkalis",
      description: "A gorgeous fusion of ethnic craftsmanship and modern fashion. Explore pleated Anarkalis, knee-length kurtis, and georgette sets detailed with traditional Chikankari lace work.",
      image: "https://images.unsplash.com/photo-1608930261073-455b55021571?auto=format&fit=crop&w=1200&q=80"
    },
    maxi: {
      title: "Maxi Gowns & Dresses",
      description: "Drape yourself in fluid luxury. Featuring heavy satin crepe maxi dresses and abstract floral chiffon tiers, designed for upscale evenings, cocktail parties, and celebrations.",
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
    },
    nightwear: {
      title: "Satin & Cotton Night Wears",
      description: "Cozy evenings meet luxurious comfort. Relax in our premium button-up satin pyjama lounge sets and ribbed organic cotton wide-leg trouser sets, finished with contrast piping.",
      image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80"
    },
    hijabs: {
      title: "Premium Hijabs & Wraps",
      description: "Breathable, lightweight, and structured to prevent slipping. Woven from high-grade bubble chiffon and bamboo modal crimps, hand-hemmed for formal and daily wear.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
    },
    accessories: {
      title: "Luxury Accessories",
      description: "The finishing touch for the elegant soul. Elevate your silhouette with 18k rose gold-plated cubic zirconia necklace pendants, studs, and saffiano vegan leather crossbody clutches.",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80"
    }
  };

  const currentConfig = categoryConfigs[categoryName] || {
    title: "Shop All Collections",
    description: "Explore our premium fashion silhouettes designed to celebrate your unique identity.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
  };

  // Filter States
  const [searchVal, setSearchVal] = useState('');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [filterNew, setFilterNew] = useState(false);
  const [filterBest, setFilterBest] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterDiscounted, setFilterDiscounted] = useState(false);
  const [filterInStock, setFilterInStock] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  
  // Mobile filter drawer toggle
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Pagination states
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 6;

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPageNum(1);
  }, [categoryName]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.category === categoryName);

    // Search query inside category page
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Price Filter
    list = list.filter(p => (p.salePrice || p.price) <= maxPrice);

    // New Arrivals Check
    if (filterNew) {
      list = list.filter(p => p.isNew);
    }

    // Best Sellers Check (Rating >= 4.8)
    if (filterBest) {
      list = list.filter(p => p.rating >= 4.8);
    }

    // Featured Check
    if (filterFeatured) {
      list = list.filter(p => p.isFeatured);
    }

    // Discounted Check
    if (filterDiscounted) {
      list = list.filter(p => p.discount > 0);
    }

    // Availability Filter (Mock: all items are in stock, but simulate)
    if (filterInStock) {
      list = list.filter(p => p.id !== 'out-of-stock-mock'); // simulate check
    }

    // Sort Logic
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, categoryName, searchVal, maxPrice, filterNew, filterBest, filterFeatured, filterDiscounted, filterInStock, sortBy]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPageNum]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPageNum(pageNum);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchVal('');
    setMaxPrice(6000);
    setFilterNew(false);
    setFilterBest(false);
    setFilterFeatured(false);
    setFilterDiscounted(false);
    setFilterInStock(true);
    setSortBy('featured');
  };

  const categoriesList = [
    { id: 'sarees', name: 'Sarees' },
    { id: 'kurtis', name: 'Kurtis' },
    { id: 'maxi', name: 'Maxi Dresses' },
    { id: 'nightwear', name: 'Night Wears' },
    { id: 'hijabs', name: 'Hijabs' },
    { id: 'accessories', name: 'Accessories' }
  ];

  const wishlistSet = useMemo(() => new Set(wishlist.map(p => p.id)), [wishlist]);

  return (
    <div className="category-page-container">
      
      {/* Category Hero Banner */}
      <section className="category-hero-section" style={{ backgroundImage: `linear-gradient(rgba(45, 45, 45, 0.45), rgba(45, 45, 45, 0.7)), url(${currentConfig.image})` }}>
        <div className="container category-hero-content animate-fade">
          <h1 className="category-hero-title">{currentConfig.title}</h1>
          <p className="category-hero-desc">{currentConfig.description}</p>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <div className="category-nav-bar-wrapper">
        <div className="container">
          <div className="category-nav-scroll-container">
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                className={`category-nav-item ${categoryName === cat.id ? 'active' : ''}`}
                onClick={() => onNavigate('shop', cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="container category-layout-main">
        
        {/* Breadcrumbs & Catalog header */}
        <div className="category-catalog-header">
          <nav className="breadcrumb-nav">
            <button onClick={() => onNavigate('home')}>Home</button>
            <ChevronRight size={12} className="breadcrumb-separator" />
            <span className="breadcrumb-active">{currentConfig.title}</span>
          </nav>
          
          <div className="catalog-meta-row">
            <span className="catalog-product-count">
              Showing <strong>{filteredProducts.length}</strong> premium statements
            </span>
            
            <div className="catalog-controls">
              {/* Mobile filter button */}
              <button className="mobile-filter-toggle-btn" onClick={() => setIsFilterDrawerOpen(true)}>
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </button>
              
              <div className="sort-wrapper">
                <span>Sort By:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-dropdown">
                  <option value="featured">Featured Designer</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Split Layout */}
        <div className="category-content-split">
          
          {/* Desktop Filters Sidebar */}
          <aside className="category-filters-sidebar">
            <div className="sidebar-widget">
              <h3 className="widget-title">Search</h3>
              <div className="sidebar-search-box">
                <input 
                  type="text" 
                  placeholder="Search in this collection..." 
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Shop Collections</h3>
              <div className="widget-categories-list">
                {categoriesList.map(cat => (
                  <button 
                    key={cat.id}
                    className={`widget-cat-link ${categoryName === cat.id ? 'active' : ''}`}
                    onClick={() => onNavigate('shop', cat.id)}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Filter by Price</h3>
              <div className="widget-price-slider">
                <input 
                  type="range" 
                  min="300" 
                  max="6000" 
                  step="100" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="price-range-input"
                />
                <div className="price-slider-labels">
                  <span>₹300</span>
                  <span>Max: <strong>₹{maxPrice}</strong></span>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">Refine By</h3>
              <div className="widget-checkbox-list">
                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filterNew} 
                    onChange={(e) => setFilterNew(e.target.checked)} 
                  />
                  <span>New Arrivals</span>
                </label>
                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filterBest} 
                    onChange={(e) => setFilterBest(e.target.checked)} 
                  />
                  <span>Best Sellers</span>
                </label>
                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filterFeatured} 
                    onChange={(e) => setFilterFeatured(e.target.checked)} 
                  />
                  <span>Featured Products</span>
                </label>
                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filterDiscounted} 
                    onChange={(e) => setFilterDiscounted(e.target.checked)} 
                  />
                  <span>Discounted Offers</span>
                </label>
                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filterInStock} 
                    onChange={(e) => setFilterInStock(e.target.checked)} 
                  />
                  <span>Exclude Out of Stock</span>
                </label>
              </div>
            </div>

            <button className="reset-filters-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </aside>

          {/* Product Catalog Area */}
          <main className="category-products-catalog">
            {paginatedProducts.length === 0 ? (
              <div className="empty-catalog-state text-center">
                <Info size={48} className="empty-catalog-icon" />
                <h3>No Products Found</h3>
                <p>We couldn't find any premium statements matching your selected filter guidelines. Expand your budget slider or clear refinements.</p>
                <button className="btn btn-primary" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {paginatedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistSet.has(product.id)}
                      onWishlistToggle={onWishlistToggle}
                      onAddToCart={onAddToCart}
                      onQuickView={onQuickView}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="catalog-pagination">
                    <button 
                      className="pagination-arrow" 
                      onClick={() => handlePageChange(currentPageNum - 1)}
                      disabled={currentPageNum === 1}
                    >
                      Prev
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button 
                        key={pageNum}
                        className={`pagination-number ${currentPageNum === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button 
                      className="pagination-arrow" 
                      onClick={() => handlePageChange(currentPageNum + 1)}
                      disabled={currentPageNum === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

        </div>

      </div>

      {/* Mobile Filters Drawer Modal */}
      {isFilterDrawerOpen && (
        <div className="mobile-filters-drawer-overlay" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="mobile-filters-drawer-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Catalog Filters</h3>
              <button className="close-drawer-btn" onClick={() => setIsFilterDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="drawer-body">
              <div className="drawer-section">
                <h4>Search</h4>
                <div className="sidebar-search-box" style={{ marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Search in this collection..." 
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                  />
                </div>
              </div>

              <div className="drawer-section">
                <h4>Collections</h4>
                <div className="drawer-cat-buttons">
                  {categoriesList.map(cat => (
                    <button 
                      key={cat.id}
                      className={`drawer-cat-btn ${categoryName === cat.id ? 'active' : ''}`}
                      onClick={() => {
                        onNavigate('shop', cat.id);
                        setIsFilterDrawerOpen(false);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="drawer-section">
                <h4>Filter by Price</h4>
                <div className="widget-price-slider">
                  <input 
                    type="range" 
                    min="300" 
                    max="6000" 
                    step="100" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="price-range-input"
                  />
                  <div className="price-slider-labels">
                    <span>₹300</span>
                    <span>Max: <strong>₹{maxPrice}</strong></span>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h4>Refine Options</h4>
                <div className="widget-checkbox-list">
                  <label className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={filterNew} 
                      onChange={(e) => setFilterNew(e.target.checked)} 
                    />
                    <span>New Arrivals</span>
                  </label>
                  <label className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={filterBest} 
                      onChange={(e) => setFilterBest(e.target.checked)} 
                    />
                    <span>Best Sellers</span>
                  </label>
                  <label className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={filterFeatured} 
                      onChange={(e) => setFilterFeatured(e.target.checked)} 
                    />
                    <span>Featured Products</span>
                  </label>
                  <label className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={filterDiscounted} 
                      onChange={(e) => setFilterDiscounted(e.target.checked)} 
                    />
                    <span>Discounted Offers</span>
                  </label>
                  <label className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={filterInStock} 
                      onChange={(e) => setFilterInStock(e.target.checked)} 
                    />
                    <span>Exclude Out of Stock</span>
                  </label>
                </div>
              </div>

              <div className="drawer-actions">
                <button className="btn btn-secondary btn-block" onClick={handleResetFilters}>
                  Clear All
                </button>
                <button className="btn btn-primary btn-block" onClick={() => setIsFilterDrawerOpen(false)}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
