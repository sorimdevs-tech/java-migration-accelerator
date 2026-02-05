# 📊 Repository Analysis Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│                  RepositoryAnalysisPanel.tsx                     │
│                                                                   │
│  ┌──────────────┬──────────────┬────────────┬─────────────────┐ │
│  │ Overview Tab │ Dependencies │ Business   │ Testing | Refactor│ │
│  │  - Health    │   - Maven    │  Logic     │   Tab   │  Tab  │ │
│  │  - Summary   │   - Gradle   │  - Issues  │         │       │ │
│  │  - Metrics   │   - Vulns    │  - Patterns│         │       │ │
│  └──────────────┴──────────────┴────────────┴─────────────────┘ │
└────────────────────────────│────────────────────────────────────┘
                             │ (HTTP REST Calls)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Backend API Layer (FastAPI)                         │
│                     (main.py)                                    │
│                                                                   │
│  ┌─────────────────┬──────────────┬─────────────┬────────────┐  │
│  │ /api/repository │ /api/repo... │ /api/repo...│ /api/repo..│  │
│  │  /analyze       │  /dependencies  /business...│  /testing  │  │
│  │ (POST)          │ (GET)          (GET)        │ (GET)      │  │
│  └─────────────────┴──────────────┴─────────────┴────────────┘  │
│                             │                                    │
│                    (Calls RepositoryAnalyzer)                    │
└────────────────────────────│────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│       Repository Analyzer Engine (repository_analyzer.py)       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 1. Clone Repository (via GitHub/GitLab Service)             │ │
│  │    → /tmp/migrations/{repo_name}                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 2. Analyze Dependencies                                     │ │
│  │    ├─ Parse pom.xml (Maven)                                │ │
│  │    ├─ Parse build.gradle (Gradle)                          │ │
│  │    ├─ Extract Java versions                                │ │
│  │    ├─ Identify outdated packages                           │ │
│  │    └─ Flag security vulnerabilities                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 3. Analyze Business Logic (Scan Java Files)                │ │
│  │    ├─ Deprecated API usage                                 │ │
│  │    ├─ Null safety violations                               │ │
│  │    ├─ String comparison errors                             │ │
│  │    ├─ Exception handling anti-patterns                     │ │
│  │    ├─ Thread safety issues                                 │ │
│  │    └─ Resource management problems                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 4. Analyze Testing Coverage                                │ │
│  │    ├─ Count test files                                     │ │
│  │    ├─ Calculate coverage %                                 │ │
│  │    ├─ Detect test frameworks                               │ │
│  │    └─ Generate recommendations                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 5. Analyze Code Refactoring                                │ │
│  │    ├─ Find long methods                                    │ │
│  │    ├─ Identify God classes                                 │ │
│  │    ├─ Detect code duplication                              │ │
│  │    └─ Flag deprecated APIs                                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 6. Calculate Health Score (0-100)                          │ │
│  │    ├─ Deduct for vulnerable dependencies                   │ │
│  │    ├─ Deduct for business logic issues                     │ │
│  │    ├─ Deduct for low test coverage                         │ │
│  │    ├─ Deduct for refactoring needs                         │ │
│  │    └─ Return color-coded result                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 7. Return Comprehensive Analysis JSON                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────│────────────────────────────────────┘
                             │
                    (JSON Response with all metrics)
                             │
                             ▼
                         Frontend UI
                    (Displays in 5 tabs)
```

---

## Data Flow Diagram

```
User Input: Repository URL
       │
       ▼
┌─────────────────────────────────────┐
│ Check if GitHub or GitLab           │
├─────────────────────────────────────┤
│ ├─ GitLab → Use GitLabService       │
│ └─ GitHub → Use GitHubService       │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Clone Repository to /tmp/migrations │
├─────────────────────────────────────┤
│ ├─ Check authentication token       │
│ ├─ Rate limit check                 │
│ └─ Clone (shallow or full)          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Run RepositoryAnalyzer.analyze()    │
├─────────────────────────────────────┤
│ ├─ _analyze_dependencies()          │
│ ├─ _analyze_business_logic()        │
│ ├─ _analyze_testing()               │
│ ├─ _analyze_code_refactoring()      │
│ └─ _generate_summary()              │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ Results Dictionary                                      │
├─────────────────────────────────────────────────────────┤
│ {                                                       │
│   "dependencies": {                                     │
│     "maven": {...},                                     │
│     "gradle": {...},                                    │
│     "total_dependencies": N,                            │
│     "outdated_count": N,                                │
│     "vulnerable_count": N,                              │
│     "critical_issues": [...]                            │
│   },                                                    │
│   "business_logic_issues": [...],                       │
│   "testing_coverage": {...},                            │
│   "code_refactoring": {...},                            │
│   "summary": {                                          │
│     "overall_health_score": N,                          │
│     ...more metrics...                                  │
│   }                                                     │
│ }                                                       │
└──────────┬───────────────────────────────────────────────┘
           │
           ▼
    JSON Response to Frontend
           │
           ▼
   RepositoryAnalysisPanel
    (Processes & Displays)
           │
      ┌────┴────┐
      │          │
      ▼          ▼
  Set State   Render Tabs
      │
      ▼
   Display Results
   ├─ Overview
   ├─ Dependencies
   ├─ Business Logic
   ├─ Testing
   └─ Refactoring
