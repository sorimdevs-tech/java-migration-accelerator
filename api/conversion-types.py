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

@app.get("/api/conversion-types")
async def get_conversion_types():
    """Get available conversion types for migration"""
    return [
        {
            "id": "java_version",
            "name": "Java Version Upgrade",
            "description": "Upgrade Java version (e.g., Java 8 → Java 17)",
            "category": "Language",
            "icon": "☕"
        },
        {
            "id": "spring_boot_2_to_3",
            "name": "Spring Boot 2 → 3",
            "description": "Upgrade Spring Boot 2.x to 3.x with Jakarta EE",
            "category": "Framework",
            "icon": "🌱"
        },
        {
            "id": "junit_4_to_5",
            "name": "JUnit 4 → JUnit 5",
            "description": "Migrate JUnit 4 tests to JUnit 5 (Jupiter)",
            "category": "Testing",
            "icon": "✅"
        }
    ]

def handler(event, context):
    """Vercel handler"""
    from mangum import Mangum
    handler = Mangum(app)
    return handler(event, context)