import Stripe from 'stripe';

const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('your_stripe_secret_key')) {
    return null;
  }
  return new Stripe(secretKey);
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const stripe = getStripeInstance();

    // If Stripe key is configured, create real Stripe PaymentIntent (test mode)
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amounts in cents
        currency,
        metadata: {
          userId: req.user._id.toString(),
          userEmail: req.user.email,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        isSimulated: false,
      });
    }

    // Fallback sandbox simulation if Stripe API key not yet provided in .env
    const simulatedId = `pi_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return res.json({
      success: true,
      clientSecret: `${simulatedId}_secret_simulated`,
      id: simulatedId,
      isSimulated: true,
      message: 'Running in simulated Stripe test mode. Set STRIPE_SECRET_KEY in .env for live Stripe Test card validation.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stripe publishable key configuration
// @route   GET /api/payment/config
// @access  Public
export const getStripeConfig = (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_key',
  });
};
