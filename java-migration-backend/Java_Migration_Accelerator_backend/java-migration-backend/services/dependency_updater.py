"""
Dependency Update Recommendations
Provides upgrade paths and target versions for Java dependencies
"""

# Mapping of current versions to recommended target versions with severity
DEPENDENCY_UPDATES = {
    "log4j": {
        "artifact_patterns": ["log4j:log4j", "org.apache.logging.log4j:*"],
        "status": "CRITICAL",
        "reason": "EOL (End of Life) since 2012, multiple known CVEs",
        "updates": {
            "1.2.*": {
                "target_version": "2.17.1",
                "target_library": "org.apache.logging.log4j:log4j-core",
                "replacement_artifact": "org.apache.logging.log4j:log4j-core",
                "severity": "CRITICAL",
                "reason": "Security vulnerabilities, EOL library"
            }
        },
        "code_changes": "Replace log4j.properties with log4j2.xml, update logger initialization"
    },
    "springframework.boot": {
        "artifact_patterns": ["org.springframework.boot:spring-boot-starter*", "org.springframework.boot:spring-boot"],
        "status": "HIGH",
        "reason": "Major framework upgrade with breaking changes",
        "updates": {
            "2.0.*": {
                "target_version": "3.3.0",
                "severity": "HIGH",
                "reason": "Latest stable, security patches, performance improvements"
            },
            "2.1.*": {
                "target_version": "3.3.0",
                "severity": "HIGH",
                "reason": "EOL approaching, jakarta namespace required"
            },
            "2.7.*": {
                "target_version": "3.3.0",
                "severity": "HIGH",
                "reason": "EOL December 2023, spring boot 3 required for Java 17+"
            }
        },
        "code_changes": "javax → jakarta, configuration updates, dependencies alignment"
    },
    "javax": {
        "artifact_patterns": ["javax.*:*", "javax.*"],
        "status": "HIGH",
        "reason": "Deprecated in favor of jakarta namespace",
        "updates": {
            "*": {
                "target_library": "jakarta.*",
                "severity": "HIGH",
                "reason": "Mandatory for Spring Boot 3+, EE platform standard"
            }
        },
        "code_changes": "Import statements: import javax.* → import jakarta.*"
    },
    "jakarta": {
        "artifact_patterns": ["jakarta.*:*", "jakarta.*"],
        "status": "OK",
        "reason": "Current standard for Java EE",
        "updates": {},
        "code_changes": "No changes needed"
    },
    "junit": {
        "artifact_patterns": ["junit:junit"],
        "status": "HIGH",
        "reason": "JUnit 4 is legacy (last release 2014), JUnit 5 is modern standard",
        "updates": {
            "4.*": {
                "target_version": "5.9.3",
                "target_library": "org.junit.jupiter:junit-jupiter",
                "severity": "HIGH",
                "reason": "Latest version, modern testing framework"
            }
        },
        "code_changes": "@Test, @Before, @After annotations updated, assertions changed"
    },
    "junit5": {
        "artifact_patterns": ["org.junit.jupiter:*", "org.junit5.*"],
        "status": "OK",
        "reason": "Modern testing framework",
        "updates": {
            "5.*": {
                "target_version": "5.9.3",
                "severity": "LOW",
                "reason": "Keep up with latest"
            }
        },
        "code_changes": "No major changes needed"
    },
    "hamcrest": {
        "artifact_patterns": ["org.hamcrest:hamcrest-all", "org.hamcrest:hamcrest"],
        "status": "LOW",
        "reason": "Still maintained, but can use JUnit 5 matchers",
        "updates": {
            "1.*": {
                "target_version": "2.1",
                "severity": "LOW",
                "reason": "Optional modernization"
            }
        },
        "code_changes": "Use org.hamcrest:hamcrest instead of hamcrest-all"
    }
}

