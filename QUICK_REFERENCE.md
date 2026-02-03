# 🎯 QUICK REFERENCE CARD - Dependency Migration

## At A Glance

```
PROJECT:     test-migration-project v1.0.0-SNAPSHOT
STATUS:      6 dependencies, 4 need update, 1 critical security issue
TIME:        3-4 hours to complete migration
RISK:        🟡 LOW-MEDIUM (well-tested upgrades)
CONFIDENCE:  ✅ HIGH
```

---

## 🔴 THE 3 CRITICAL ACTIONS

### 1. REMOVE log4j 1.2.17 
- **Why:** End of life (2012), known security CVEs
- **When:** IMMEDIATELY
- **How:** Delete from pom.xml, replace with SLF4J
- **Time:** 15 minutes

### 2. UPDATE Spring Boot 2.7.0 → 3.3.0
- **Why:** EOL Dec 2023, security updates needed
- **When:** ASAP
- **How:** Update versions in pom.xml
- **Time:** 2 hours (includes related changes)

### 3. MIGRATE javax → jakarta
- **Why:** Deprecated namespace, required for Spring Boot 3
- **When:** Together with Spring Boot update
- **How:** Replace import statements in code
- **Time:** 1 hour

---

## 📊 THE 6 DEPENDENCIES

| # | Dependency | Current | Target | Fix |
|---|-----------|---------|--------|-----|
| 1 | spring-boot-starter-web | 2.7.0 | 3.3.0 | UPDATE |
| 2 | spring-boot-starter-data-jpa | 2.7.0 | 3.3.0 | UPDATE |
| 3 | junit:junit | 4.13.2 | 5.10.1 | REPLACE |
| 4 | javax.servlet-api | 4.0.1 | 6.1.0 | MIGRATE |
| 5 | javax.persistence-api | 2.2 | 3.1.0 | MIGRATE |
| 6 | log4j:log4j | 1.2.17 | REMOVE | DELETE |

---

## 🔄 THE CHANGES

### pom.xml Changes
```xml
<!-- UPDATE VERSIONS -->
<properties>
  <maven.compiler.source>17</maven.compiler.source> → 21
  <maven.compiler.target>17</maven.compiler.target> → 21
</properties>

<!-- UPDATE DEPENDENCIES -->
<version>2.7.0</version> → 3.3.0  (Spring Boot)
<version>4.13.2</version> → 5.10.1  (JUnit Jupiter)

<!-- MIGRATE NAMESPACE -->
<groupId>javax.servlet</groupId> → jakarta.servlet
<groupId>javax.persistence</groupId> → jakarta.persistence

<!-- REMOVE -->
<groupId>log4j</groupId> (DELETE THIS)
```

### Code Changes (Search & Replace)
```
Find                          → Replace
────────────────────────────────────────────────
import javax.servlet          → import jakarta.servlet
import javax.persistence      → import jakarta.persistence
import org.apache.log4j       → import org.slf4j
Logger.getLogger(             → LoggerFactory.getLogger(

@Before                       → @BeforeEach (tests only)
@After                        → @AfterEach (tests only)
@BeforeClass                  → @BeforeAll (tests only)
@AfterClass                   → @AfterAll (tests only)
```

---

## 📋 QUICK MIGRATION STEPS

### Step 1: Prepare (5 min)
```bash
git checkout -b upgrade/java-21-spring-3
cd test-java-project
```

### Step 2: Update pom.xml (5 min)
- Change Java: 17 → 21
- Change Spring Boot: 2.7.0 → 3.3.0
- Change JUnit: 4.13.2 → 5.10.1
- Remove log4j
- Add jakarta versions

### Step 3: Update Imports (30 min)
```bash
# Find all javax imports
grep -r "import javax" src/

# Replace with jakarta
sed -i 's/import javax\./import jakarta./g' src/**/*.java
```

### Step 4: Update Logging (15 min)
```bash
# Find log4j usage
grep -r "Logger.getLogger" src/

# Replace with SLF4J
sed -i 's/Logger.getLogger/LoggerFactory.getLogger/g' src/**/*.java
```

