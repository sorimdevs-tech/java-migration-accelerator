from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MigrationRequest(BaseModel):
    source_repo_url: str
    target_repo_name: str
    source_java_version: str
    target_java_version: str
    github_token: str
    conversion_types: list
    email: str = None
    run_tests: bool = True
    run_sonar: bool = False
    fix_business_logic: bool = False

@app.post("/api/migration/start")
async def start_migration(request: MigrationRequest):
    """Start a Java migration job"""
    job_id = str(uuid.uuid4())

    # Mock migration response (since this is a demo)
    return {
        "job_id": job_id,
        "status": "completed",  # Mock as completed for demo
        "message": "Migration completed successfully (demo)",
        "source_repo": request.source_repo_url,
        "target_repo": request.target_repo_name,
        "source_java_version": request.source_java_version,
        "target_java_version": request.target_java_version,
        "conversion_types": request.conversion_types,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "files_modified": 5,
        "issues_fixed": 3
    }

@app.get("/api/migration/{job_id}")
async def get_migration_status(job_id: str):
    """Get migration job status"""
    return {
        "job_id": job_id,
        "status": "completed",
        "progress_percent": 100,
        "message": "Migration completed successfully",
        "current_step": "Migration finished",
        "files_modified": 5,
        "issues_fixed": 3
    }

def handler(event, context):
    """Vercel handler"""
    from mangum import Mangum
    handler = Mangum(app)
    return handler(event, context)