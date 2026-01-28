# Private Repository Access Guide

This guide explains how to configure Java Migration Accelerator to work with **private repositories** on GitHub, GitLab, and other Git platforms.

## Quick Start

### For GitHub Private Repos (Recommended)

1. **Create a Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name it: `Java Migration Accelerator`
   - Select scopes: `repo`, `read:user`
   - Click "Generate token" and copy it

2. **Option A: Set as Default Token** (for automated access)
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env and add your token
   GITHUB_TOKEN=ghp_your_token_here
   
   # Start backend
   python main.py
   ```

3. **Option B: Provide Token in UI** (for web interface)
   - Open Migration Wizard
   - Step 1: Select Repository
   - Enter private repo URL: `https://github.com/myorg/private-repo`
   - Paste your token in "GitHub Token" field
   - Continue with migration

## Authentication Methods

### Method 1: User-Provided Token (Recommended for Web UI)

**Best for:** Web applications, multiple users, security-conscious deployments

```
Advantages:
✓ No sensitive tokens stored on server
✓ Each user uses their own credentials
✓ Better for audit trails and compliance
✓ No token expiration issues on server side
```

**How to use:**
1. Generate your personal access token on GitHub/GitLab
2. In Migration Wizard → Step 1, select your private repository
3. Paste your token in the "GitHub Token" field
4. Continue with migration

**API Example:**
```bash
curl -X POST http://localhost:8001/api/migration/start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "github",
    "source_repo_url": "https://github.com/myorg/private-repo",
    "target_java_version": "21",
    "token": "ghp_your_personal_access_token",
    "conversion_types": ["java_version"]
  }'
```

### Method 2: Default Token (Recommended for Server/CI-CD)

**Best for:** Server deployments, CI/CD pipelines, automated processes

```
Advantages:
✓ Automatic private repo access
✓ Higher GitHub API rate limits (5000/hour vs 60/hour)
✓ No user token management needed
✓ Ideal for self-hosted instances
```

**How to configure:**
```bash
# 1. Create personal access token on GitHub
# 2. Edit .env file
GITHUB_TOKEN=ghp_your_token_here

# 3. Restart backend
python main.py

# 4. Backend automatically uses token for all requests
```

**API Example (no token needed in request):**
```bash
curl -X POST http://localhost:8001/api/migration/start \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "github",
    "source_repo_url": "https://github.com/myorg/private-repo",
    "target_java_version": "21",
    "conversion_types": ["java_version"]
  }'
```

## Token Priority (Fallback Chain)

The backend tries tokens in this order:

1. **User-provided token** (highest priority) - passed in API request
2. **Default token** - from `GITHUB_TOKEN` environment variable
3. **Unauthenticated** (lowest priority) - only for public repos, 60 req/hour limit

Example flow:
```
User provides token in request?
  ✓ YES → Use user token (has priority)
  ✗ NO  → Check GITHUB_TOKEN env var?
            ✓ YES → Use default token
            ✗ NO  → Use unauthenticated (public repos only)
```

## Creating Personal Access Tokens

### GitHub Token Setup

**Step 1:** Visit https://github.com/settings/tokens

**Step 2:** Click "Generate new token" → "Generate new token (classic)"

**Step 3:** Configure token
- **Token name:** `Java Migration Accelerator`
- **Expiration:** 90 days (recommended) or custom
- **Scopes:**
  - ✓ `repo` - Full control of private repositories
  - ✓ `read:user` - Read user profile data
  - ✓ `read:org` - Read organization data (if using org repos)

**Step 4:** Click "Generate token" and copy immediately (you won't see it again)

**Token Format:** Starts with `ghp_` followed by 36 characters
```
Example: ghp_1234567890abcdefghijklmnopqrstuvwxyz
```

### GitLab Token Setup

**Step 1:** Visit https://gitlab.com/-/user_settings/personal_access_tokens

**Step 2:** Click "Create personal access token"

**Step 3:** Configure token
- **Token name:** `Java Migration Accelerator`
- **Expiration:** 90 days (recommended) or custom
- **Scopes:**
  - ✓ `api` - Full API access including private repositories
  - ✓ `read_repository` - Read repository code

**Step 4:** Click "Create personal access token" and copy immediately

**Token Format:** Starts with `glpat_` followed by 20+ characters
```
Example: glpat_1234567890abcdefghijklmnop
```

## Environment Configuration

### .env File Setup

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your tokens
GITHUB_TOKEN=ghp_your_github_token_here
GITLAB_TOKEN=glpat_your_gitlab_token_here
GITLAB_URL=https://gitlab.com

# Optional: Email notifications
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Optional: Code quality (SonarQube)
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your_sonar_token
```

### For Docker/Kubernetes

```bash
# Using environment variables
docker run -e GITHUB_TOKEN=ghp_xxxx -e GITLAB_TOKEN=glpat_xxxx \
  java-migration-accelerator

# Using .env file
docker run --env-file .env java-migration-accelerator
```

### For Railway/Render Deployment

1. Go to project settings
2. Add environment variable:
   - Key: `GITHUB_TOKEN`
   - Value: Your GitHub personal access token
3. Redeploy

## Private Repository URLs

### GitHub
```
Public:  https://github.com/username/repo
Private: https://github.com/username/private-repo
Org:     https://github.com/organization/repo
```

### GitLab
```
Public:     https://gitlab.com/username/repo
Private:    https://gitlab.com/username/private-repo
Group:      https://gitlab.com/group/subgroup/repo
Self-hosted: https://gitlab.company.com/group/repo
```

## Testing Private Repo Access

### Using the Migration Wizard UI

1. Open http://localhost:5173 (or your deployed URL)
2. Step 1: Select Repository
3. Enter private repo URL
4. Provide access token
5. Click "Analyze Repository"
6. Should show files and Java version

### Using curl (API)

**Test listing repositories:**
```bash
curl -X POST http://localhost:8001/api/github/repos \
  -H "Content-Type: application/json" \
  -d '{"token": "ghp_your_token"}'
```

**Test analyzing repository:**
```bash
curl -X POST http://localhost:8001/api/github/analyze-url \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/myorg/private-repo",
    "token": "ghp_your_token"
  }'
