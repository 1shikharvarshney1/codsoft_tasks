import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      '::placeholder': {
        color: '#94a3b8',
      },
      iconColor: '#4f46e5',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

const StripeCheckoutForm = ({ clientSecret, isSimulated, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [testCardNumber, setTestCardNumber] = useState('4242 •••• •••• 4242');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMessage('');

    // If Stripe is operating in sandbox simulated fallback
    if (isSimulated || !stripe || !elements) {
      setTimeout(() => {
        setProcessing(false);
        onSuccess({
          id: clientSecret.split('_secret_')[0] || `ch_sim_${Date.now()}`,
          status: 'succeeded',
          update_time: new Date().toISOString(),
        });
      }, 1200);
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment processing failed.');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess({
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment failed.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}
        >
          <label className="form-label" style={{ marginBottom: 0 }}>
            Credit or Debit Card (Stripe Test Mode)
          </label>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
            ● Test Mode Active
          </span>
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            backgroundColor: '#ffffff',
          }}
        >
          {isSimulated || !stripe ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <CreditCard size={20} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Simulated Stripe Test Mode</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Click below to simulate immediate test approval, or configure valid Stripe keys in <code>.env</code>.
              </p>
            </div>
          ) : (
            <CardElement options={cardElementOptions} />
          )}
        </div>
      </div>

      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          color: '#1e40af',
          marginBottom: '1.5rem',
        }}
      >
        <strong>Stripe Test Card:</strong> <code>4242 4242 4242 4242</code> | Exp: <code>12/28</code> | CVC: <code>123</code>
      </div>

      {errorMessage && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={processing}
        className="btn btn-primary"
        style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
      >
        {processing ? (
          'Processing Payment...'
        ) : (
          <>
            <Lock size={18} />
            <span>Pay ${amount?.toFixed(2)} Securely</span>
          </>
        )}
      </button>
    </form>
  );
};

export default StripeCheckoutForm;
