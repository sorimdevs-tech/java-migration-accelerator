🔧 GITHUB TOKEN 400 ERROR - TROUBLESHOOTING GUIDE
════════════════════════════════════════════════════════════════

❌ ERROR:
  GET http://localhost:8001/api/github/analyze-url?repo_url=...&token= 400 (Bad Request)
  
📋 CAUSE:
  GitHub token is empty when making the API request

════════════════════════════════════════════════════════════════
✅ SOLUTION (Choose one):
════════════════════════════════════════════════════════════════

OPTION 1: Check Backend Configuration (RECOMMENDED)
──────────────────────────────────────────────────

1. Verify .env file has GITHUB_TOKEN:
   cat java-migration-backend/Java_Migration_Accelerator_backend/java-migration-backend/.env | grep GITHUB_TOKEN

2. It should look like:
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

3. If empty or missing, add your GitHub token:
   
   a) Get a GitHub Personal Access Token:
      • Go to: https://github.com/settings/tokens
      • Click "Generate new token"
      • Select scopes: repo, read:user
      • Copy the token
   
   b) Add to .env file:
      GITHUB_TOKEN=ghp_your_actual_token_here
   
   c) Restart the backend:
      • Stop: docker-compose down
      • Start: docker-compose up -d

4. Check if token loaded:
   docker logs java-migration-app | grep GITHUB | head -5
   
   Should show:
   [INIT] GitHub token loaded: ✓ Token length: 45 chars

════════════════════════════════════════════════════════════════

OPTION 2: Verify Frontend is Sending Token
──────────────────────────────────────────

If backend token is set but still getting 400:

1. Check browser Network tab (F12 → Network):
   • Look for request to: /api/github/analyze-url
   • Check URL parameters
   • You should see: &token=ghp_xxxx (not empty)

2. If token parameter is empty:
   • The frontend token state is empty
   • This means user hasn't entered it in UI

3. Solution: Add token in UI or use backend default

════════════════════════════════════════════════════════════════

OPTION 3: Restart Everything
───────────────────────────

Sometimes Docker caches need to be cleared:

# Stop everything
docker-compose down

# Remove Docker containers and volumes (CAREFUL!)
docker container prune -f
docker volume prune -f

# Start fresh
docker-compose up -d

# Check logs
docker logs java-migration-app -f

════════════════════════════════════════════════════════════════
🔍 DEBUGGING STEPS:
════════════════════════════════════════════════════════════════

1. Check if backend has token:
   docker exec java-migration-app bash -c 'echo $GITHUB_TOKEN'

2. View backend logs for token status:
   docker logs java-migration-app | grep "\[INIT\]"

3. Make manual test request with token:
   curl "http://localhost:8001/api/github/analyze-url?repo_url=https%3A%2F%2Fgithub.com%2Fgradle%2Fgradle&token=ghp_your_token"

4. View request details:
   docker logs java-migration-app | grep analyze-url

════════════════════════════════════════════════════════════════
✅ VERIFICATION:
════════════════════════════════════════════════════════════════

After fix, you should see in logs:

[INIT] GitHub token loaded: ✓ Token length: 45 chars
[analyze-url] repo=gradle/gradle | user_token=no | default_token=yes | using=default

And the request should succeed with 200 response, not 400.

════════════════════════════════════════════════════════════════
📌 QUICK CHECKLIST:
════════════════════════════════════════════════════════════════

[ ] GITHUB_TOKEN exists in .env file
[ ] GITHUB_TOKEN is not empty (not blank line)
[ ] Token starts with "ghp_" or "glpat_"
[ ] Backend restarted after .env change
[ ] Docker has the token in environment
[ ] Browser DevTools show network request (F12 → Network)

════════════════════════════════════════════════════════════════
🆘 STILL NOT WORKING?
════════════════════════════════════════════════════════════════

Try this complete reset:

1. Stop container:
   docker-compose down

2. Edit .env and add valid GitHub token:
   nano java-migration-backend/Java_Migration_Accelerator_backend/java-migration-backend/.env

3. Start fresh:
   docker-compose up -d

4. Check logs immediately:
   docker logs java-migration-app | head -30

5. Look for:
   "[INIT] GitHub token loaded: ✓"

If you see "[INIT] GitHub token loaded: ✗", then token is not loaded into Docker.

════════════════════════════════════════════════════════════════