```

---

## API Endpoint Response Structure

### POST /api/repository/analyze

```json
{
  "repo_url": "https://github.com/gradle/gradle",
  "analysis_timestamp": "2026-02-05T10:30:45.123456",
  
  "dependencies": {
    "maven": {
      "found": true,
      "java_version": "11",
      "dependencies": [
        {
          "group_id": "org.gradle",
          "artifact_id": "gradle-core",
          "version": "7.5.0",
          "scope": "compile",
          "type": "maven",
          "is_outdated": false,
          "severity": "LOW"
        }
      ],
      "build_plugins": [...]
    },
    "gradle": {
      "found": false
    },
    "total_dependencies": 45,
    "outdated_count": 3,
    "vulnerable_count": 2,
    "critical_issues": [
      {
        "artifact": "log4j:log4j",
        "version": "2.13.0",
        "severity": "CRITICAL",
        "issue": "CVE-2021-44228 Remote Code Execution vulnerability"
      }
    ]
  },

  "business_logic_issues": [
    {
      "type": "string_comparison",
      "file": "src/main/java/User.java",
      "line": 125,
      "severity": "HIGH",
      "match": "name == \"admin\"",
      "suggestion": "Use .equals() or .equalsIgnoreCase() instead",
      "category": "business_logic"
    }
  ],

  "testing_coverage": {
    "test_files_found": 145,
    "test_frameworks": ["JUnit", "Mockito"],
    "coverage_percentage": 78,
    "issues": [
      {
        "severity": "LOW",
        "issue": "Test coverage could be improved: 78%",
        "suggestion": "Aim for at least 80% code coverage"
      }
    ]
  },

  "code_refactoring": {
    "total_java_files": 234,
    "issues": [
      {
        "file": "src/Controller.java",
        "type": "god_classes",
        "severity": "MEDIUM",
        "suggestion": "Split God class into smaller, single-responsibility classes",
        "details": "34 public methods detected"
      }
    ]
  },

  "summary": {
    "total_dependencies": 45,
    "outdated_dependencies": 3,
    "vulnerable_dependencies": 2,
    "critical_dependency_issues": 1,
    "business_logic_issues": 12,
    "high_priority_business_logic": 3,
    "test_coverage_percentage": 78,
    "test_files": 145,
    "test_frameworks": ["JUnit", "Mockito"],
    "testing_issues": 1,
    "java_files": 234,
    "refactoring_opportunities": 8,
    "overall_health_score": 72
  }
}
```

---

## Frontend Component State Management

```
RepositoryAnalysisPanel
│
├─ State:
│  ├─ loading: boolean (During API call)
│  ├─ analysis: AnalysisResult | null (API response)
│  └─ activeTab: 'overview' | 'dependencies' | 'logic' | 'testing' | 'refactoring'
│
├─ Props:
│  └─ repoUrl: string (Repository URL)
│
├─ Methods:
│  ├─ fetchAnalysis() → Calls POST /api/repository/analyze
│  ├─ getHealthScore() → Returns {color, label}
│  └─ Tab renderers → Render each tab content
│
└─ Rendered Output:
   ├─ Header with health score
   ├─ Tab navigation buttons
   └─ Tab content area
      ├─ Overview: Metrics grid + recommendations
      ├─ Dependencies: Maven/Gradle configs + vulnerability list
      ├─ Business Logic: Issue list with severity
      ├─ Testing: Coverage metrics + framework info
      └─ Refactoring: Refactoring opportunities list
```

---

## Analysis Engine Flow

```
analyze_repository(repo_path)
│
├─ _analyze_dependencies(repo_path)
│  ├─ _parse_maven_pom(repo_path)
│  │  ├─ Find pom.xml
│  │  ├─ Parse XML
│  │  ├─ Extract Java version
│  │  ├─ Extract dependencies
│  │  └─ Check for outdated/vulnerable
│  │
│  ├─ _parse_gradle_build(repo_path)
│  │  ├─ Find build.gradle
│  │  ├─ Parse with regex
│  │  ├─ Extract Java version
│  │  ├─ Extract dependencies
│  │  └─ Check for outdated/vulnerable
│  │
│  └─ Return combined results
│
├─ _analyze_business_logic(repo_path)
│  ├─ Find all *.java files
│  ├─ For each file:
│  │  ├─ Apply 20+ regex patterns
│  │  ├─ Record matches with line numbers
│  │  └─ Add severity and suggestion
│  └─ Return top 20 issues by severity
│
├─ _analyze_testing(repo_path)
│  ├─ Find test files (*Test.java)
│  ├─ Count test files
│  ├─ Scan for framework imports
│  ├─ Calculate coverage %
│  └─ Generate recommendations
│
├─ _analyze_code_refactoring(repo_path)
│  ├─ For each Java file:
│  │  ├─ Check for long methods
│  │  ├─ Check for God classes
│  │  ├─ Check for deprecated APIs
│  │  └─ Check for code duplication
│  └─ Return refactoring opportunities
│
└─ _generate_summary()
   ├─ Compile counts from all analyses
   ├─ Calculate health score
   └─ Return summary object
