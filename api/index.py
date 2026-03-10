"""
Vercel Serverless Function entry point.
Imports the FastAPI app from the backend directory.
"""
import sys
import os

# Add the backend directory to the Python path
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'b')
sys.path.insert(0, backend_dir)

# Change working directory so uploads and relative paths work
os.chdir(backend_dir)

from main import app
