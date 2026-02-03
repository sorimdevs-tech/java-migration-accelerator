# 📊 DEPENDENCY UPDATE MATRIX

## Current Project Status: Java 17 → Java 21 Migration with Spring Boot 2.7 → 3.3

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROJECT DEPENDENCY STATUS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Total Dependencies: 6                                                       │
│  ✅ Up-to-date: 0                                                           │
│  🟠 Outdated: 4                                                             │
│  🔴 Deprecated/EOL: 2                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔴 CRITICAL PRIORITY (Must Update Immediately)

### 1. Remove log4j 1.2.17 → SLF4J (FOSSA Score Impact)
```
┌───────────────────────────────────────────┐
│ Dependency: log4j:log4j                   │
├───────────────────────────────────────────┤
│ Current:  1.2.17 (2012)                   │
│ Status:   🔴 END OF LIFE                  │
│ CVEs:     Known security vulnerabilities  │
│ Action:   REMOVE - Use SLF4J             │
└───────────────────────────────────────────┘
```

### 2. Update Spring Boot 2.7.0 → 3.3.0
```
┌───────────────────────────────────────────┐
│ Dependency: spring-boot-starter-web       │
├───────────────────────────────────────────┤
│ Current:  2.7.0 (May 2022)                │
│ Latest:   3.3.0 (Current LTS)             │
│ Status:   🟠 OUTDATED (EOL Dec 2023)     │
│ Requires: Jakarta EE + Java 17+          │
│ Action:   UPGRADE IMMEDIATELY            │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ Dependency: spring-boot-starter-data-jpa  │
├───────────────────────────────────────────┤
│ Current:  2.7.0                           │
│ Latest:   3.3.0                           │
│ Includes: Hibernate 6.0+                  │
│ Status:   🟠 OUTDATED                     │
│ Action:   UPGRADE WITH spring-boot-web   │
└───────────────────────────────────────────┘
```

### 3. Migrate to Jakarta EE Namespace
```
┌───────────────────────────────────────────┐
│ Dependency: javax.servlet-api             │
├───────────────────────────────────────────┤
│ Current:  4.0.1 (javax namespace)         │
│ Latest:   6.1.0 (jakarta namespace)       │
│ Status:   🔴 DEPRECATED                   │
│ Change:   import javax.* → jakarta.*      │
│ Action:   MIGRATE + CODE UPDATES          │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ Dependency: javax.persistence-api         │
├───────────────────────────────────────────┤
│ Current:  2.2 (javax namespace)           │
│ Latest:   3.1.0 (jakarta namespace)       │
│ Status:   🔴 DEPRECATED                   │
│ Change:   import javax.* → jakarta.*      │
│ Action:   MIGRATE + CODE UPDATES          │
└───────────────────────────────────────────┘
```

## 🟠 HIGH PRIORITY (Update in Phase 2)

### 4. Update JUnit 4 → JUnit 5
```
┌───────────────────────────────────────────┐
│ Dependency: junit:junit                   │
├───────────────────────────────────────────┤
│ Current:  4.13.2 (2020)                   │
│ Latest:   5.10.1 (Current)                │
│ Status:   🟠 LEGACY                       │
│ Changes:  @Before→@BeforeEach,            │
│           @Test stays same,               │
│           Package: org.junit →            │
│                   org.junit.jupiter.api   │
│ Action:   UPDATE TEST DEPENDENCIES        │
│ Scope:    test                            │
└───────────────────────────────────────────┘
```

## 📈 DEPENDENCY TREE (Production Path)

```
test-migration-project (Java 17)
│
├── spring-boot-starter-web 2.7.0 ❌ → 3.3.0 ✅
│   ├── spring-boot 2.7.0 ❌ → 3.3.0 ✅
│   ├── spring-webmvc (included)
│   └── tomcat-embed-core (included)
│
├── spring-boot-starter-data-jpa 2.7.0 ❌ → 3.3.0 ✅
│   ├── spring-data-jpa (included)
│   └── hibernate-core 5.x ❌ → 6.x ✅
│       └── jakarta.persistence 3.0 → 3.1 ✅
│
├── javax.servlet-api 4.0.1 ❌ → jakarta 6.1.0 ✅
│
├── javax.persistence-api 2.2 ❌ → jakarta 3.1.0 ✅
│
└── log4j 1.2.17 ❌ REMOVE ✅ (Use SLF4J from Spring Boot)

TEST:
└── junit:junit 4.13.2 ❌ → junit-jupiter 5.10.1 ✅
```

