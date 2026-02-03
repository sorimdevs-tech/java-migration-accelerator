#!/usr/bin/env python3
"""
Dependency Analyzer for Java Projects
Analyzes pom.xml files and generates dependency upgrade recommendations
"""

import xml.etree.ElementTree as ET
import json
from typing import Dict, List, Tuple
from pathlib import Path
from datetime import datetime

# Define dependency upgrade paths
DEPENDENCY_UPGRADES = {
    "junit:junit": {
        "current": "4.13.2",
        "latest": "5.10.1",
        "new_groupid": "org.junit.jupiter",
        "new_artifactid": "junit-jupiter",
        "breaking_changes": ["@Test", "@Before", "@After", "@BeforeClass", "@AfterClass"],
        "severity": "HIGH",
        "reason": "JUnit 4 is legacy; JUnit 5 (Jupiter) is the current standard"
    },
    "log4j:log4j": {
        "current": "1.2.17",
        "latest": "DEPRECATED",
        "replacement": "org.slf4j:slf4j-api + ch.qos.logback:logback-classic",
        "severity": "CRITICAL",
        "reason": "log4j 1.x is EOL since 2015; security vulnerabilities not being patched"
    },
    "javax.servlet:javax.servlet-api": {
        "current": "4.0.1",
        "latest": "jakarta.servlet:jakarta.servlet-api:6.1.0",
        "namespace_change": "javax.servlet → jakarta.servlet",
        "severity": "HIGH",
        "reason": "Jakarta EE replaces javax namespace; required for Spring Boot 3+"
    },
    "javax.persistence:javax.persistence-api": {
        "current": "2.2",
        "latest": "jakarta.persistence:jakarta.persistence-api:3.1.0",
        "namespace_change": "javax.persistence → jakarta.persistence",
        "severity": "HIGH",
        "reason": "Jakarta EE replaces javax namespace; required for Spring Boot 3+"
    },
    "org.springframework.boot:spring-boot-starter-web": {
        "current": "2.7.0",
        "latest": "3.3.0",
        "severity": "HIGH",
        "reason": "Spring Boot 2.7.x EOL soon; 3.x requires Jakarta EE and Java 17+"
    },
    "org.springframework.boot:spring-boot-starter-data-jpa": {
        "current": "2.7.0",
        "latest": "3.3.0",
        "severity": "HIGH",
        "reason": "Spring Boot 2.7.x EOL soon; 3.x requires Jakarta EE and Java 17+"
    }
}

