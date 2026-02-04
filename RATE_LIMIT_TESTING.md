# GitHub Rate Limit Fix - Verification & Testing Guide

## Pre-Deployment Verification

### Step 1: Verify Files Are Created/Modified

```bash
# Check for new rate limiter module
ls -la services/rate_limiter.py
# Expected: file exists with ~255 lines

# Check github_service.py contains rate limiter import
grep "from .rate_limiter import" services/github_service.py
# Expected: should return the import line

# Check main.py has new endpoint
grep "/api/github/rate-limit-status" main.py
# Expected: should return the endpoint definition
```

### Step 2: Verify Python Syntax

```bash
# Check for syntax errors in rate_limiter.py
python -m py_compile services/rate_limiter.py
# Expected: no output (success)

# Check for syntax errors in github_service.py
python -m py_compile services/github_service.py
# Expected: no output (success)

# Check for syntax errors in main.py
python -m py_compile main.py
# Expected: no output (success)
```

### Step 3: Verify Imports

```bash
# Check if rate limiter can be imported
python -c "from services.rate_limiter import get_rate_limiter, RateLimitTracker"
echo "✅ Rate limiter imports successful"

# Check if github_service can be imported
python -c "from services.github_service import GitHubService"
echo "✅ GitHub service imports successful"
```

### Step 4: Start Backend Server

```bash
# Set GitHub token (optional but recommended)
export GITHUB_TOKEN=ghp_your_token_here

# Start server
cd java-migration-backend/Java_Migration_Accelerator_backend/java-migration-backend
python main.py

# Expected output:
# ✅ INFO:     Uvicorn running on http://0.0.0.0:8001
# ✅ [AUTH_SERVICE] GITHUB_REDIRECT_URI in use: ...
# ✅ No errors in startup
```

---

## Post-Deployment Testing

### Test 1: Rate Limit Status Endpoint

```bash
# In another terminal
curl http://localhost:8001/api/github/rate-limit-status | jq

# Expected response:
{
  "status": {
    "core": {
      "limit": 60,
      "remaining": 60,
      "reset": null,
      "endpoint": "core"
    },
    "search": {...},
    "graphql": {...}
  },
  "formatted": "CORE: 60/60 (reset: N/A) | SEARCH: 10/10 (reset: N/A) | ...",
  "authenticated": false,
  "timestamp": "2024-01-15T13:45:30.123456+00:00"
}

# ✅ Status code: 200
# ✅ All fields present
# ✅ Timestamp in ISO format
```

### Test 2: Repository Analysis with Rate Limit Tracking

```bash
# Test public repository
curl "http://localhost:8001/api/github/repo/facebook/react/analyze"

# Expected in server logs:
# [ANALYSIS] Starting comprehensive analysis of facebook/react
# [RATE_LIMIT] Current status: CORE: 59/60 (reset: N/A)
# [CACHE SET] Cached analysis for facebook/react

# Check response
# ✅ Status code: 200
# ✅ Analysis contains repository info
# ✅ No rate limit errors

# Verify rate limit was updated
curl http://localhost:8001/api/github/rate-limit-status | jq .formatted
# Expected: CORE remaining should be 59 (one less than before)
```

### Test 3: Caching Verification

```bash
# First request to new repo
time curl -s "http://localhost:8001/api/github/repo/spring-projects/spring-boot/analyze" > /dev/null

# Expected:
# ✅ Takes 2-10 seconds
# ✅ Server logs show [CACHE SET]

# Second request (should hit cache)
time curl -s "http://localhost:8001/api/github/repo/spring-projects/spring-boot/analyze" > /dev/null

# Expected:
# ✅ Takes < 100ms
# ✅ Server logs show [CACHE HIT]

# Verify cache is working
curl http://localhost:8001/api/github/repo/spring-projects/spring-boot/analyze | jq .full_name
# Expected: "spring-projects/spring-boot"
```

### Test 4: Retry Logic Verification

```bash
# Monitor logs during rapid requests
python -c "
import requests
import time

for i in range(5):
    start = time.time()
    try:
        resp = requests.get(
            'http://localhost:8001/api/github/repo/torvalds/linux/analyze',
            timeout=60
        )
        elapsed = time.time() - start
        print(f'Request {i+1}: {resp.status_code} ({elapsed:.1f}s)')
    except Exception as e:
        print(f'Request {i+1}: ERROR - {e}')
    time.sleep(1)
"

# Expected in server logs (if hitting rate limits):
# [RATE_LIMIT] Rate limit exceeded. Waiting ...s before retry (attempt 1/3)
# [RETRY] Request succeeded on attempt 2
```

---

## Performance Testing

### Test 5: Cache Performance

```bash
# Benchmark cached vs uncached requests
python -c "
import requests
import time

# Request 1: Not in cache
start = time.time()
requests.get('http://localhost:8001/api/github/repo/golang/go/analyze')
t1 = time.time() - start

# Request 2: In cache
start = time.time()
requests.get('http://localhost:8001/api/github/repo/golang/go/analyze')
t2 = time.time() - start

print(f'First request (API call): {t1:.2f}s')
print(f'Second request (cached): {t2:.4f}s')
print(f'Speedup: {t1/t2:.0f}x')
"

# Expected:
# ✅ First request: 2-8 seconds
# ✅ Second request: < 0.1 seconds
# ✅ Speedup: 20-100x
```

### Test 6: Rate Limit Headroom Improvement

