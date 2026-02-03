#!/usr/bin/env python3
"""
Test script to verify GitHub private repo analysis with PAT token
"""
import httpx
import json
import sys

# You'll need to update these values
REPO_URL = "https://github.com/YOUR_USERNAME/YOUR_PRIVATE_REPO"  # Your private repo
GITHUB_TOKEN = "ghp_YOUR_TOKEN_HERE"  # Your personal access token
API_BASE_URL = "http://localhost:8001/api"

async def test_private_repo_analysis():
    """Test analyzing a private GitHub repository with PAT"""
    
    print(f"Testing private repo analysis...")
    print(f"Repository: {REPO_URL}")
    print(f"Token length: {len(GITHUB_TOKEN)} characters")
    print(f"API URL: {API_BASE_URL}/github/analyze-url")
    print("-" * 60)
    
    try:
        async with httpx.AsyncClient() as client:
            # Call the analyze-url endpoint with token
            response = await client.get(
                f"{API_BASE_URL}/github/analyze-url",
                params={
                    "repo_url": REPO_URL,
                    "token": GITHUB_TOKEN
                },
                timeout=30
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS! Repository analyzed successfully:")
                print(json.dumps(data, indent=2))
            else:
                print(f"❌ ERROR! Status: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if GITHUB_TOKEN == "ghp_YOUR_TOKEN_HERE":
        print("⚠️  Please update the GITHUB_TOKEN and REPO_URL variables in this script")
        print("Then run: python test_private_repo.py")
        sys.exit(1)
    
    import asyncio
    asyncio.run(test_private_repo_analysis())
