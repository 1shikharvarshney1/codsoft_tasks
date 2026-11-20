import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { MapPin, CreditCard, CheckCircle2, ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import StripeCheckoutForm from '../components/StripeCheckoutForm';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '123 Market Street, Suite 400',
    city: 'San Francisco',
    postalCode: '94105',
    country: 'United States',
    phone: '+1 (555) 234-5678',
  });

  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const shipping = totalPrice > 50 || totalPrice === 0 ? 0 : 9.99;
  const tax = Math.round(totalPrice * 0.08 * 100) / 100;
  const grandTotal = Math.round((totalPrice + shipping + tax) * 100) / 100;

  // Initialize Stripe and fetch config
  useEffect(() => {
    const initStripe = async () => {
      try {
        const { data } = await axiosClient.get('/payment/config');
        const pubKey = data.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_sample';
        setStripePromise(loadStripe(pubKey));
      } catch (err) {
        console.error('Failed to get Stripe config:', err);
      }
    };
    initStripe();
  }, []);

  // When progressing to Payment step, create payment intent
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    try {
      setPaymentLoading(true);
      const { data } = await axiosClient.post('/payment/create-payment-intent', {
        amount: grandTotal,
        currency: 'usd',
      });

      if (data.success) {
        setClientSecret(data.clientSecret);
        setIsSimulated(data.isSimulated || false);
        setStep(2);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to initialize payment gateway.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Called when Stripe checkout succeeds
  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // 1. Create order in MongoDB
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.productId,
          name: item.name,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: 'Stripe',
        itemsPrice: totalPrice,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: grandTotal,
      };

      const { data: orderData } = await axiosClient.post('/orders', orderPayload);
      const orderId = orderData.data._id;

      // 2. Mark order as paid
      await axiosClient.put(`/orders/${orderId}/pay`, {
        id: paymentResult.id,
        status: paymentResult.status,
        update_time: paymentResult.update_time,
        email_address: user.email,
      });

      // 3. Clear local & remote cart
      clearCart();

      // 4. Redirect to order confirmation
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      console.error('Error recording order to database:', err);
      setErrorMsg('Payment succeeded, but recording order failed: ' + err.message);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>No items to checkout</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link to="/" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Checkout Steps Progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= 1 ? 'var(--primary)' : '#e2e8f0',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
            }}
          >
            1
          </div>
          <span>Shipping Address</span>
        </div>

        <div style={{ width: '40px', height: '2px', background: 'var(--border)' }}></div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: step >= 2 ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= 2 ? 'var(--primary)' : '#e2e8f0',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
            }}
          >
            2
          </div>
          <span>Payment (Stripe)</span>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="checkout-layout">
        {/* Left Form Area */}
        <div>
          {step === 1 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <MapPin size={22} color="var(--primary)" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Delivery Details</h2>
              </div>

              <form onSubmit={handleProceedToPayment}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Market St"
                    value={shippingAddress.address}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, address: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal / ZIP Code</label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, country: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, phone: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
                >
                  {paymentLoading ? 'Preparing Payment...' : 'Continue to Payment'}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={22} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Complete Payment</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: 'transparent',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Edit Shipping
                </button>
              </div>

              {/* Shipping address recap */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.9rem',
                  marginBottom: '1.5rem',
                }}
              >
                <strong>Shipping To:</strong> {shippingAddress.fullName}, {shippingAddress.address},{' '}
                {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
              </div>

              {stripePromise && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCheckoutForm
                    clientSecret={clientSecret}
                    isSimulated={isSimulated}
                    amount={grandTotal}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div className="spinner"></div>
              )}
            </div>
          )}
        </div>

        {/* Right Order Summary Area */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </h3>

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {cartItems.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 600,
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Subtotal</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>${totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {shipping === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Sales Tax (8%)</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>${tax.toFixed(2)}</span>
            </div>
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 800,
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
