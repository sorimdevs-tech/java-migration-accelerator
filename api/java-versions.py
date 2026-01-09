from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/java-versions")
async def get_java_versions():
    """Get available Java versions for migration"""
    return {
        "source_versions": [
            {"value": "7", "label": "Java 7"},
            {"value": "8", "label": "Java 8 (LTS)"},
            {"value": "11", "label": "Java 11 (LTS)"},
            {"value": "17", "label": "Java 17 (LTS)"},
            {"value": "21", "label": "Java 21 (LTS)"}
        ],
        "target_versions": [
            {"value": "8", "label": "Java 8 (LTS)"},
            {"value": "11", "label": "Java 11 (LTS)"},
            {"value": "17", "label": "Java 17 (LTS)"},
            {"value": "21", "label": "Java 21 (LTS)"}
        ]
    }

def handler(event, context):
    """Vercel handler"""
    from mangum import Mangum
    handler = Mangum(app)
    return handler(event, context)