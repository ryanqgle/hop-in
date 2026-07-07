import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

app = Flask(__name__)
CORS(app)

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')