import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Filter, SlidersHorizontal, Grid, List, X, Info } from 'lucide-react';
import ProductCard from './ProductCard';

export default function CategoryPage({
  categoryName,
  products,
  wishlist,
  onWishlistToggle,
  onAddToCart,
  onNavigate,
  categories
}) {
  const matchedDbCategory = categories?.find(cat => cat.id === categoryName);
  
  const isAllProducts = !categoryName || categoryName === 'all';

  const currentConfig = isAllProducts ? {
    title: "All Collections",
    description: "Browse our complete catalog of premium fashion.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
  } : matchedDbCategory ? {
    title: matchedDbCategory.name,
    description: matchedDbCategory.description || "Explore our premium fashion silhouettes designed to celebrate your unique identity.",
    image: matchedDbCategory.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
  } : {
    title: categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : "Collection",
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
    // If no category selected (All Products view), skip category filter
    let list = isAllProducts
      ? [...products]
      : products.filter(p => p.category === categoryName);

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
      list = list.filter(p => p.featured === true || p.isFeatured === true);
    }

    // Discounted Check
    if (filterDiscounted) {
      list = list.filter(p => p.discount > 0);
    }

    // Availability Filter
    if (filterInStock) {
      list = list.filter(p => {
        if (p.variants && Array.isArray(p.variants)) {
          return p.variants.some(v => v.sizes && Object.values(v.sizes).some(stock => stock > 0));
        }
        if (p.sizeStock) {
          return Object.values(p.sizeStock).some(stock => stock > 0);
        }
        return p.stock !== 0;
      });
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
  }, [products, categoryName, isAllProducts, searchVal, maxPrice, filterNew, filterBest, filterFeatured, filterDiscounted, filterInStock, sortBy]);

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
  const activeCategories = categories ? categories.filter(cat => cat.active !== false) : [];
  const categoriesList = activeCategories;

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
            {/* All Products button */}
            <button
              className={`category-nav-item ${isAllProducts ? 'active' : ''}`}
              onClick={() => onNavigate('shop', 'all')}
            >
              All Products
            </button>
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
                {/* All Products link */}
                <button 
                  className={`widget-cat-link ${isAllProducts ? 'active' : ''}`}
                  onClick={() => onNavigate('shop', 'all')}
                >
                  <span>All Products</span>
                  <ChevronRight size={14} />
                </button>
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
                  {/* All Products button in mobile drawer */}
                  <button 
                    className={`drawer-cat-btn ${isAllProducts ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate('shop', 'all');
                      setIsFilterDrawerOpen(false);
                    }}
                  >
                    All Products
                  </button>
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
