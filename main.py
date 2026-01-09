"""
Java Migration Backend - Main FastAPI Application
Handles Java 7 → Java 18 migration automation using OpenRewrite
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid
from datetime import datetime, timezone

app = FastAPI(
    title="Java Migration Accelerator API",
    description="End-to-end Java 7 → Java 18 migration automation using OpenRewrite",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo purposes
migration_jobs = {}

class MigrationRequest(BaseModel):
    source_repo_url: str
    target_repo_name: str
    source_java_version: str = "8"
    target_java_version: str = "17"
    github_token: str = ""
    conversion_types: List[str] = ["java_version"]
    email: str = ""
    run_tests: bool = True
    run_sonar: bool = False
    fix_business_logic: bool = False

class MigrationResult(BaseModel):
    job_id: str
    status: str
    source_repo: str
    target_repo: str = None
    source_java_version: str
    target_java_version: str
    conversion_types: List[str] = []
    started_at: str
    completed_at: str = None
    progress_percent: int = 100
    current_step: str = "Migration completed successfully (demo)"
    files_modified: int = 5
    issues_fixed: int = 3
    message: str = "Migration completed successfully (demo mode)"

@app.get("/")
async def root():
    return {"message": "Java Migration Accelerator API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/api/java-versions")
async def get_java_versions():
    """Get supported Java versions for migration"""
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

@app.post("/api/migration/start")
async def start_migration(request: MigrationRequest):
    """Start a Java migration job (demo mode)"""
    job_id = str(uuid.uuid4())

    # Mock migration response (since this is a demo)
    result = MigrationResult(
        job_id=job_id,
        status="completed",
        source_repo=request.source_repo_url,
        target_repo=f"migration_{request.target_java_version}_{request.target_repo_name}",
        source_java_version=request.source_java_version,
        target_java_version=request.target_java_version,
        conversion_types=request.conversion_types,
        started_at=datetime.now(timezone.utc).isoformat(),
        completed_at=datetime.now(timezone.utc).isoformat(),
        message="Migration completed successfully (demo mode)"
    )

    migration_jobs[job_id] = result
    return result

@app.get("/api/migration/{job_id}")
async def get_migration_status(job_id: str):
    """Get migration job status"""
    if job_id not in migration_jobs:
        raise HTTPException(status_code=404, detail="Migration job not found")

    return migration_jobs[job_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