```bash
# Check rate limit before and after multiple requests
echo "Before requests:"
curl -s http://localhost:8001/api/github/rate-limit-status | jq '.status.core.remaining'

# Make 10 rapid requests (using cache mostly)
for i in {1..10}; do
  curl -s "http://localhost:8001/api/github/repo/nodejs/node/analyze" > /dev/null &
done
wait

echo "After 10 requests:"
curl -s http://localhost:8001/api/github/rate-limit-status | jq '.status.core.remaining'

# Expected:
# ✅ Only 1-2 requests made (rest from cache)
# ✅ Remaining count decreased by 1-2, not 10
```

---

## Error Handling Tests

### Test 7: Invalid Repository Handling

```bash
curl "http://localhost:8001/api/github/repo/nonexistent/repo-12345/analyze"

# Expected:
# ✅ Status code: 400
# ✅ Error message: "Repository 'nonexistent/repo-12345' not found"
# ✅ No retry attempts (not a rate limit error)
# ✅ Quick response (< 1 second)
```

### Test 8: Private Repository Without Token

```bash
curl "http://localhost:8001/api/github/repo/private-owner/private-repo/analyze"

# Expected:
# ✅ Status code: 400
# ✅ Error message mentions private repository
# ✅ Suggests using personal access token
# ✅ No rate limit errors
```

### Test 9: Authenticated Token Impact

```bash
# Without token
echo "Without token:"
curl -s http://localhost:8001/api/github/rate-limit-status | jq '.status.core | {limit, authenticated}'

# With token
export GITHUB_TOKEN=ghp_your_token
echo "With token:"
curl -s http://localhost:8001/api/github/rate-limit-status | jq '.status.core | {limit, authenticated}'

# Expected:
# Without token:  {"limit": 60, "authenticated": false}
# With token:     {"limit": 5000, "authenticated": true}
```

---

## Logging Verification

### Test 10: Log Output Analysis

```bash
# Run analysis and capture logs
python main.py 2>&1 | tee analysis.log &

# Make a few requests
curl "http://localhost:8001/api/github/repo/angular/angular/analyze" > /dev/null

# Check log contains expected messages
grep "\[RATE_LIMIT\]" analysis.log
# Expected: Messages about rate limit status

grep "\[CACHE" analysis.log
# Expected: Cache hit/miss messages

grep "\[ANALYSIS\]" analysis.log
# Expected: Analysis progress messages

grep "\[RETRY\]" analysis.log
# Expected: (only if rate limited) Retry messages
```

---

## Monitoring Dashboard Tests

### Test 11: Rate Limit Status Formatting

```bash
curl -s http://localhost:8001/api/github/rate-limit-status | jq .formatted

# Expected output example:
# "CORE: 58/60 (reset: 14:30:00 UTC) | SEARCH: 9/10 (reset: 14:31:00 UTC) | GRAPHQL: 0/0 (reset: N/A)"

# ✅ Human-readable format
# ✅ Shows remaining/limit
# ✅ Shows reset time in UTC
# ✅ All endpoints included
```

---

## Stress Test

### Test 12: Load Under Rate Limiting

```bash
# Simulate heavy load
python -c "
import requests
import concurrent.futures
import time

def make_request(repo_num):
    try:
        url = f'http://localhost:8001/api/github/repo/github/gitignore/analyze'
        r = requests.get(url, timeout=60)
        return (repo_num, r.status_code, 'success')
    except Exception as e:
        return (repo_num, 0, str(e))

# Launch 20 concurrent requests
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(make_request, i) for i in range(20)]
    results = [f.result() for f in concurrent.futures.as_completed(futures)]

# Analyze results
successes = sum(1 for r in results if r[2] == 'success')
print(f'Successful: {successes}/20')

# All should succeed (either from cache or after retry)
"

# Expected:
# ✅ All 20 requests succeed (200 status)
# ✅ Some from cache (fast), some with retry wait (slow)
# ✅ No permanent failures
```

---

## Final Verification Checklist

Run all tests and verify:

- [ ] Python syntax check passes
- [ ] All imports successful
- [ ] Server starts without errors
- [ ] Rate limit status endpoint returns 200
- [ ] Repository analysis works
- [ ] Caching reduces API calls
- [ ] Retry logic activates on rate limits
- [ ] Invalid repos handled gracefully
- [ ] Private repos require token
- [ ] Token increases rate limits
- [ ] Logs contain expected messages
- [ ] Formatting is human-readable
- [ ] Load test completes successfully

---

## Troubleshooting During Testing

| Error | Solution |
|-------|----------|
| `ModuleNotFoundError: rate_limiter` | Verify `services/rate_limiter.py` exists |
| `403: rate limit exceeded` | Rate limit was hit. Wait for reset or use token. |
| `Endpoint not found (404)` | Verify `/api/github/rate-limit-status` is in main.py |
| `Cache not working` | Check that 5-minute TTL hasn't expired |
| `Slow responses` | Expected when hitting rate limits. Use token. |
| `ImportError in github_service` | Verify imports at top of file |

---

## Success Criteria

✅ **All tests pass** = Rate limit fix is working correctly  
✅ **No 403 errors** = Retry mechanism is functioning  
✅ **Cache hits visible** = Performance improved  
✅ **Status endpoint works** = Monitoring is available  
✅ **Logs are informative** = Debugging is easier  

---

**Test Date**: _______________  
**Tester**: _______________  
**Result**: ✅ PASSED / ❌ FAILED  

**Notes**:
_________________________________
_________________________________
_________________________________

---

For more information, see:
- [RATE_LIMIT_FIX.md](RATE_LIMIT_FIX.md) - Detailed technical documentation
- [RATE_LIMIT_DIAGRAMS.md](RATE_LIMIT_DIAGRAMS.md) - Visual flow diagrams
- [QUICK_RATE_LIMIT_FIX.md](QUICK_RATE_LIMIT_FIX.md) - Quick reference guide