```

## Troubleshooting Private Repo Access

### Error: "Repository not found" (401)

**Cause:** Token doesn't have access or missing scopes

**Solutions:**
1. Verify token scope includes `repo`
2. Confirm you have access to the repository
3. Check if repo URL is correct (no trailing slash)
4. Regenerate token: https://github.com/settings/tokens

```bash
# Verify token is valid
curl -H "Authorization: token ghp_your_token" \
  https://api.github.com/user
```

### Error: "Bad credentials" (403)

**Cause:** Invalid, expired, or revoked token

**Solutions:**
1. Token might have expired (60 days for web-flow tokens)
2. Regenerate new token: https://github.com/settings/tokens
3. Verify token format starts with `ghp_` (GitHub) or `glpat_` (GitLab)

### Error: "Rate limit exceeded"

**Cause:** Too many requests without authentication

**Solutions:**
1. Set `GITHUB_TOKEN` in `.env` for 5000 req/hour limit
2. Without token: 60 req/hour limit (public repos only)
3. Wait 1 hour for rate limit to reset

### Error: "Private key required" or SSH errors

**Cause:** Trying to clone via SSH instead of HTTPS

**Solution:**
- Use HTTPS URLs: `https://github.com/org/repo`
- Not SSH URLs: `git@github.com:org/repo.git`
- Backend uses HTTPS cloning with token authentication

### Migration fails on private repo

**Checklist:**
1. ✓ Token has correct scopes (`repo`, `read:user`)
2. ✓ You have access to the repository
3. ✓ Repository has Java files or build files (pom.xml, build.gradle)
4. ✓ Repository isn't archived or deleted
5. ✓ Token isn't expired
6. ✓ Using HTTPS URL format

**Debug steps:**
1. Check migration logs for specific errors
2. Test token: `curl -H "Authorization: token ghp_xxx" https://api.github.com/user`
3. Test repo access: `curl -H "Authorization: token ghp_xxx" https://api.github.com/repos/org/repo`

## Security Best Practices

### Token Management

- ✓ Never commit `.env` to Git (included in .gitignore)
- ✓ Rotate tokens every 90 days
- ✓ Use narrow scopes (only needed permissions)
- ✓ For CI/CD: use GitHub/GitLab Secrets, not .env files
- ✓ Monitor token usage in GitHub/GitLab settings
- ✓ Revoke unused tokens immediately

### For Web Applications

- ✓ Don't store user tokens on server
- ✓ Users provide their own tokens per request
- ✓ Tokens only stored in browser session (not database)
- ✓ Use HTTPS only (never HTTP)
- ✓ Implement rate limiting per user

### For CI/CD Pipelines

- ✓ Use GitHub Actions Secrets or GitLab CI Variables
- ✓ Never expose tokens in logs
- ✓ Use short-lived tokens when possible
- ✓ Rotate tokens regularly
- ✓ Use separate tokens per pipeline

## Revoking Tokens

### GitHub

1. Go to https://github.com/settings/tokens
2. Find the token
3. Click "Delete"
4. Confirm deletion

### GitLab

1. Go to https://gitlab.com/-/user_settings/personal_access_tokens
2. Find the token
3. Click "Revoke"
4. Confirm

Once revoked, any application using that token will get "Bad credentials" errors.

## Advanced: Multiple Token Support

For organizations with multiple private repositories:

**Strategy 1: Single Service Account Token**
```
1. Create service account: migration-bot@company.com
2. Add to all required organizations/groups
3. Generate token for service account
4. Use as GITHUB_TOKEN in backend
```

**Strategy 2: User-Provided Tokens**
```
1. Each developer provides their own token
2. Backend uses their token for private repos they can access
3. Better security and audit trail
4. No single point of failure
```

**Strategy 3: OAuth (Enterprise)**
```
1. Use GitHub/GitLab OAuth flow
2. Users authenticate via their account
3. No token storage on server
4. Most secure for production
```

## API Reference

### Start Migration with Token

```
POST /api/migration/start

{
  "platform": "github",
  "source_repo_url": "https://github.com/myorg/private-repo",
  "target_repo_name": "migrated-private-repo",
  "source_java_version": "8",
  "target_java_version": "21",
  "token": "ghp_your_personal_access_token",
  "conversion_types": ["java_version", "spring_boot_2_to_3"],
  "run_tests": true,
  "run_sonar": false
}
```

### Analyze Repository with Token

```
POST /api/github/analyze-url

{
  "repo_url": "https://github.com/myorg/private-repo",
  "token": "ghp_your_personal_access_token"
}
```

### List Repositories with Token

```
POST /api/github/repos

{
  "token": "ghp_your_personal_access_token"
}
```

Returns all repositories accessible with the provided token, including private repos.

---

**Need help?** Check the troubleshooting section above or refer to `.env.example` for detailed configuration options.
