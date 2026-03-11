"""
Vercel Serverless Function entry point.
Imports the FastAPI app from the backend directory.
"""
import sys
import os

# Add the backend directory to the Python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'b'))
sys.path.insert(0, backend_dir)

# Change working directory so relative paths in main.py work
os.chdir(backend_dir)

# Load .env from the backend directory BEFORE importing main
# (main.py calls load_dotenv() at import time)
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, '.env'))

# Ensure uploads directory exists (Vercel uses /tmp for writable files)
uploads_dir = os.path.join(backend_dir, 'uploads')
if not os.path.exists(uploads_dir):
    try:
        os.makedirs(uploads_dir, exist_ok=True)
    except OSError:
        # On Vercel, use /tmp/uploads instead
        tmp_uploads = '/tmp/uploads'
        os.makedirs(tmp_uploads, exist_ok=True)
        os.environ['UPLOAD_DIR'] = tmp_uploads

from main import app
