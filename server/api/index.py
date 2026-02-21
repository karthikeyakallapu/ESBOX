"""
Vercel serverless handler for FastAPI application
"""
from mangum import Mangum
from app.main import app

# Ensure database is checked on cold start for serverless
# This replaces lifespan events that don't work in serverless
_cold_start = True

async def init_on_cold_start():
    """Initialize resources on serverless cold start"""
    global _cold_start
    if _cold_start:
        from app.db.db import check_db
        await check_db()
        _cold_start = False

# Add startup event for serverless cold starts
@app.on_event("startup")
async def startup_event():
    """Handle startup for serverless environments"""
    await init_on_cold_start()

# Create the handler with lifespan disabled for serverless
handler = Mangum(app, lifespan="off")

