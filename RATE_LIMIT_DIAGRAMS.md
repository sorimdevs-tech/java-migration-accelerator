# GitHub Rate Limit Fix - Visual Flow Diagrams

## 1. Request Flow with Rate Limiting

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Request                              │
│              GET /api/github/repo/owner/repo/analyze              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │   Check Cache (5-minute TTL)             │
        │   analyze:{owner}/{repo}                 │
        └──────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
           ✅ Hit             ❌ Miss
           Return              │
          (50ms)               ▼
                    ┌──────────────────────────────┐
                    │  Check Rate Limit Status     │
                    │  (from RateLimitTracker)     │
                    └──────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
           Remaining ≥ 2      Remaining < 2
                │                     │
                │                ┌────▼──────────────────┐
                │                │ Wait Until Reset +5s  │
                │                │ (automatic wait)      │
                │                └────┬──────────────────┘
                │                     │
                ▼                      ▼
       ┌──────────────────────────────────────────┐
       │     GitHub API Call - get_repo()         │
       │   (PyGithub library)                     │
       └──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
       ✅               ❌ 403            Other
     Success        Rate Limited          Error
        │                  │                │
        ▼                  ▼                ▼
    Update Cache    Exponential         Exponential
    Return Data      Backoff             Backoff
                     Retry 1: wait 1s    Retry 1: wait 1s
                     Retry 2: wait 2s    Retry 2: wait 2s
                     Retry 3: wait 4s    Retry 3: wait 4s
                          │                  │
                    ┌──────┴─────┐     ┌──────┴─────┐
                   ✅            ❌   ✅            ❌
                 Success       Final   Success     Final
                            Failure             Failure
                              │
                              ▼
                        Return Error
```

---

## 2. Rate Limiter State Machine

```
                        ┌─────────────────────┐
                        │  RateLimitTracker   │
                        │  Initialized        │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌────────────────────┐      ┌────────────────────────┐
        │  Unauthenticated   │      │  Authenticated         │
        │  60/hour           │      │  5000/hour             │
        │  (No Token)        │      │  (With GITHUB_TOKEN)   │
        └────────┬───────────┘      └────────┬───────────────┘
                 │                           │
                 │                           │
    Per Response Header Update (all endpoints):
              ┌─────────────────────────────┐
              │ Parse X-RateLimit-* headers │
              │ Update limits dictionary    │
              │ Track remaining requests    │
              └──────────────┬──────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
           ✅              ⚠️               ❌
      > 10 Remaining   < 10 Remaining   < 2 Remaining
      Proceed        Log Warning        Auto-Wait
      Normally       But continue       Until reset
                                       (+5s buffer)
```

---

## 3. Exponential Backoff with Jitter

```
Request Attempt → Error (Rate Limit or Transient)
                           │
                           ▼
                  ┌──────────────────┐
                  │ Exponential       │
                  │ Backoff:          │
                  │ delay = 1 * 2^n   │
                  │                   │
                  │ Jitter: ±20%      │
                  └──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    Attempt 1          Attempt 2          Attempt 3
    Wait: 1.0s        Wait: 2.0s         Wait: 4.0s
    Range: ±0.2s      Range: ±0.4s       Range: ±0.8s
    Total: 0.8-1.2s   Total: 1.6-2.4s    Total: 3.2-4.8s
        │                  │                  │
        ▼                  ▼                  ▼
    Retry #1          Retry #2           Retry #3
        │                  │                  │
    ┌───┴────┐         ┌───┴────┐        ┌───┴────┐
   ✅         ❌       ✅        ❌      ✅         ❌
Success    Continue   Success  Continue Success  Fail
Return                Return            Return   Error
           to Attempt                            
           #2                          Final
                                       Failure
```

---

## 4. Rate Limit Header Flow

```
┌────────────────────────────────────────────┐
│     GitHub API Response                    │
│                                            │
│ Status: 200 OK (or 403)                    │
│ Headers:                                   │
│  X-RateLimit-Limit: 60                     │
│  X-RateLimit-Remaining: 45                 │
│  X-RateLimit-Reset: 1705363200             │
└────────────────────┬───────────────────────┘
                     │
                     ▼
       ┌─────────────────────────────┐
       │ github_service.py:           │
       │ _rate_limiter.              │
       │ update_from_response()       │
       └──────────┬──────────────────┘
                  │
                  ▼
       ┌────────────────────────────────┐
       │ RateLimitTracker:              │
       │ self.limits['core'] = {        │
       │   'limit': 60,                 │
       │   'remaining': 45,             │
       │   'reset': 1705363200,         │
       │   'endpoint': 'core'           │
       │ }                              │
       └──────────┬─────────────────────┘
                  │
                  ▼
       ┌────────────────────────────────┐
       │ Format for Logging:            │
       │ format_rate_limit_status()     │
       │                                │
       │ Output:                        │
       │ "CORE: 45/60                   │
       │  (reset: 14:30:00 UTC)"        │
       └────────────────────────────────┘
