import * as React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';

// Make sure to call `loadStrip` outside of a component's render to avoid
// recreating the `Stripe` object on every render
// This is a public sample test API key.
// Don't submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Payment = () => {
    const fetchClientSecret = React.useCallback(() => {
        // Create a Checkout Session
        return fetch('/api/create-checkout-session', { // Place holder need to make create-checkout-session into proper backend route
            method: 'POST',
        })
            .then((res) => res.json())
            .then((data) => data.clientSecret);
    }, []);

    const options = {fetchClientSecret};

    return (
        <div id='checkout'>
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    )
}

export default Payment;