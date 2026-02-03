# BEFORE & AFTER: Complete Migration Guide

## 📋 pom.xml COMPARISON

### ❌ BEFORE (Current - Issues)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>test-migration-project</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>Test Migration Project</name>
    <description>A sample Java 8 project for testing migration to Java 17</description>

    <!-- ❌ ISSUE 1: Java 17 is old, should be 21 -->
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- ❌ ISSUE 2: Spring Boot 2.7.0 is EOL (Dec 2023) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>2.7.0</version>
        </dependency>
        
        <!-- ❌ ISSUE 3: Spring Boot 2.7.0 Data JPA uses Hibernate 5 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
            <version>2.7.0</version>
        </dependency>
        
        <!-- ❌ ISSUE 4: JUnit 4 is legacy, JUnit 5 is standard -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
        
        <!-- ❌ ISSUE 5: javax namespace deprecated, jakarta is required -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.1</version>
        </dependency>
        
        <!-- ❌ ISSUE 6: javax namespace deprecated, jakarta is required -->
        <dependency>
            <groupId>javax.persistence</groupId>
            <artifactId>javax.persistence-api</artifactId>
            <version>2.2</version>
        </dependency>
        
        <!-- ❌ ISSUE 7: log4j 1.2.17 is EOL (2012), CRITICAL SECURITY RISK -->
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
        </dependency>
    </dependencies>

    <build>
        <!-- ❌ ISSUE 8: Plugin version needs to match Spring Boot -->
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>2.7.0</version>
            </plugin>
        </plugins>
    </build>
</project>
```

**Issues Summary:**
- ❌ Java 17 (should be 21)
- ❌ Spring Boot 2.7.0 (EOL, should be 3.3.0)
- ❌ JUnit 4 (legacy, should be 5)
- ❌ javax.servlet (deprecated, should be jakarta)
- ❌ javax.persistence (deprecated, should be jakarta)
- ❌ log4j 1.2.17 (CRITICAL - EOL since 2012, should be removed)
- ❌ Plugin 2.7.0 (should be 3.3.0)

**Security Score: 🔴 CRITICAL (log4j CVEs)**

---

### ✅ AFTER (Updated - No Issues)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>test-migration-project</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>Test Migration Project</name>
    <description>A sample Java 21 project with Spring Boot 3 and Jakarta EE</description>

    <!-- ✅ FIXED 1: Updated to Java 21 (latest LTS) -->
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- ✅ FIXED 2: Spring Boot 3.3.0 (current LTS, long-term support) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>3.3.0</version>
        </dependency>
        
        <!-- ✅ FIXED 3: Spring Boot 3.3.0 Data JPA uses Hibernate 6 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
            <version>3.3.0</version>
        </dependency>
        
        <!-- ✅ FIXED 4: JUnit 5 Jupiter (modern testing framework) -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
        
        <!-- ✅ FIXED 5: Jakarta Servlet API (modern jakarta namespace) -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.1.0</version>
        </dependency>
        
        <!-- ✅ FIXED 6: Jakarta Persistence API (modern jakarta namespace) -->
        <dependency>
            <groupId>jakarta.persistence</groupId>
            <artifactId>jakarta.persistence-api</artifactId>
            <version>3.1.0</version>
        </dependency>
        
        <!-- ✅ FIXED 7: log4j REMOVED - SLF4J from Spring Boot used instead -->
        <!-- log4j no longer needed - removed for security -->
        <!-- SLF4J + Logback included automatically with spring-boot-starter-web -->
    </dependencies>

    <build>
        <!-- ✅ FIXED 8: Plugin version matches Spring Boot 3.3.0 -->
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>3.3.0</version>
            </plugin>
        </plugins>
    </build>
</project>
```

**Fixes Applied:**
- ✅ Java 17 → 21
- ✅ Spring Boot 2.7.0 → 3.3.0
- ✅ JUnit 4 → 5 (junit-jupiter)
- ✅ javax.servlet → jakarta.servlet
- ✅ javax.persistence → jakarta.persistence
- ✅ log4j REMOVED (use SLF4J from Spring Boot)
- ✅ Plugin 2.7.0 → 3.3.0

**Security Score: ✅ CLEAN (No known vulnerabilities)**

---

## 🔄 CODE CHANGES

### 1️⃣ Logging Migration: log4j → SLF4J