JAVA_VERSION_RECOMMENDATIONS = {
    "8": {
        "target": "21",
        "severity": "HIGH",
        "reason": "Java 8 EOL March 2022, Java 21 is LTS"
    },
    "11": {
        "target": "21",
        "severity": "HIGH",
        "reason": "Java 11 EOL Jan 2026, Java 21 is LTS"
    },
    "17": {
        "target": "21",
        "severity": "MEDIUM",
        "reason": "Java 21 is latest LTS with performance improvements"
    },
    "21": {
        "target": "21",
        "severity": "OK",
        "reason": "Already on latest LTS version"
    }
}


def get_dependency_update(artifact_id: str, current_version: str) -> dict:
    """
    Get update recommendation for a dependency
    
    Args:
        artifact_id: Maven artifact ID (e.g., "org.springframework.boot:spring-boot-starter-web")
        current_version: Current version string
        
    Returns:
        dict with update info: {
            "library_key": str,
            "current_version": str,
            "target_version": str | None,
            "status": str,  # "CRITICAL", "HIGH", "MEDIUM", "LOW", "OK"
            "reason": str,
            "needs_update": bool,
            "update_severity": str,
            "code_changes_needed": bool,
            "estimated_impact": str  # "LOW", "MEDIUM", "HIGH"
        }
    """
    
    artifact_lower = artifact_id.lower()
    version_major = current_version.split('.')[0] if current_version else "0"
    
    # Check log4j patterns
    if "log4j" in artifact_lower and ":" in artifact_id:
        library, artifact = artifact_id.split(":", 1)
        if "log4j:log4j" in artifact_id or (library.endswith("log4j") and artifact == "log4j"):
            if current_version.startswith("1."):
                return {
                    "library_key": "log4j",
                    "library": "org.apache.logging.log4j:log4j-core",
                    "current_version": current_version,
                    "target_version": "2.17.1",
                    "status": "CRITICAL",
                    "reason": "EOL since 2012, multiple known CVEs",
                    "needs_update": True,
                    "update_severity": "CRITICAL",
                    "code_changes_needed": True,
                    "estimated_impact": "HIGH",
                    "migration_guide": "Complete logging framework replacement required"
                }
    
    # Check Spring Boot patterns
    if "spring-boot" in artifact_lower:
        if current_version.startswith("2."):
            return {
                "library_key": "springframework.boot",
                "current_version": current_version,
                "target_version": "3.3.0",
                "status": "HIGH",
                "reason": "Spring Boot 3 requires Java 17+, jakarta namespace mandatory",
                "needs_update": True,
                "update_severity": "HIGH",
                "code_changes_needed": True,
                "estimated_impact": "HIGH",
                "migration_guide": "Update to Spring Boot 3.3.0, requires jakarta namespace"
            }
        elif current_version.startswith("3."):
            target_version = "3.3.0"
            if current_version < target_version:
                return {
                    "library_key": "springframework.boot",
                    "current_version": current_version,
                    "target_version": target_version,
                    "status": "MEDIUM",
                    "reason": "Minor version update available",
                    "needs_update": True,
                    "update_severity": "MEDIUM",
                    "code_changes_needed": False,
                    "estimated_impact": "LOW",
                    "migration_guide": "Update to latest Spring Boot 3.x"
                }
    
    # Check javax patterns
    if "javax" in artifact_lower and not "jakarta" in artifact_lower:
        return {
            "library_key": "javax",
            "current_version": current_version,
            "target_version": "Latest jakarta.*",
            "status": "HIGH",
            "reason": "javax namespace is deprecated, jakarta is the standard for Java EE",
            "needs_update": True,
            "update_severity": "HIGH",
            "code_changes_needed": True,
            "estimated_impact": "HIGH",
            "migration_guide": "Replace javax.* with jakarta.* equivalents"
        }
    
    # Check JUnit patterns
    if "junit:junit" in artifact_id or (artifact_lower.startswith("junit") and current_version.startswith("4.")):
        return {
            "library_key": "junit",
            "current_version": current_version,
            "target_version": "5.9.3",
            "target_library": "org.junit.jupiter:junit-jupiter",
            "status": "HIGH",
            "reason": "JUnit 4 is legacy (EOL 2014), JUnit 5 is modern standard",
            "needs_update": True,
            "update_severity": "HIGH",
            "code_changes_needed": True,
            "estimated_impact": "MEDIUM",
            "migration_guide": "Update to JUnit 5, change annotations and assertions"
        }
    
    # Check jakarta patterns
    if "jakarta" in artifact_lower:
        return {
            "library_key": "jakarta",
            "current_version": current_version,
            "target_version": current_version,  # Generally no update needed
            "status": "OK",
            "reason": "Jakarta namespace is current standard",
            "needs_update": False,
            "update_severity": "OK",
            "code_changes_needed": False,
            "estimated_impact": "LOW"
        }
    
    # Default: no specific update found
    return {
        "library_key": artifact_id,
        "current_version": current_version,
        "target_version": None,
        "status": "OK",
        "reason": "No specific update recommendation",
        "needs_update": False,
        "update_severity": "OK",
        "code_changes_needed": False,
        "estimated_impact": "LOW"
    }


