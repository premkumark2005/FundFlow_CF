
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { donationAPI } from '../../services/api';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const getStripePromise = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('Stripe publishable key not found in environment variables');
  }
  // Verify key format
  if (!key.startsWith('pk_test_')) {
    console.error('Invalid Stripe key format:', key);
    throw new Error('Invalid Stripe publishable key format');
  }
  console.log('Initializing Stripe with key:', key.substring(0, 20) + '...');
  return loadStripe(key);
};

const DonateFormContent = ({ campaign }) => {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const stripe = useStripe();
  const elements = useElements();



  const presetAmounts = [500, 1000, 2000, 5000];

  const handleAmountSelect = (amt) => {
    setAmount(String(amt));
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('Please login to donate');
      setLoading(false);
      return;
    }

    if (!amount || amount < 1) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }
    // Stripe Elements validation
    if (!stripe || !elements) {
      setError('Payment system not ready. Please try again in a moment.');
      setLoading(false);
      return;
    }

    try {
      // Utility: request timeout to avoid indefinite waiting when backend is down
      const withTimeout = (promise, ms = 6000) =>
        Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
        ]);

      // 1. Create PaymentIntent on backend
      console.log('Step 1: Creating payment intent for amount:', amount);
      const { clientSecret } = await donationAPI.createPaymentIntent(Number(amount), campaign._id);
      console.log('Payment intent created, clientSecret received:', clientSecret.substring(0, 20) + '...');

      // 2. Confirm card payment with Stripe.js
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card input not found.');
      
      console.log('Step 2: Confirming payment with Stripe...');
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: (user && user.name) || 'Test User',
            email: (user && user.email) || 'test@example.com',
          },
        },
      });
      
      console.log('Payment result:', paymentResult);
      
      if (paymentResult.error) {
        console.error('Payment error:', paymentResult.error);
        throw new Error(paymentResult.error.message);
      }
      if (paymentResult.paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful. Status: ' + paymentResult.paymentIntent.status);
      }

      console.log('Step 3: Payment succeeded, recording donation...');
      // 3. Record donation in backend with email notifications
      const donationRes = await donationAPI.recordStripeDonation({
        campaignId: campaign._id,
        amount: Number(amount),
        anonymous,
        message,
        paymentId: paymentResult.paymentIntent.id,
      });
      
      console.log('Donation recorded successfully:', donationRes);
      alert('Donation successful! Thank you for your support. Confirmation emails have been sent.');
      setAmount('');
      setCustomAmount('');
      setMessage('');
      setAnonymous(false);
      if (elements && elements.getElement(CardElement)) elements.getElement(CardElement).clear();
      window.location.reload();
    } catch (error) {
      console.error('Error in donation flow:', error);
      if (error?.message?.includes('Invalid API Key provided')) {
        setError('Payment system configuration error. Please check Stripe keys.');
      } else if (error?.response?.status === 401 || error?.status === 401) {
        setError('Please login to donate.');
      } else if (error?.message?.toLowerCase().includes('timeout')) {
        setError('Request timed out. Please ensure the backend is running at REACT_APP_API_URL and try again.');
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError('Failed to process donation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">Support this campaign</h3>
      <div className="mb-3 px-3 py-2 rounded bg-yellow-50 text-yellow-800 text-sm border border-yellow-200">
        Payments are simulated for demo purposes. No real charges.
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Amount (USD)
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleAmountSelect(amt)}
                className={`px-4 py-2 border rounded-md text-center ${
                  amount === amt.toString()
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                ${amt.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Or enter custom amount"
            value={customAmount}
            onChange={handleCustomAmount}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Details (Stripe test card)</label>
          <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
            <CardElement options={{ hidePostalCode: true }} />
            <div className="text-xs text-gray-500 mt-2">Use Stripe test cards (e.g. 4242 4242 4242 4242, any future date, any CVC)</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a message of support for the creator"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Donate anonymously
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Donate $${amount || '0'}`}
        </button>
      </form>
    </div>
  );
};

const DonateForm = (props) => {
  const [stripeError, setStripeError] = React.useState(null);
  const [stripePromise, setStripePromise] = React.useState(null);

  React.useEffect(() => {
    try {
      setStripePromise(getStripePromise());
    } catch (error) {
      setStripeError(error.message);
    }
  }, []);

  if (stripeError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {stripeError}
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <DonateFormContent {...props} />
    </Elements>
  );
};

export default DonateForm;