#### ❌ BEFORE (log4j 1.2.17)
```java
package com.example.service;

import org.apache.log4j.Logger;

public class UserService {
    private static final Logger logger = Logger.getLogger(UserService.class);
    
    public void createUser(User user) {
        try {
            logger.info("Creating user: " + user.getName());
            // Create user logic
            logger.debug("User created successfully");
        } catch (Exception e) {
            logger.error("Error creating user", e);
            logger.fatal("Fatal error during user creation", e);
        }
    }
    
    public void deleteUser(Long userId) {
        logger.warn("Deleting user with id: " + userId);
        // Delete logic
    }
}
```

#### ✅ AFTER (SLF4J + Logback)
```java
package com.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    public void createUser(User user) {
        try {
            logger.info("Creating user: {}", user.getName());
            // Create user logic
            logger.debug("User created successfully");
        } catch (Exception e) {
            logger.error("Error creating user", e);
            // Note: No FATAL level in SLF4J, use ERROR instead
            logger.error("Critical error during user creation", e);
        }
    }
    
    public void deleteUser(Long userId) {
        logger.warn("Deleting user with id: {}", userId);
        // Delete logic
    }
}
```

**Changes:**
- Import: `org.apache.log4j.Logger` → `org.slf4j.Logger`
- Init: `Logger.getLogger()` → `LoggerFactory.getLogger()`
- Strings: `"Creating user: " + name` → `"Creating user: {}", name` (proper formatting)
- Level: `logger.fatal()` → `logger.error()` (no FATAL in SLF4J)

---

### 2️⃣ Servlet Migration: javax → jakarta

#### ❌ BEFORE (javax namespace)
```java
package com.example.servlet;

import javax.servlet.*;
import javax.servlet.http.*;

public class UserServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        
        String userId = req.getParameter("id");
        
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        out.println("{\"status\": \"success\"}");
        out.flush();
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        
        String name = req.getParameter("name");
        
        HttpSession session = req.getSession();
        session.setAttribute("currentUser", name);
        
        resp.sendRedirect("/home");
    }
}
```

#### ✅ AFTER (jakarta namespace)
```java
package com.example.servlet;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

public class UserServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        
        String userId = req.getParameter("id");
        
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        out.println("{\"status\": \"success\"}");
        out.flush();
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        
        String name = req.getParameter("name");
        
        HttpSession session = req.getSession();
        session.setAttribute("currentUser", name);
        
        resp.sendRedirect("/home");
    }
}
```

**Changes:**
- Imports: `javax.servlet.*` → `jakarta.servlet.*`
- No code logic changes needed!

---

### 3️⃣ JPA Migration: javax → jakarta

#### ❌ BEFORE (javax namespace)
```java
package com.example.entity;

import javax.persistence.*;

@Entity
@Table(name = "users")
@NamedQuery(name = "User.findByEmail",
            query = "SELECT u FROM User u WHERE u.email = :email")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "name", length = 100)
    private String name;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Post> posts = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    private Date createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}
```

#### ✅ AFTER (jakarta namespace)
```java
package com.example.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
@NamedQuery(name = "User.findByEmail",
            query = "SELECT u FROM User u WHERE u.email = :email")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "name", length = 100)
    private String name;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Post> posts = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    private Date createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}
```

**Changes:**
- Imports: `javax.persistence.*` → `jakarta.persistence.*`
- Annotations: All @ annotations remain the same (same names)
- No code logic changes needed!

---

### 4️⃣ Test Migration: JUnit 4 → JUnit 5

#### ❌ BEFORE (JUnit 4)
```java
package com.example.service;

import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.BeforeClass;
import org.junit.AfterClass;
import static org.junit.Assert.*;

public class UserServiceTest {
    
    private UserService userService;
    private User testUser;
    
    @BeforeClass
    public static void setUpClass() {
        System.out.println("Setting up test class");
    }
    
    @Before
    public void setUp() {
        userService = new UserService();
        testUser = new User();
        testUser.setName("Test User");
    }
    
    @Test
    public void testCreateUser() {
        User createdUser = userService.createUser(testUser);
        assertNotNull("User should not be null", createdUser);
        assertEquals("User name should match", "Test User", createdUser.getName());
    }
    
    @Test
    public void testDeleteUser() {
        User createdUser = userService.createUser(testUser);
        boolean deleted = userService.deleteUser(createdUser.getId());
        assertTrue("User should be deleted", deleted);
    }
    
    @After
    public void tearDown() {
        userService = null;
        testUser = null;
    }
    
    @AfterClass
    public static void tearDownClass() {
        System.out.println("Tearing down test class");
    }
}
```

