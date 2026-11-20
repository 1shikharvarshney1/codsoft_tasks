import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, LogOut, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <ShoppingBag size={28} />
          <span>NovaStore</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Shop
          </Link>

          <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            <span>Cart</span>
            {totalCount > 0 && <span className="badge-count">{totalCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/orders" className="nav-link" title="My Orders">
                <PackageCheck size={20} />
                <span>Orders</span>
              </Link>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#f1f5f9',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <User size={16} color="#4f46e5" />
                <span>{user?.name?.split(' ')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                title="Log Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
