import os
from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

app = Flask(__name__)
CORS(app)

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

def get_authenticated_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None

    token = auth_header.replace('Bearer ', '')
    
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        if user and user.email.endswith('.edu'):
            return user

        return None
    except Exception as e:
        return None

@app.route('/', methods=['GET'])
def home():
    return "Flask is successfully running"

@app.route('/api/test', methods=['GET'])
def test_auth():
    user = get_authenticated_user()

    if user:
        return {"status": "success", "message": f"Welcome, {user}!"}
    
    return {"status": "error", "message": "rejected!"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)