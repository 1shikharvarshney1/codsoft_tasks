import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Check, Truck, ShieldCheck } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/products/${id}`);
        if (data.success) {
          setProduct(data.data);
        }
      } catch (err) {
        setError('Unable to load product information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.countInStock > 0) {
      addToCart(product, quantity);
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 2000);
    }
  };

  if (loading) return <div className="spinner"></div>;

  if (error || !product) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'This product does not exist.'}</p>
        <Link to="/" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const inStock = product.countInStock > 0;

  return (
    <div>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontWeight: 600,
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="detail-container">
        {/* Product Media Column */}
        <div className="detail-img-wrap">
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Product Information Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                textTransform: 'uppercase',
              }}
            >
              {product.category}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Brand: <strong>{product.brand}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div className="product-rating" style={{ marginBottom: 0 }}>
              <Star size={18} fill="currentColor" />
              <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{product.rating}</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              • ({product.numReviews} verified customer reviews)
            </span>
          </div>

          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--primary)',
              marginBottom: '1.5rem',
            }}
          >
            ${product.price.toFixed(2)}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Overview</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {product.description}
            </p>
          </div>

          {/* Stock & Quantity Control */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Availability:</span>
              {inStock ? (
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
                  In Stock ({product.countInStock} available)
                </span>
              ) : (
                <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem' }}>
                  Out of Stock
                </span>
              )}
            </div>

            {inStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quantity:</span>
                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.countInStock, q + 1))}
                    disabled={quantity >= product.countInStock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.85rem' }}
            >
              {addedMessage ? (
                <>
                  <Check size={18} />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                handleAddToCart();
                navigate('/cart');
              }}
              disabled={!inStock}
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.5rem' }}
            >
              Buy Now
            </button>
          </div>

          {/* Perks list */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} color="var(--primary)" />
              <span>Free standard delivery on orders over $50</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Official 1-Year Manufacturer Warranty included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
