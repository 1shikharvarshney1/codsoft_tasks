import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const shipping = totalPrice > 50 || totalPrice === 0 ? 0 : 9.99;
  const tax = Math.round(totalPrice * 0.08 * 100) / 100; // 8% sales tax
  const orderTotal = Math.round((totalPrice + shipping + tax) * 100) / 100;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          maxWidth: '600px',
          margin: '2rem auto',
        }}
      >
        <ShoppingBag size={56} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Your Shopping Cart is Empty
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Looks like you haven't added anything to your cart yet. Explore our catalog of featured electronics, gear, and accessories.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="btn btn-outline"
          style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
        >
          Clear Cart
        </button>
      </div>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="card">
          {cartItems.map((item) => (
            <div key={item.productId} className="cart-item">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="cart-item-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                }}
              />

              <div style={{ flex: 1 }}>
                <Link
                  to={`/products/${item.productId}`}
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  {item.name}
                </Link>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Unit Price: ${item.price.toFixed(2)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="qty-display">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.countInStock && item.quantity >= item.countInStock}
                >
                  +
                </button>
              </div>

              {/* Total Item Price */}
              <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 700, fontSize: '1.05rem' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.productId)}
                className="btn btn-danger"
                style={{ padding: '0.45rem', borderRadius: '8px' }}
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div style={{ marginTop: '1.5rem' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Subtotal</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Shipping</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {shipping === 0 ? (
                  <span style={{ color: 'var(--success)' }}>FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Tax (8%)</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                ${tax.toFixed(2)}
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '0.75rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 800,
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${orderTotal.toFixed(2)}</span>
            </div>
          </div>

          {totalPrice < 50 && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginTop: '1rem',
              }}
            >
              Add <strong>${(50 - totalPrice).toFixed(2)}</strong> more for free standard shipping!
            </div>
          )}

          <button
            onClick={handleCheckout}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