def get_java_version_update(current_java_version: str) -> dict:
    """Get Java version upgrade recommendation"""
    
    if current_java_version in JAVA_VERSION_RECOMMENDATIONS:
        rec = JAVA_VERSION_RECOMMENDATIONS[current_java_version]
        return {
            "current": current_java_version,
            "target": rec["target"],
            "severity": rec["severity"],
            "reason": rec["reason"],
            "needs_update": current_java_version != rec["target"]
        }
    
    return {
        "current": current_java_version,
        "target": "21",
        "severity": "MEDIUM",
        "reason": "Java 21 is the latest LTS version",
        "needs_update": current_java_version != "21"
    }


def summarize_dependency_issues(dependencies: list) -> dict:
    """Summarize all dependency update issues"""
    
    summary = {
        "total_dependencies": len(dependencies),
        "critical_issues": [],
        "high_issues": [],
        "medium_issues": [],
        "low_issues": [],
        "ok_dependencies": [],
        "estimated_migration_hours": 0,
        "total_severity_score": 0,
        "has_critical": False,
        "has_high": False
    }
    
    severity_scores = {
        "CRITICAL": 10,
        "HIGH": 5,
        "MEDIUM": 2,
        "LOW": 1,
        "OK": 0
    }
    
    for dep in dependencies:
        update_info = get_dependency_update(dep.get("artifact_id", ""), dep.get("current_version", ""))
        
        status = update_info.get("status", "OK")
        
        if status == "CRITICAL":
            summary["critical_issues"].append({
                "dependency": dep.get("artifact_id"),
                "current": dep.get("current_version"),
                "target": update_info.get("target_version"),
                "reason": update_info.get("reason"),
                "migration_guide": update_info.get("migration_guide")
            })
            summary["has_critical"] = True
            summary["estimated_migration_hours"] += 3
        elif status == "HIGH":
            summary["high_issues"].append({
                "dependency": dep.get("artifact_id"),
                "current": dep.get("current_version"),
                "target": update_info.get("target_version"),
                "reason": update_info.get("reason"),
                "migration_guide": update_info.get("migration_guide")
            })
            summary["has_high"] = True
            summary["estimated_migration_hours"] += 2
        elif status == "MEDIUM":
            summary["medium_issues"].append({
                "dependency": dep.get("artifact_id"),
                "current": dep.get("current_version"),
                "target": update_info.get("target_version"),
                "reason": update_info.get("reason")
            })
            summary["estimated_migration_hours"] += 1
        elif status == "LOW":
            summary["low_issues"].append({
                "dependency": dep.get("artifact_id"),
                "current": dep.get("current_version"),
                "target": update_info.get("target_version"),
                "reason": update_info.get("reason")
            })
            summary["estimated_migration_hours"] += 0.5
        else:
            summary["ok_dependencies"].append({
                "dependency": dep.get("artifact_id"),
                "current": dep.get("current_version")
            })
        
        summary["total_severity_score"] += severity_scores.get(status, 0)
    
    return summary
