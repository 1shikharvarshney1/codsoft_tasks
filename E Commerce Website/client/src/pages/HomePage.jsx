import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch distinct categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosClient.get('/products/categories/list');
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with active filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;
      if (sortBy) params.sort = sortBy;

      const { data } = await axiosClient.get('/products', { params });
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      setError('Failed to fetch products. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [keyword, selectedCategory, minPrice, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 'var(--radius)',
          padding: '3rem 2rem',
          color: 'white',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <span
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.85rem',
            color: '#a5b4fc',
            fontWeight: 700,
          }}
        >
          Curated Catalog • Autumn Collection
        </span>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginTop: '0.5rem',
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}
        >
          Discover Exceptional Gear & Lifestyle Essentials
        </h1>
        <p style={{ maxWidth: '600px', color: '#e0e7ff', fontSize: '1.05rem' }}>
          Explore premium electronics, high-fidelity audio, and modern handcrafted accessories with fast global delivery and guaranteed quality.
        </p>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Filters</h3>
            </div>
            <button
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Reset all filters"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Category</h4>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Price Range ($)</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-field"
                min="0"
                style={{ padding: '0.5rem' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-field"
                min="0"
                style={{ padding: '0.5rem' }}
              />
            </div>
          </div>
        </aside>

        {/* Products Main View */}
        <div>
          {/* Controls Bar: Search & Sort */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              background: 'white',
              padding: '1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search products by title or description..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
                style={{ width: 'auto', padding: '0.6rem 1rem' }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Results Count Banner */}
          <div
            style={{
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
          </div>

          {/* Loading state */}
          {loading && <div className="spinner"></div>}

          {/* Error state */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: 'var(--text-muted)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                No products found
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                Try adjusting your search criteria, category selection, or price filters.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