### Step 5: Update Tests (15 min)
```bash
# In test files:
@Before → @BeforeEach
@After → @AfterEach
@BeforeClass → @BeforeAll
@AfterClass → @AfterAll
```

### Step 6: Build & Test (30 min)
```bash
mvn clean compile    # Fix errors
mvn test            # Run tests
mvn spring-boot:run # Start app
```

### Step 7: Commit (5 min)
```bash
git add .
git commit -m "Upgrade: Java 21 + Spring Boot 3 + Jakarta EE"
git push
```

---

## ✅ VALIDATION COMMANDS

```bash
# Check compilation
mvn clean compile

# Run all tests
mvn test

# Check for log4j
grep -r "log4j" src/ pom.xml

# Check for javax
grep -r "javax\." src/

# Start application
mvn spring-boot:run

# Check dependencies
mvn dependency:tree | grep -E "log4j|javax|spring-boot"
```

---

## ⚠️ GOTCHAS TO WATCH FOR

1. **Annotation imports different in JUnit 5**
   - `org.junit.Before` → `org.junit.jupiter.api.BeforeEach`
   - Check package names after import replacement

2. **Log4j configuration removed**
   - Remove log4j.xml or log4j.properties
   - SLF4J uses application.yml for Logback

3. **Hibernate 5 → 6 changes**
   - Query methods slightly different
   - Database schema validation may differ
   - No action needed usually, but test database operations

4. **Test assertion order changed**
   - JUnit 4: `assertEquals(msg, expected, actual)`
   - JUnit 5: `assertEquals(expected, actual, msg)` ← Message last!

---

## 📚 KEY DOCUMENTS

| File | Purpose | Time |
|------|---------|------|
| README_DEPENDENCY_ANALYSIS.md | Start here | 10 min |
| DEPENDENCY_SUMMARY_TABLES.md | Overview | 5 min |
| BEFORE_AFTER_MIGRATION_GUIDE.md | Code examples | 20 min |
| DEPENDENCY_UPDATE_MATRIX.md | Strategy | 15 min |
| COMPLETE_DEPENDENCY_ANALYSIS.md | Deep dive | 40 min |

---

## 🆘 TROUBLESHOOTING

### mvn compile fails
→ Check for missing imports (javax→jakarta)

### Tests fail
→ Check for old @Before/@After annotations

### Application won't start
→ Check for log4j configuration files

### Database errors
→ Usually fine, Hibernate 6 handles compatibility

### Can't find LoggerFactory
→ Add `import org.slf4j.LoggerFactory;`

---

## 🎯 SUCCESS CRITERIA

```
✅ mvn clean compile [PASS]
✅ mvn test [PASS]
✅ mvn spring-boot:run [STARTS OK]
✅ No log4j imports remaining
✅ No javax.* imports remaining
✅ All tests use JUnit 5
✅ Logging works via SLF4J
✅ Database operations work
```

---

## 📞 QUICK HELP

**"What do I read first?"**  
→ README_DEPENDENCY_ANALYSIS.md

**"Show me code examples"**  
→ BEFORE_AFTER_MIGRATION_GUIDE.md

**"How do I do the find/replace?"**  
→ BEFORE_AFTER_MIGRATION_GUIDE.md "Search & Replace Commands"

**"What if I mess up?"**  
→ `git reset --hard` or `git checkout <original-branch>`

**"Can I do this gradually?"**  
→ Yes, see DEPENDENCY_UPDATE_MATRIX.md "Migration Phases"

**"How long will this take?"**  
→ 3-4 hours total (see timeline above)

**"Will this break my app?"**  
→ No if you follow the guide (tested upgrades)

---

## 🚀 READY? START HERE:

1. Create branch: `git checkout -b upgrade/java-21`
2. Read: [BEFORE_AFTER_MIGRATION_GUIDE.md](BEFORE_AFTER_MIGRATION_GUIDE.md)
3. Follow: Step-by-step instructions
4. Validate: Using checklist above
5. Commit: `git commit -am "Upgrade complete"`

---

**Estimated Time to Complete: 3-4 hours**  
**Risk Level: LOW-MEDIUM**  
**Difficulty: MEDIUM**  
**Confidence: HIGH ✅**

**Created: February 3, 2026**  
**Java Migration Accelerator v1.0**
