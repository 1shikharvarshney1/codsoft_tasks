import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-img-wrap">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />
        {product.countInStock === 0 && (
          <span className="product-badge" style={{ backgroundColor: '#ef4444' }}>
            Out of Stock
          </span>
        )}
        {product.isFeatured && product.countInStock > 0 && (
          <span className="product-badge">Featured</span>
        )}
      </Link>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/products/${product._id}`} className="product-name" title={product.name}>
          {product.name}
        </Link>

        <div className="product-rating">
          <Star size={16} fill="currentColor" />
          <span>{product.rating || '4.5'}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            ({product.numReviews || 0})
          </span>
        </div>

        <div className="product-bottom">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: '8px',
            }}
            title={product.countInStock === 0 ? 'Out of Stock' : 'Add to cart'}
          >
            {added ? (
              <>
                <Check size={16} color="#10b981" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
