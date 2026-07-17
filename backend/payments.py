import os
import stripe
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

# Find your keys at (https://dashboard.stripe.com/apikeys.)

payments_bp = Blueprint('payments', __name__)

load_dotenv()
stripe_secret_key = os.getenv('STRIPE_SECRET_KEY')
client = stripe.StripeClient(stripe_secret_key)

DOMAIN = 'http://localhost:5173'

@payments_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        session = client.v1.checkout.sessions.create(
            params={
                'line_items': [{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'T-shirt',  # shift to  describe the ride 
                        },
                        'unit_amount': 2000, # switch to get from trip.costs
                    },
                    'quantity': 1,
                }],
                'mode': 'payment',
                'ui_mode': 'embedded_page',
                'return_url': DOMAIN + '/payment-return?session_id={CHECKOUT_SESSION_ID}'
            },
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


    return jsonify(clientSecret=session.client_secret)

@payments_bp.route('/session_status', methods=['GET'])
def session_status():
    try:
        session_id = request.args.get('session_id')
        if not session_id:
            return jsonify({'error': "session_id is missing"}), 400
        session = client.v1.checkout.sessions.retrieve(session_id)
        session_status = session.status
        if session.customer_details:
            customer_email = session.customer_details.email
        else:
            customer_email = None        
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
    return jsonify(status=session_status, customer_email=customer_email)


