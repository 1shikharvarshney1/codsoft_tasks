import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <div className="logo" style={{ marginBottom: '1rem' }}>
            <ShoppingBag size={24} />
            <span>NovaStore</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '320px' }}>
            Premium e-commerce platform delivering curated modern electronics, audio, accessories, and home goods with seamless Stripe checkout.
          </p>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>Customer Benefits</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} color="var(--primary)" /> Free shipping on orders over $50
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--primary)" /> Secure 256-bit encrypted checkout
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} color="var(--primary)" /> 30-day money-back guarantee
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <a href="/" style={{ textDecoration: 'none' }}>Product Catalog</a>
            <a href="/cart" style={{ textDecoration: 'none' }}>Shopping Cart</a>
            <a href="/login" style={{ textDecoration: 'none' }}>Customer Portal</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} NovaStore Full-Stack MERN E-Commerce. Built with React, Express, MongoDB & Stripe.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
