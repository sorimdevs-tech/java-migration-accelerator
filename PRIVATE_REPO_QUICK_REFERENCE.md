# Private Repository Access - Quick Reference

## 📋 At a Glance

| Feature | Status | Details |
|---------|--------|---------|
| **GitHub Private Repos** | ✅ Supported | HTTPS + Token auth |
| **GitLab Private Repos** | ✅ Supported | HTTPS + Token auth |
| **User-Provided Tokens** | ✅ Supported | Per-request, more secure |
| **Default Token** | ✅ Supported | Via .env, auto-used for all requests |
| **Token Fallback** | ✅ Implemented | User → Default → Unauthenticated |

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Generate Access Token

**GitHub:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" (classic)
3. Scopes: `repo` + `read:user`
4. Copy token (starts with `ghp_`)

**GitLab:**
1. Go to https://gitlab.com/-/user_settings/personal_access_tokens
2. Click "Create personal access token"
3. Scopes: `api` + `read_repository`
4. Copy token (starts with `glpat_`)

### Step 2: Configure Backend

**Option A: Default Token (Server Deployments)**
```bash
cp .env.example .env
# Edit .env and add:
GITHUB_TOKEN=ghp_your_token_here
GITLAB_TOKEN=glpat_your_token_here

python main.py
```

**Option B: User Token (Web UI)**
- No configuration needed
- Users provide token in Migration Wizard
- More secure, no server-side token storage

### Step 3: Test Access

```bash
# Test with curl
curl -X POST http://localhost:8001/api/migration/start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "github",
    "source_repo_url": "https://github.com/myorg/private-repo",
    "token": "ghp_your_token",
    "target_java_version": "21",
    "conversion_types": ["java_version"]
  }'
```

---

## 📚 How It Works

```
┌─────────────────────────────────────┐
│   Private Repository Migration      │
└────────────┬────────────────────────┘
             │
    ┌────────▼────────┐
    │  User provides  │
    │  repo URL +     │
    │  access token?  │
    └────────┬────────┘
             │
    ┌────────▼────────────────────┐
    │ YES: Use user token         │
    │ NO: Check .env for token    │
    └────────┬────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ Token found?                   │
    │ YES: Clone private repo        │
    │ NO: Public repo only (limited) │
    └────────┬──────────────────────┘
             │
    ┌────────▼─────────────────┐
    │ Analyze & Migrate        │
    └──────────────────────────┘
```

---

## 🔑 Token Priority

```
┌──────────────────────────────────┐
│ 1️⃣  User-Provided Token          │ (Highest priority)
│     (from API request)           │
└──────────────────────────────────┘
              ↓ (not provided)
┌──────────────────────────────────┐
│ 2️⃣  GITHUB_TOKEN from .env       │ (Backend default)
│     (fallback for all requests)  │
└──────────────────────────────────┘
              ↓ (not configured)
┌──────────────────────────────────┐
│ 3️⃣  Unauthenticated Request      │ (Lowest priority)
│     (public repos only, limited) │
└──────────────────────────────────┘
```

---

## 🎯 Two Usage Patterns

### Pattern 1: Web UI (Recommended for Users)

```
User (Browser)
     ↓
[Migration Wizard - Step 1]
     ↓
Input: Repo URL + Token
     ↓
[Backend]
Uses token ONLY for this request
No token stored on server
     ↓
[Private Repo Cloned & Migrated]
```

**Advantages:**
- ✓ Secure (no server-side token storage)
- ✓ No .env configuration needed
- ✓ Each user uses own credentials
- ✓ Better for multi-user deployments

### Pattern 2: Server Deployment (Recommended for CI/CD)

```
.env Configuration
     ↓
[GITHUB_TOKEN=ghp_xxxx]
     ↓
[Backend API]
Automatically uses token for all requests
     ↓
[Private Repos Accessible Without User Token]
```

**Advantages:**
- ✓ Automated access (no user input)
- ✓ Higher rate limits (5000/hour)
- ✓ Ideal for CI/CD pipelines
- ✓ Self-hosted deployments

---

## 📖 Repository URLs

```
GitHub:
  Public:   https://github.com/username/repo
  Private:  https://github.com/username/private-repo
  Org:      https://github.com/organization/repo

GitLab:
  Public:   https://gitlab.com/username/repo
  Private:  https://gitlab.com/username/private-repo
  Self:     https://gitlab.company.com/group/repo
```

---

## ⚡ Common Tasks

### List All Private Repos

```bash
curl -X POST http://localhost:8001/api/github/repos \
  -H "Content-Type: application/json" \
  -d '{"token": "ghp_your_token"}'
```

### Analyze Private Repository

```bash
curl -X POST http://localhost:8001/api/github/analyze-url \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/myorg/private-repo",
    "token": "ghp_your_token"
  }'
```

### Start Migration of Private Repo

```bash
curl -X POST http://localhost:8001/api/migration/start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "github",
    "source_repo_url": "https://github.com/myorg/private-repo",
    "token": "ghp_your_token",
    "target_java_version": "21",
    "conversion_types": ["java_version"]
  }'
```

---

## 🔒 Security Checklist

- [ ] Token has correct scopes (`repo`, `read:user`)
- [ ] Token is not committed to Git (in .gitignore)
- [ ] Token rotated every 90 days
- [ ] For web UI: Token not stored on server
- [ ] For CI/CD: Using GitHub/GitLab Secrets
- [ ] HTTPS only (never HTTP with tokens)
- [ ] Rate limiting implemented
- [ ] Unused tokens revoked

---

## ❌ Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| **Repository not found (401)** | Token doesn't have access | Check scopes include `repo` |
| **Bad credentials (403)** | Invalid or expired token | Regenerate new token |
| **Rate limit exceeded** | Too many unauthenticated requests | Set `GITHUB_TOKEN` in .env |
| **Private key required** | Using SSH instead of HTTPS | Use `https://` URLs only |
| **Merge conflicts** | Different token used than expected | Use same token for consistency |

---

## 📚 Documentation

- **Full Setup Guide:** See [PRIVATE_REPO_SETUP.md](PRIVATE_REPO_SETUP.md)
- **Environment Config:** See [.env.example](.env.example)
- **API Reference:** See README.md API Endpoints section
- **Backend Code:** `services/github_service.py`, `services/gitlab_service.py`

---

## 🆘 Need Help?

1. Check `.env.example` for detailed configuration options
2. Read full guide: `PRIVATE_REPO_SETUP.md`
3. Review troubleshooting section above
4. Check backend logs for specific error messages
5. Verify token format and scopes on GitHub/GitLab settings

---

**Last Updated:** January 2026
