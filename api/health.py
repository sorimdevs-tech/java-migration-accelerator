from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
import os

# Create FastAPI app for Vercel
app = FastAPI()

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "platform": "vercel",
        "version": "1.0.0"
    }

# Vercel requires this for serverless functions
def handler(event, context):
    """Vercel handler for serverless function"""
    from mangum import Mangum

    # Create handler
    handler = Mangum(app)

    # Call the handler
    return handler(event, context)