## 🔄 MIGRATION PHASES

### Phase 1: Java Version (5 min)
```
maven.compiler.source: 17 → 21
maven.compiler.target: 17 → 21
```

### Phase 2: Dependency Updates (10 min)
```
Update pom.xml with:
- Spring Boot 3.3.0
- JUnit 5
- Jakarta EE
- Remove log4j
```

### Phase 3: Code Updates (1-2 hours)
```
Find & Replace (3 passes):
1. import javax.servlet → import jakarta.servlet
2. import javax.persistence → import jakarta.persistence
3. import org.apache.log4j → import org.slf4j

Update Test Annotations:
- @Before → @BeforeEach
- @After → @AfterEach
```

### Phase 4: Testing & Validation (1 hour)
```
mvn clean compile → Fix errors
mvn test → Run tests
Manual verification
```

## 📊 STATISTICS

```
┌──────────────────────────────────────────────────────┐
│          DEPENDENCY UPDATE STATISTICS                │
├──────────────────────────────────────────────────────┤
│                                                       │
│ Total Dependencies:           6                      │
│ Direct Dependencies:          6                      │
│ Transitive Dependencies:      ~50+ (via Spring Boot) │
│                                                       │
│ Scope Breakdown:                                     │
│ ├─ compile/runtime:           5 (83%)               │
│ └─ test:                       1 (17%)               │
│                                                       │
│ Status Breakdown:                                    │
│ ├─ Up-to-date:                0 (0%)                │
│ ├─ Outdated (Patch/Minor):    0 (0%)                │
│ ├─ Outdated (Major):          4 (67%)               │
│ └─ Deprecated/EOL:            2 (33%)               │
│                                                       │
│ Severity Distribution:                               │
│ ├─ CRITICAL:                  1 (log4j)             │
│ ├─ HIGH:                       5 (others)            │
│ └─ MEDIUM:                     0                     │
│                                                       │
│ Lines of Code to Update:                             │
│ ├─ Import statements:         ~20-30                │
│ ├─ Annotations (tests):       ~5-10                 │
│ └─ Logging calls:             ~30-50                │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## 🎯 RECOMMENDED UPDATE ORDER

```
1. 🔴 REMOVE log4j               [5 min]
        └─ Reduces FOSSA security score impact

2. 🔴 UPDATE Spring Boot 2.7→3.3 [10 min pom.xml + 1hr code]
        └─ Enables Jakarta EE + Java 21 support
        └─ Updates Hibernate 5→6
        └─ Updates plugin versions

3. 🔴 MIGRATE javax→jakarta      [30 min]
        ├─ Servlet imports
        ├─ Persistence imports
        └─ Entity annotations

4. 🟠 UPDATE JUnit 4→5            [30 min]
        ├─ Test imports
        └─ Test annotations

5. 🟠 UPDATE Java 17→21           [5 min]
        └─ Compiler configuration
        └─ Optional: Use Java 21 features

6. ✅ TEST & VALIDATE            [1-2 hours]
        ├─ mvn clean compile
        ├─ mvn test
        └─ Manual verification
```

## ⚠️ KNOWN ISSUES TO WATCH FOR

1. **Spring Boot 3.0 → 3.3 Incremental Updates**
   - May need to update in stages
   - Check breaking changes for each version

2. **Hibernate 5 → 6 Migration**
   - Query language changes
   - Entity listener behavior
   - Database schema validation

3. **SLF4J Configuration**
   - Logback configuration may differ
   - Application properties for logging

4. **Test Framework**
   - Assertions may need updating
   - Test runners different in JUnit 5

## 📋 CHECKLIST FOR MIGRATION

```
Phase 1: Preparation
☐ Create feature branch
☐ Backup current code
☐ Document current state

Phase 2: Dependencies
☐ Update pom.xml with new versions
☐ Remove log4j dependency
☐ Add Jakarta EE dependencies
☐ Update test dependencies

Phase 3: Code Updates
☐ Update all imports (javax → jakarta)
☐ Update all logging (log4j → SLF4J)
☐ Update test annotations

Phase 4: Build & Test
☐ mvn clean compile (fix errors)
☐ mvn test (all tests pass)
☐ Manual testing
☐ Performance verification

Phase 5: Deployment
☐ Code review
☐ Final testing
☐ Merge to main branch
☐ Deploy to production
```

---

**Total Effort Estimate: 3-5 hours**  
**Risk Level: LOW-MEDIUM**  
**Blocking Issues: YES (log4j security)**

Generated: February 3, 2026