```

---

## Health Score Calculation Formula

```
Health Score = 100

DEDUCTIONS:
- Vulnerable dependencies: -5 per vulnerability (max -20)
- Outdated dependencies: -1 per outdated (max -10)
- High severity business logic: -3 per issue (max -20)
- Low test coverage (<50%): -20
- Low test coverage (50-80%): -10
- Refactoring issues: -1 per issue (max -10)

Result: 0-100, mapped to:
- 80-100: 🟢 Excellent
- 60-79:  🟡 Good
- 40-59:  🟠 Fair
- 0-39:   🔴 Poor
```

---

## Regex Pattern Categories (20+ patterns)

### Deprecated Methods (8 patterns)
```
new Integer(…) → Integer.valueOf()
new Long(…) → Long.valueOf()
new Double(…) → Double.valueOf()
new Boolean(…) → Boolean.valueOf()
new Character(…) → Character.valueOf()
new Byte(…) → Byte.valueOf()
new Short(…) → Short.valueOf()
Class.newInstance() → getDeclaredConstructor().newInstance()
```

### Date/Time Issues (2 patterns)
```
new Date() → java.time.LocalDateTime
SimpleDateFormat → DateTimeFormatter
```

### Type Safety (6 patterns)
```
Raw types: List, Map, Set, ArrayList, HashMap, HashSet, Vector, Hashtable
→ Use generics: List<T>, Map<K,V>, etc.
```

### Exception Handling (3 patterns)
```
catch (Exception e) → Catch specific exceptions
catch (Throwable e) → Use Exception instead
e.printStackTrace() → Use proper logging
```

### Null Safety (3 patterns)
```
.equals(null) → Use == null check
Missing null checks → Add Objects.requireNonNull()
```

### Version Migration (4+ patterns)
```
Java 9+: sun.misc.*, sun.reflect.* removed
Java 11+: String.isBlank() available
Java 17+: javax.* → jakarta.* migration required
```

---

## Performance Characteristics

```
Operation           │ Typical Time │ Factors
─────────────────────┼──────────────┼────────────────────
Clone Repository    │ 5-30s        │ Size, network
Parse Dependencies  │ 0.1-0.5s     │ # of files
Scan Business Logic │ 5-15s        │ # of Java files (20 patterns × files)
Test Analysis       │ 1-3s         │ # of test files
Refactoring Check   │ 3-8s         │ # of Java files
Total Analysis      │ 15-60s       │ All of above

File Limits:
- Max Java files analyzed: 100 (for performance)
- Max patterns: 20+ (for business logic)
- Max issues returned: Top 20 by severity
```

---

## Error Handling

```
analyze_repository()
│
└─ Exception → {
     'error': 'error message',
     'dependencies': {},
     'business_logic_issues': [],
     'testing_coverage': {},
     'code_refactoring': {}
   }
```

---

## Security Considerations

```
✅ Safe Operations:
- Read-only file scanning
- No code execution
- Temporary directory cleanup
- Rate limiting on API calls

⚠️ Precautions:
- Clones to isolated /tmp/migrations
- Validates repository URLs
- Checks authentication tokens
- Logs all operations
```

---

## Integration Points

```
┌─────────────────────────────────────────────────┐
│ Migration Wizard                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Step 1: Select Repository                     │
│     └─ Show health score from analysis         │
│                                                 │
│  Step 2: Review Analysis                       │
│     ├─ Dependency issues                       │
│     ├─ Business logic issues to fix            │
│     ├─ Test coverage status                    │
│     └─ Refactoring opportunities               │
│                                                 │
│  Step 3: Configure Migration                   │
│     ├─ Java version                            │
│     ├─ Conversions to apply                    │
│     └─ Fix business logic (recommended)        │
│                                                 │
│  Step 4: Review & Execute                      │
│     └─ Show pre-migration analysis results     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

**Architecture Complete! 🎉**

This comprehensive design ensures:
- ✅ Scalability (handles repos of various sizes)
- ✅ Reliability (robust error handling)
- ✅ Performance (optimized scanning)
- ✅ Security (safe operations)
- ✅ Usability (beautiful UI)
- ✅ Integration (works with migration pipeline)