class PomAnalyzer:
    """Analyze Maven pom.xml files for dependency information"""
    
    def __init__(self, pom_path: str):
        self.pom_path = Path(pom_path)
        self.dependencies = []
        self.outdated = []
        self.deprecated = []
        self.java_version = None
        
    def parse_pom(self) -> bool:
        """Parse the pom.xml file and extract dependencies"""
        try:
            tree = ET.parse(self.pom_path)
            root = tree.getroot()
            
            # Define namespace
            ns = {'pom': 'http://maven.apache.org/POM/4.0.0'}
            
            # Extract Java version
            for prop in root.findall('.//pom:properties/pom:maven.compiler.source', ns):
                self.java_version = prop.text
            
            # Extract dependencies
            for dep in root.findall('.//pom:dependency', ns):
                group_id = dep.find('pom:groupId', ns)
                artifact_id = dep.find('pom:artifactId', ns)
                version = dep.find('pom:version', ns)
                scope = dep.find('pom:scope', ns)
                
                if group_id is not None and artifact_id is not None:
                    dep_key = f"{group_id.text}:{artifact_id.text}"
                    dep_info = {
                        "groupId": group_id.text,
                        "artifactId": artifact_id.text,
                        "version": version.text if version is not None else "unknown",
                        "scope": scope.text if scope is not None else "compile",
                        "key": dep_key
                    }
                    
                    self.dependencies.append(dep_info)
                    
                    # Check if outdated or deprecated
                    if dep_key in DEPENDENCY_UPGRADES:
                        upgrade_info = DEPENDENCY_UPGRADES[dep_key].copy()
                        upgrade_info.update(dep_info)
                        
                        if upgrade_info["severity"] == "CRITICAL":
                            self.deprecated.append(upgrade_info)
                        else:
                            self.outdated.append(upgrade_info)
            
            return True
        except Exception as e:
            print(f"Error parsing pom.xml: {e}")
            return False
    
    def generate_report(self) -> Dict:
        """Generate a comprehensive dependency analysis report"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "pom_file": str(self.pom_path),
            "java_version": self.java_version,
            "summary": {
                "total_dependencies": len(self.dependencies),
                "production_dependencies": sum(1 for d in self.dependencies if d["scope"] == "compile"),
                "test_dependencies": sum(1 for d in self.dependencies if d["scope"] == "test"),
                "outdated_count": len(self.outdated),
                "deprecated_count": len(self.deprecated),
                "requires_update": len(self.outdated) + len(self.deprecated)
            },
            "dependencies": self.dependencies,
            "outdated": self.outdated,
            "deprecated": self.deprecated
        }
        return report
    
    def print_report(self):
        """Print a human-readable report"""
        report = self.generate_report()
        
        print("\n" + "="*70)
        print("JAVA PROJECT DEPENDENCY ANALYSIS REPORT")
        print("="*70)
        print(f"Generated: {report['timestamp']}")
        print(f"POM File: {report['pom_file']}")
        print(f"Current Java Version: {report['java_version'] or 'Not specified'}")
        print("="*70)
        
        print(f"\n📊 SUMMARY")
        print(f"  • Total Dependencies: {report['summary']['total_dependencies']}")
        print(f"  • Production: {report['summary']['production_dependencies']}")
        print(f"  • Test: {report['summary']['test_dependencies']}")
        print(f"  • Outdated: {report['summary']['outdated_count']}")
        print(f"  • Deprecated: {report['summary']['deprecated_count']}")
        print(f"  • Requires Update: {report['summary']['requires_update']}")
        
        print(f"\n📦 ALL DEPENDENCIES ({len(self.dependencies)} total)")
        print("-" * 70)
        for dep in sorted(self.dependencies, key=lambda x: x['key']):
            scope_indicator = "📝" if dep["scope"] == "test" else "📌"
            status = "✅" if dep['key'] not in [d['key'] for d in self.outdated + self.deprecated] else "⚠️"
            print(f"{scope_indicator} {status} {dep['key']}")
            print(f"   Version: {dep['version']} | Scope: {dep['scope']}")
        
        if self.deprecated:
            print(f"\n🔴 DEPRECATED DEPENDENCIES ({len(self.deprecated)} critical)")
            print("-" * 70)
            for dep in self.deprecated:
                print(f"❌ {dep['key']} (v{dep['version']})")
                print(f"   Reason: {dep['reason']}")
                print(f"   Severity: {dep['severity']}")
                if 'replacement' in dep:
                    print(f"   Action: REMOVE - Use {dep['replacement']}")
                elif 'latest' in dep and dep['latest'] != "DEPRECATED":
                    print(f"   Update to: {dep['latest']}")
                if 'namespace_change' in dep:
                    print(f"   Migration: {dep['namespace_change']}")
                print()
        
        if self.outdated:
            print(f"\n🟠 OUTDATED DEPENDENCIES ({len(self.outdated)} recommend update)")
            print("-" * 70)
            for dep in self.outdated:
                print(f"⚠️  {dep['key']}")
                print(f"   Current: v{dep['version']} → Latest: v{dep['latest']}")
                print(f"   Reason: {dep['reason']}")
                if 'breaking_changes' in dep:
                    print(f"   Breaking Changes: {', '.join(dep['breaking_changes'])}")
                if 'namespace_change' in dep:
                    print(f"   Migration: {dep['namespace_change']}")
                print()
        
        print("\n" + "="*70)
        print("MIGRATION RECOMMENDATIONS")
        print("="*70)
        
        if len(self.deprecated) > 0:
            print("\n1. CRITICAL (Do First):")
            for dep in self.deprecated:
                if dep['key'] == "log4j:log4j":
                    print("   • REMOVE log4j 1.2.17 - Use SLF4J instead")
                elif "javax" in dep['key']:
                    print(f"   • Migrate {dep['key']} to Jakarta EE namespace")
        
        print("\n2. HIGH PRIORITY:")
        for dep in self.outdated:
            print(f"   • Update {dep['groupId']}:{dep['artifactId']} to v{dep['latest']}")
        
        if self.java_version and int(self.java_version) < 21:
            print(f"\n3. JAVA VERSION:")
            print(f"   • Current Java: {self.java_version}")
            print(f"   • Recommended: Java 21 (latest LTS)")
            print(f"   • Action: Update maven.compiler.source and maven.compiler.target to 21")
        
        print("\n" + "="*70)


def main():
    """Main entry point"""
    pom_file = Path("test-java-project/pom.xml")
    
    if not pom_file.exists():
        print(f"Error: pom.xml not found at {pom_file}")
        return
    
    analyzer = PomAnalyzer(str(pom_file))
    
    if analyzer.parse_pom():
        analyzer.print_report()
        
        # Generate JSON report
        report = analyzer.generate_report()
        with open("dependency_analysis.json", "w") as f:
            json.dump(report, f, indent=2)
        print(f"\n💾 JSON Report saved to: dependency_analysis.json")
    else:
        print("Failed to parse pom.xml")


if __name__ == "__main__":
    main()