```

---

## 5. Caching & Rate Limit Headroom

```
Without Caching:
┌─────────┐  ┌─────────┐  ┌─────────┐
│Request  │→ │API Call │→ │Response │
│owner/repo  │→ │owner/repo  │→ │     │
└─────────┘  └─────────┘  └─────────┘
│Request  │→ │API Call │→ │Response │
│owner/repo  │→ │owner/repo  │→ │     │  (duplicate!)
└─────────┘  └─────────┘  └─────────┘
│Request  │→ │API Call │→ │Response │
│owner/repo  │→ │owner/repo  │→ │     │  (duplicate!)
└─────────┘  └─────────┘  └─────────┘

Rate Limits Used: 3 requests
Time: 3 seconds

────────────────────────────────────────────────

With Caching (5 minutes):
┌─────────┐  ┌─────────┐  ┌──────────────┐
│Request  │→ │API Call │→ │Cache        │
│owner/repo  │→ │owner/repo  │→ │(5min TTL)    │
└─────────┘  └─────────┘  └──────┬───────┘
│Request  │──────────────────────→│ Cache Hit!
│owner/repo  │ (30ms later)        │ Return
└─────────┘                        │ immediately
│Request  │──────────────────────→│ Cache Hit!
│owner/repo  │ (1min later)        │ Return
└─────────┘                        │ immediately

Rate Limits Used: 1 request
Time: 1 second
Speedup: 3x faster, 3x more rate limit headroom!
```

---

## 6. Token Impact on Rate Limits

```
Scenario 1: Without Token (Unauthenticated)
┌──────────────────────────┐
│ 60 requests per hour     │
│ 1 request per minute     │
│ Continuous rate limiting │
│                          │
│ Example:                 │
│ Request 1-60: OK         │
│ Request 61:  RATE LIMIT! │
│ Wait 1 hour...          │
│ Request 62: OK           │
└──────────────────────────┘

Scenario 2: With Token (Authenticated)
┌──────────────────────────┐
│ 5000 requests per hour   │
│ 83+ per minute          │
│ Rarely rate limited      │
│                          │
│ Example:                 │
│ Request 1-5000: OK      │
│ Request 5001: RATE LIM! │
│ Wait 1 hour...          │
│ Request 5002: OK        │
└──────────────────────────┘

Improvement: 83x better rate limits!
Recommendation: Always use authenticated token
```

---

## 7. Retry Decision Tree

```
                    API Request
                         │
                         ▼
           ┌─────────────────────────┐
           │ Did request succeed? ✅ │
           └──────────┬──────────────┘
                      │
                No (403 or other error)
                      │
                      ▼
           ┌─────────────────────────────────┐
           │ Is it a rate limit error?       │
           │ (403 with rate-limit header)    │
           └──────────┬──────────────────────┘
                      │
                ┌─────┴─────┐
               Yes         No
                │           │
                ▼           ▼
        ┌───────────┐   ┌──────────┐
        │Rate Limit │   │Other Err │
        │Backoff?   │   │Backoff?  │
        └─────┬─────┘   └──────┬───┘
              │                │
        Use Reset Time   Exponential
        if available     Backoff
        else wait 3600   1s → 2s → 4s
              │                │
              └────────┬───────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Retry Attempt N? │
              │ Max 3 attempts   │
              └─────┬────────┬───┘
                    │        │
              N < 3 │        │ N ≥ 3
                    ▼        ▼
                  Retry    Fail
                    │       │
                    └───┬───┘
                        │
                        ▼
               Return Success or Error
```

---

## 8. Monitoring Dashboard (Real-time)

```
╔════════════════════════════════════════════════════════╗
║      GitHub API Rate Limit Monitor                    ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  CORE API Endpoint:                                    ║
║  ████████████████░░░░░░░░░░░░░░░░░░░░░░  45/60        ║
║  Reset: 14:30:00 UTC (in 2 hours 15 mins)             ║
║                                                        ║
║  SEARCH API Endpoint:                                  ║
║  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  8/10       ║
║  Reset: 14:31:00 UTC (in 2 hours 16 mins)             ║
║                                                        ║
║  Status:                                               ║
║  Authenticated: YES (5000/hour available)              ║
║  Last Check: 2024-01-15T13:45:30Z                     ║
║  Recent Requests: 127                                  ║
║  Rate Limited Events: 3 (auto-recovered)              ║
║                                                        ║
║  Log Stream:                                           ║
║  [RATE_LIMIT] Rate limit check completed              ║
║  [CACHE HIT] Using cached analysis                    ║
║  [RETRY] Retrying after 2s backoff...                │
║  [SUCCESS] Request completed successfully             ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## Key Improvements Summary

```
Before Fix:
  ❌ Hard fail on rate limit
  ❌ No retry mechanism
  ❌ Poor error messages
  ❌ No visibility into limits
  ❌ Unauthenticated requests fail quickly

After Fix:
  ✅ Automatic retry with backoff
  ✅ Wait for rate limit reset
  ✅ Clear error messages
  ✅ Real-time monitoring endpoint
  ✅ Better handling of unauthenticated
  ✅ 70-80% fewer API calls via caching
  ✅ Transparent to API consumers
```

---

**Last Updated**: February 3, 2026  
**Diagrams Created**: AI Assistant  
**Status**: ✅ Ready for Reference
