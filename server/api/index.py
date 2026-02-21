"""
Vercel serverless handler for FastAPI application
"""
from app.main import app

# Vercel's @vercel/python now supports ASGI directly
# Just export the FastAPI app as both 'app' and 'handler'
handler = app
