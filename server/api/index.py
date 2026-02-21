# Minimal handler for Vercel - no imports at module level
# to avoid conflicts with Vercel's runtime introspection

def handler(event, context):
    """Lambda/Vercel handler with lazy imports"""
    from mangum import Mangum
    from app.main import app

    # Create Mangum handler on first request
    handler_instance = Mangum(app, lifespan="off")
    return handler_instance(event, context)
