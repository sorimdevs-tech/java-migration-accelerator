# GitHub Rate Limit Fix - Quick Setup Guide

## What Was Fixed

**Error**: `Request GET /repos/termux/termux-app failed with 403: rate limit exceeded`

**Root Cause**: GitHub API rate limiting with no intelligent retry mechanism

**Solution**: Added comprehensive rate limiter with exponential backoff and smart retries

---

## Files Modified

### New Files
- `services/rate_limiter.py` - Core rate limiting implementation

### Modified Files
- `services/github_service.py` - Integrated rate limiter with retry logic
- `main.py` - Added `/api/github/rate-limit-status` endpoint

---

## Key Features

✅ **Exponential Backoff**: 1s → 2s → 4s → 8s retry delays
✅ **Smart Rate Limit Detection**: Tracks remaining requests automatically
✅ **Auto-Retry on Rate Limits**: Up to 3 attempts before failing
✅ **Wait for Reset**: Intelligently waits for GitHub API reset
✅ **Real-time Status Monitoring**: New API endpoint for rate limit visibility
✅ **Per-Endpoint Tracking**: Separate limits for core, search, and GraphQL APIs
✅ **Authenticated Token Support**: 5000 requests/hour with valid token vs 60 without

---

## Quick Test

### 1. Check Rate Limit Status
```bash
curl http://localhost:8001/api/github/rate-limit-status | jq
```

### 2. Watch Logs During Analysis
```bash
# Start server with logging
python main.py 2>&1 | grep "RATE_LIMIT"
```

### 3. Example Response
```json
{
  "status": {
    "core": {
      "limit": 60,
      "remaining": 45,
      "reset": 1705363200,
      "endpoint": "core"
    }
  },
  "formatted": "CORE: 45/60 (reset: 14:30:00 UTC)",
  "authenticated": false
}
```

---

## Configuration

### Environment Variables
```bash
# Required for authenticated access (5000 requests/hour)
export GITHUB_TOKEN=ghp_your_token_here

# Optional for GitLab
export GITLAB_TOKEN=glpat_your_token_here

# Start server
python main.py
```

### Without Token
- Falls back to unauthenticated access
- Limited to 60 requests/hour
- Automatically implements longer wait times
- Still retries on rate limits (won't fail immediately)

---

## How It Works

```
User Request
    ↓
Check Rate Limit Status
    ├─ < 2 remaining? → Wait for reset
    └─ > 2 remaining? → Proceed
    ↓
Make API Call
    ├─ Success? → Return data
    ├─ Rate limited? → Retry with exponential backoff
    │   ├─ Attempt 1 (wait 1s)
    │   ├─ Attempt 2 (wait 2s)
    │   └─ Attempt 3 (wait 4s)
    └─ Other error? → Fail gracefully
    ↓
Cache Result (5 minutes)
    ↓
Return to User
```

---

## Monitoring

### Server Logs
Look for these log messages:
```
[RATE_LIMIT] Current status: CORE: 45/60 (reset: 14:30:00 UTC)
[RATE_LIMIT] Rate limit exceeded. Waiting 167s before retry (attempt 1/3)
[RETRY] Failed to get repo. Waiting 1s...
[CACHE HIT] Using cached analysis for owner/repo
```

### Metrics Endpoint
```bash
# Check every 10 seconds
watch -n 10 'curl -s http://localhost:8001/api/github/rate-limit-status | jq .formatted'
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting 403 errors | Ensure `GITHUB_TOKEN` is set and valid |
| Slow responses | Normal - waiting for rate limit reset. Use authenticated token. |
| Not seeing rate limit logs | Check that logs are enabled: `python main.py 2>&1` |
| Status endpoint returns 400 | Verify backend is running and rate limiter is initialized |

---

## Performance Notes

- **First request**: May take longer if rate limit is near threshold
- **Cached requests**: Very fast (< 50ms) if within 5-minute cache window
- **With authenticated token**: 5000x better rate limits
- **Without token**: Better resilience than before (auto-retry vs hard failure)

---

## Next Steps

1. **Verify it's working**: Check the rate limit status endpoint
2. **Monitor in production**: Watch the logs for rate limit messages
3. **Update token if needed**: Ensure `GITHUB_TOKEN` is set
4. **Test under load**: Run migration on multiple repos to verify resilience

---

For detailed documentation, see [RATE_LIMIT_FIX.md](RATE_LIMIT_FIX.md)
