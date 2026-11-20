import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosClient.get(`/orders/${id}`);
        if (data.success) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch confirmed order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={{ maxWidth: '640px', margin: '2rem auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Payment & Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Thank you for your purchase. We have received your order and our fulfillment team is preparing your package.
        </p>

        {/* Order Details Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{id}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>
              ● Paid ({order?.paymentMethod || 'Stripe'})
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
              ${order?.totalPrice?.toFixed(2)}
            </span>
          </div>

          {order?.shippingAddress && (
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '0.75rem',
                marginTop: '0.75rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <strong>Shipping to:</strong> {order.shippingAddress.fullName},{' '}
              {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-outline">
            <ShoppingBag size={18} />
            <span>Continue Shopping</span>
          </Link>
          <Link to="/orders" className="btn btn-primary">
            <PackageCheck size={18} />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