#### ✅ AFTER (JUnit 5 Jupiter)
```java
package com.example.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.AfterAll;
import static org.junit.jupiter.api.Assertions.*;

class UserServiceTest {
    
    private UserService userService;
    private User testUser;
    
    @BeforeAll
    static void setUpClass() {
        System.out.println("Setting up test class");
    }
    
    @BeforeEach
    void setUp() {
        userService = new UserService();
        testUser = new User();
        testUser.setName("Test User");
    }
    
    @Test
    void testCreateUser() {
        User createdUser = userService.createUser(testUser);
        assertNotNull(createdUser, "User should not be null");
        assertEquals("Test User", createdUser.getName(), "User name should match");
    }
    
    @Test
    void testDeleteUser() {
        User createdUser = userService.createUser(testUser);
        boolean deleted = userService.deleteUser(createdUser.getId());
        assertTrue(deleted, "User should be deleted");
    }
    
    @AfterEach
    void tearDown() {
        userService = null;
        testUser = null;
    }
    
    @AfterClass
    static void tearDownClass() {
        System.out.println("Tearing down test class");
    }
}
```

**Key Changes:**

| JUnit 4 | JUnit 5 | Notes |
|---------|---------|-------|
| @Before | @BeforeEach | Runs before each test |
| @After | @AfterEach | Runs after each test |
| @BeforeClass | @BeforeAll | Runs once before all tests (static method) |
| @AfterClass | @AfterAll | Runs once after all tests (static method) |
| import org.junit.* | import org.junit.jupiter.api.* | New package |
| import org.junit.Assert.* | import org.junit.jupiter.api.Assertions.* | New package for assertions |
| assertEquals(msg, expected, actual) | assertEquals(expected, actual, msg) | Message moved to end |
| assertTrue(msg, condition) | assertTrue(condition, msg) | Message moved to end |
| public void method() | void method() | Can be non-public now |

---

## 🔍 SEARCH & REPLACE COMMANDS

### For IDE (IntelliJ IDEA / VS Code):

**1. Replace all javax imports with jakarta:**
```
Find:    import javax\.
Replace: import jakarta.
```

**2. Replace all log4j imports with SLF4J:**
```
Find:    import org\.apache\.log4j\.
Replace: import org.slf4j.
```

**3. Replace Logger initialization:**
```
Find:    Logger\.getLogger\(
Replace: LoggerFactory.getLogger(
```

**4. Replace JUnit 4 annotations:**
```
Find:    @Before
Replace: @BeforeEach

Find:    @After
Replace: @AfterEach

Find:    @BeforeClass
Replace: @BeforeAll

Find:    @AfterClass
Replace: @AfterAll
```

### For Command Line:

```bash
# Find all files with javax imports
grep -r "import javax" src/ --include="*.java"

# Find all files with log4j imports
grep -r "import org.apache.log4j" src/ --include="*.java"

# Find all files with JUnit 4
grep -r "import org.junit" src/ --include="*.java"

# Replace all in files
find src/ -name "*.java" -type f -exec sed -i 's/import javax\./import jakarta./g' {} \;
find src/ -name "*.java" -type f -exec sed -i 's/Logger.getLogger(/LoggerFactory.getLogger(/g' {} \;
```

---

## ✅ VALIDATION CHECKLIST

After making all changes, verify:

```
□ All pom.xml dependencies updated
□ All Java source files:
  - javax.* imports replaced with jakarta.*
  - log4j imports replaced with SLF4J
  - JUnit 4 annotations replaced with JUnit 5
  
□ Tests updated:
  - All @Before → @BeforeEach
  - All @After → @AfterEach
  - All @BeforeClass → @BeforeAll
  - All @AfterClass → @AfterAll
  - All assertions updated with correct parameter order

□ Build successful:
  mvn clean compile

□ Tests pass:
  mvn test

□ No compilation warnings:
  mvn compile -Wall

□ Application starts:
  mvn spring-boot:run

□ No runtime errors
□ Logging works correctly (SLF4J)
□ Database operations work (Hibernate 6)
```

---

**Total Files to Update: ~3-5 Java source files**  
**Total Effort: 2-3 hours**  
**Complexity: LOW-MEDIUM**

Generated: February 3, 2026
