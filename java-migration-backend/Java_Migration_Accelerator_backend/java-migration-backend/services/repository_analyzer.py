"""
Repository Analyzer Service
Analyzes Git repositories for:
- Maven and Gradle dependencies
- Business logic issues
- Testing coverage needs
- Code refactoring suggestions
"""
import os
import tempfile
import shutil
import re
import json
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import xml.etree.ElementTree as ET
import logging

logger = logging.getLogger(__name__)


class RepositoryAnalyzer:
    """Analyzes Java repositories for dependencies and code quality metrics"""
    
    def __init__(self):
        self.work_dir = os.getenv("WORK_DIR", os.path.join(tempfile.gettempdir(), "migrations"))
        os.makedirs(self.work_dir, exist_ok=True)
    
    async def analyze_repository(self, repo_path: str) -> Dict[str, Any]:
        """
        Perform comprehensive analysis on a cloned repository
        Returns: {
            'dependencies': {...},
            'business_logic_issues': [...],
            'testing_coverage': {...},
            'code_refactoring': {...},
            'summary': {...}
        }
        """
        try:
            analysis = {
                'dependencies': await self._analyze_dependencies(repo_path),
                'business_logic_issues': await self._analyze_business_logic(repo_path),
                'testing_coverage': await self._analyze_testing(repo_path),
                'code_refactoring': await self._analyze_code_refactoring(repo_path),
                'timestamp': str(Path(repo_path).stat().st_mtime)
            }
            
            # Generate summary
            analysis['summary'] = self._generate_summary(analysis)
            
            return analysis
        except Exception as e:
            logger.error(f"Repository analysis error: {e}")
            return {
                'error': str(e),
                'dependencies': {},
                'business_logic_issues': [],
                'testing_coverage': {},
                'code_refactoring': {}
            }
    
    async def _analyze_dependencies(self, repo_path: str) -> Dict[str, Any]:
        """Analyze Maven and Gradle dependencies"""
        dependencies_data = {
            'maven': await self._parse_maven_pom(repo_path),
            'gradle': await self._parse_gradle_build(repo_path),
            'total_dependencies': 0,
            'outdated_count': 0,
            'vulnerable_count': 0,
            'critical_issues': []
        }
        
        # Combine Maven and Gradle dependency counts
        maven_deps = len(dependencies_data['maven'].get('dependencies', []))
        gradle_deps = len(dependencies_data['gradle'].get('dependencies', []))
        dependencies_data['total_dependencies'] = maven_deps + gradle_deps
        
        # Analyze for outdated and vulnerable packages
        all_deps = dependencies_data['maven'].get('dependencies', []) + dependencies_data['gradle'].get('dependencies', [])
        for dep in all_deps:
            if dep.get('is_outdated'):
                dependencies_data['outdated_count'] += 1
            if dep.get('severity', 'LOW').upper() in ['CRITICAL', 'HIGH']:
                dependencies_data['vulnerable_count'] += 1
                dependencies_data['critical_issues'].append({
                    'artifact': f"{dep.get('group_id', '')}.{dep.get('artifact_id', '')}",
                    'version': dep.get('version', ''),
                    'severity': dep.get('severity', 'UNKNOWN'),
                    'issue': dep.get('issue', 'Security vulnerability detected')
                })
        
        return dependencies_data
    
    async def _parse_maven_pom(self, repo_path: str) -> Dict[str, Any]:
        """Parse Maven pom.xml file"""
        pom_data = {
            'found': False,
            'java_version': None,
            'dependencies': [],
            'build_plugins': [],
            'properties': {}
        }
        
        pom_files = list(Path(repo_path).rglob('pom.xml'))
        if not pom_files:
            return pom_data
        
        pom_path = pom_files[0]
        pom_data['found'] = True
        
        try:
            tree = ET.parse(pom_path)
            root = tree.getroot()
            
            # Define namespace
            ns = {'pom': 'http://maven.apache.org/POM/4.0.0'}
            
            # Extract Java version
            source_version = root.find('.//pom:source', ns)
            target_version = root.find('.//pom:target', ns)
            java_version = target_version.text if target_version is not None else source_version.text if source_version is not None else None
            
            if not java_version:
                properties = root.find('.//pom:properties', ns)
                if properties is not None:
                    for prop in properties:
                        tag_name = prop.tag.split('}')[-1]
                        if 'java' in tag_name.lower() or 'version' in tag_name.lower():
                            java_version = prop.text
                            break
            
            pom_data['java_version'] = java_version
            
            # Extract dependencies
            dependencies = root.findall('.//pom:dependency', ns)
            for dep in dependencies:
                group_id = dep.find('pom:groupId', ns)
                artifact_id = dep.find('pom:artifactId', ns)
                version = dep.find('pom:version', ns)
                scope = dep.find('pom:scope', ns)
                
                dep_info = {
                    'group_id': group_id.text if group_id is not None else '',
                    'artifact_id': artifact_id.text if artifact_id is not None else '',
                    'version': version.text if version is not None else 'UNKNOWN',
                    'scope': scope.text if scope is not None else 'compile',
                    'type': 'maven',
                    'is_outdated': self._is_outdated_maven_dependency(
                        group_id.text if group_id is not None else '',
                        artifact_id.text if artifact_id is not None else '',
                        version.text if version is not None else ''
                    ),
                    'severity': self._get_maven_dependency_severity(
                        artifact_id.text if artifact_id is not None else ''
                    ),
                    'issue': self._get_dependency_issue(
                        artifact_id.text if artifact_id is not None else ''
                    )
                }
                pom_data['dependencies'].append(dep_info)
            
            # Extract build plugins
            plugins = root.findall('.//pom:plugin', ns)
            for plugin in plugins:
                group_id = plugin.find('pom:groupId', ns)
                artifact_id = plugin.find('pom:artifactId', ns)
                version = plugin.find('pom:version', ns)
                
                plugin_info = {
                    'group_id': group_id.text if group_id is not None else '',
                    'artifact_id': artifact_id.text if artifact_id is not None else '',
                    'version': version.text if version is not None else 'UNKNOWN'
                }
                pom_data['build_plugins'].append(plugin_info)
            
        except Exception as e:
            logger.error(f"Error parsing pom.xml: {e}")
        
        return pom_data
    
    async def _parse_gradle_build(self, repo_path: str) -> Dict[str, Any]:
        """Parse Gradle build.gradle file"""
        gradle_data = {
            'found': False,
            'java_version': None,
            'dependencies': [],
            'plugins': []
        }
        
        gradle_files = list(Path(repo_path).rglob('build.gradle'))
        if not gradle_files:
            return gradle_data
        
        gradle_path = gradle_files[0]
        gradle_data['found'] = True
        
        try:
            with open(gradle_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Extract Java version from sourceCompatibility or targetCompatibility
            java_match = re.search(r'(?:sourceCompatibility|targetCompatibility)\s*=\s*["\']?([0-9.]+)["\']?', content)
            if java_match:
                gradle_data['java_version'] = java_match.group(1)
            
            # Extract dependencies
            dep_pattern = r'(?:implementation|api|testImplementation|testApi|compileOnly|runtimeOnly)\s+["\']([^"\']+)["\']'
            matches = re.findall(dep_pattern, content)
            
            for match in matches:
                parts = match.split(':')
                if len(parts) >= 3:
                    dep_info = {
                        'group_id': parts[0],
                        'artifact_id': parts[1],
                        'version': parts[2] if len(parts) > 2 else 'UNKNOWN',
                        'type': 'gradle',
                        'is_outdated': self._is_outdated_gradle_dependency(
                            parts[0], parts[1], parts[2] if len(parts) > 2 else ''
                        ),
                        'severity': self._get_gradle_dependency_severity(parts[1]),
                        'issue': self._get_dependency_issue(parts[1])
                    }
                    gradle_data['dependencies'].append(dep_info)
            
            # Extract plugins
            plugin_pattern = r"id\s+['\"]([^'\"]+)['\"]"
            plugin_matches = re.findall(plugin_pattern, content)
            gradle_data['plugins'] = plugin_matches
            
        except Exception as e:
            logger.error(f"Error parsing build.gradle: {e}")
        
        return gradle_data
    
    async def _analyze_business_logic(self, repo_path: str) -> List[Dict[str, Any]]:
        """Analyze business logic issues in Java files"""
        issues = []
        
        java_files = list(Path(repo_path).rglob('*.java'))[:50]  # Limit to first 50 files
        
        business_logic_patterns = {
            'null_checks': {
                'pattern': r'if\s*\(\s*\w+\s*==\s*null\s*\)',
                'severity': 'MEDIUM',
                'suggestion': 'Use Objects.requireNonNull() or Optional for null safety'
            },
            'string_comparison': {
                'pattern': r'(\w+)\s*==\s*"([^"]+)"',
                'severity': 'HIGH',
                'suggestion': 'Use .equals() or .equalsIgnoreCase() instead of == for string comparison'
            },
            'try_catch_all': {
                'pattern': r'catch\s*\(\s*Exception\s+\w+\s*\)',
                'severity': 'HIGH',
                'suggestion': 'Catch specific exceptions instead of generic Exception'
            },
            'hardcoded_values': {
                'pattern': r'(?:private|public|protected)?\s+(?:static)?\s+(?:final)?\s+(?:String|int|long|double)\s+\w+\s*=\s*["\']?[A-Z0-9_]+["\']?;',
                'severity': 'MEDIUM',
                'suggestion': 'Move hardcoded values to configuration files or constants'
            },
            'missing_serialversionuid': {
                'pattern': r'class\s+\w+\s+implements\s+Serializable',
                'severity': 'LOW',
                'suggestion': 'Add serialVersionUID to Serializable classes'
            },
            'empty_catch': {
                'pattern': r'catch\s*\([^)]+\)\s*\{\s*\}',
                'severity': 'HIGH',
                'suggestion': 'Never use empty catch blocks. Log or handle the exception'
            }
        }
        
        for java_file in java_files:
            try:
                with open(java_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                file_path = str(java_file).replace(repo_path, '')
                
                for issue_type, pattern_info in business_logic_patterns.items():
                    matches = re.finditer(pattern_info['pattern'], content)
                    for match in matches:
                        line_num = content[:match.start()].count('\n') + 1
                        issues.append({
                            'type': issue_type,
                            'file': file_path,
                            'line': line_num,
                            'severity': pattern_info['severity'],
                            'match': match.group(0)[:100],
                            'suggestion': pattern_info['suggestion'],
                            'category': 'business_logic'
                        })
            
            except Exception as e:
                logger.debug(f"Error analyzing file {java_file}: {e}")
        
        # Limit to top 20 issues
        return sorted(issues, key=lambda x: {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}.get(x['severity'], 3))[:20]
    
    async def _analyze_testing(self, repo_path: str) -> Dict[str, Any]:
        """Analyze testing coverage and test files"""
        test_data = {
            'test_files_found': 0,
            'test_frameworks': [],
            'coverage_percentage': 0,
            'issues': []
        }
        
        # Find test files
        test_patterns = ['*Test.java', 'Test*.java', '*Tests.java', '*TestCase.java']
        test_files = []
        for pattern in test_patterns:
            test_files.extend(Path(repo_path).rglob(pattern))
        
        test_data['test_files_found'] = len(set(test_files))
        
        # Detect test frameworks
        frameworks = set()
        junit_pattern = r'import\s+org\.junit'
        testng_pattern = r'import\s+org\.testng'
        mockito_pattern = r'import\s+org\.mockito'
        
        for test_file in set(test_files)[:20]:
            try:
                with open(test_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if re.search(junit_pattern, content):
                        frameworks.add('JUnit')
                    if re.search(testng_pattern, content):
                        frameworks.add('TestNG')
                    if re.search(mockito_pattern, content):
                        frameworks.add('Mockito')
            except Exception as e:
                logger.debug(f"Error analyzing test file: {e}")
        
        test_data['test_frameworks'] = list(frameworks)
        
        # Estimate coverage
        java_files = list(Path(repo_path).rglob('*.java'))
        total_java = len(java_files)
        if total_java > 0:
            test_data['coverage_percentage'] = min(100, int((test_data['test_files_found'] / max(1, total_java)) * 100))
        
        # Generate recommendations
        if test_data['test_files_found'] == 0:
            test_data['issues'].append({
                'severity': 'CRITICAL',
                'issue': 'No test files found',
                'suggestion': 'Add unit tests using JUnit 5 for all public methods'
            })
        elif test_data['coverage_percentage'] < 50:
            test_data['issues'].append({
                'severity': 'HIGH',
                'issue': f'Low test coverage: {test_data["coverage_percentage"]}%',
                'suggestion': 'Increase test coverage to at least 80%'
            })
        elif test_data['coverage_percentage'] < 80:
            test_data['issues'].append({
                'severity': 'MEDIUM',
                'issue': f'Test coverage could be improved: {test_data["coverage_percentage"]}%',
                'suggestion': 'Aim for at least 80% code coverage'
            })
        
        if not frameworks:
            test_data['issues'].append({
                'severity': 'HIGH',
                'issue': 'No test framework detected',
                'suggestion': 'Consider using JUnit 5 (latest) or TestNG for testing'
            })
        
        return test_data
    
    async def _analyze_code_refactoring(self, repo_path: str) -> Dict[str, Any]:
        """Analyze code refactoring opportunities"""
        refactoring_data = {
            'total_java_files': 0,
            'issues': []
        }
        
        java_files = list(Path(repo_path).rglob('*.java'))[:100]
        refactoring_data['total_java_files'] = len(java_files)
        
        refactoring_patterns = {
            'long_methods': {
                'pattern': lambda content: len(content.split('\n')) > 100,
                'severity': 'MEDIUM',
                'suggestion': 'Break down long methods into smaller, focused methods'
            },
            'god_classes': {
                'pattern': lambda content: content.count('public ') > 30,
                'severity': 'HIGH',
                'suggestion': 'Split God classes into smaller, single-responsibility classes'
            },
            'duplicate_code': {
                'pattern': lambda content: content.count('for (') >= 3,
                'severity': 'MEDIUM',
                'suggestion': 'Extract common patterns into utility methods'
            },
            'deprecated_apis': {
                'pattern': r'@Deprecated',
                'severity': 'LOW',
                'suggestion': 'Update deprecated API usage to modern alternatives'
            }
        }
        
        for java_file in java_files:
            try:
                with open(java_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                file_path = str(java_file).replace(repo_path, '')
                
                # Check for deprecated APIs
                if re.search(refactoring_patterns['deprecated_apis']['pattern'], content):
                    refactoring_data['issues'].append({
                        'file': file_path,
                        'type': 'deprecated_apis',
                        'severity': refactoring_patterns['deprecated_apis']['severity'],
                        'suggestion': refactoring_patterns['deprecated_apis']['suggestion']
                    })
                
                # Check for long methods
                methods = re.findall(r'(?:public|private|protected)\s+(?:static)?\s+\w+\s+\w+\s*\([^)]*\)\s*\{[^}]+\}', content, re.DOTALL)
                for method in methods:
                    if len(method.split('\n')) > 50:
                        refactoring_data['issues'].append({
                            'file': file_path,
                            'type': 'long_methods',
                            'severity': refactoring_patterns['long_methods']['severity'],
                            'suggestion': refactoring_patterns['long_methods']['suggestion']
                        })
                        break
                
                # Check for God classes
                public_methods = len(re.findall(r'public\s+(?:static)?\s+\w+\s+\w+\s*\(', content))
                if public_methods > 20:
                    refactoring_data['issues'].append({
                        'file': file_path,
                        'type': 'god_classes',
                        'severity': refactoring_patterns['god_classes']['severity'],
                        'suggestion': refactoring_patterns['god_classes']['suggestion'],
                        'details': f'{public_methods} public methods detected'
                    })
            
            except Exception as e:
                logger.debug(f"Error analyzing refactoring in {java_file}: {e}")
        
        return refactoring_data
    
    def _generate_summary(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a summary of the analysis"""
        deps = analysis['dependencies']
        business_logic = analysis['business_logic_issues']
        testing = analysis['testing_coverage']
        refactoring = analysis['code_refactoring']
        
        summary = {
            'total_dependencies': deps.get('total_dependencies', 0),
            'outdated_dependencies': deps.get('outdated_count', 0),
            'vulnerable_dependencies': deps.get('vulnerable_count', 0),
            'critical_dependency_issues': len(deps.get('critical_issues', [])),
            'business_logic_issues': len(business_logic),
            'high_priority_business_logic': len([i for i in business_logic if i.get('severity') == 'HIGH']),
            'test_coverage_percentage': testing.get('coverage_percentage', 0),
            'test_files': testing.get('test_files_found', 0),
            'test_frameworks': testing.get('test_frameworks', []),
            'testing_issues': len(testing.get('issues', [])),
            'java_files': refactoring.get('total_java_files', 0),
            'refactoring_opportunities': len(refactoring.get('issues', [])),
            'overall_health_score': self._calculate_health_score(deps, business_logic, testing, refactoring)
        }
        
        return summary
    
    def _calculate_health_score(self, deps: Dict, business_logic: List, testing: Dict, refactoring: Dict) -> int:
        """Calculate overall repository health score (0-100)"""
        score = 100
        
        # Deduct for dependencies
        if deps.get('vulnerable_count', 0) > 0:
            score -= min(20, deps['vulnerable_count'] * 5)
        if deps.get('outdated_count', 0) > 5:
            score -= 10
        
        # Deduct for business logic issues
        high_severity = len([i for i in business_logic if i.get('severity') == 'HIGH'])
        score -= min(20, high_severity * 3)
        
        # Deduct for testing
        test_cov = testing.get('coverage_percentage', 0)
        if test_cov < 50:
            score -= 20
        elif test_cov < 80:
            score -= 10
        
        # Deduct for refactoring needs
        refactoring_issues = len(refactoring.get('issues', []))
        score -= min(10, refactoring_issues)
        
        return max(0, score)
    
    def _is_outdated_maven_dependency(self, group_id: str, artifact_id: str, version: str) -> bool:
        """Check if Maven dependency is outdated"""
        # This is a simplified check - in production, use Maven Central API
        outdated_versions = {
            'junit:junit': '3.8.2',  # Old JUnit 3
            'log4j:log4j': '1.2.17',
            'javax.servlet:servlet-api': '2.5',
            'org.springframework:spring-core': '4.0.0'
        }
        
        key = f"{group_id}:{artifact_id}"
        if key in outdated_versions:
            return self._compare_versions(version, outdated_versions[key]) <= 0
        return False
    
    def _is_outdated_gradle_dependency(self, group_id: str, artifact_id: str, version: str) -> bool:
        """Check if Gradle dependency is outdated"""
        return self._is_outdated_maven_dependency(group_id, artifact_id, version)
    
    def _get_maven_dependency_severity(self, artifact_id: str) -> str:
        """Get security severity for Maven dependency"""
        vulnerable_artifacts = {
            'log4j-core': 'CRITICAL',
            'commons-fileupload': 'HIGH',
            'commons-beanutils': 'HIGH',
            'log4j': 'CRITICAL',
            'struts': 'CRITICAL'
        }
        return vulnerable_artifacts.get(artifact_id, 'LOW')
    
    def _get_gradle_dependency_severity(self, artifact_id: str) -> str:
        """Get security severity for Gradle dependency"""
        return self._get_maven_dependency_severity(artifact_id)
    
    def _get_dependency_issue(self, artifact_id: str) -> str:
        """Get description of known issue"""
        known_issues = {
            'log4j': 'CVE-2021-44228 Remote Code Execution vulnerability',
            'commons-fileupload': 'Arbitrary file upload vulnerability',
            'struts': 'Remote code execution vulnerability',
            'commons-beanutils': 'Arbitrary code execution via property manipulation'
        }
        return known_issues.get(artifact_id, 'Potential security issue detected')
    
    def _compare_versions(self, v1: str, v2: str) -> int:
        """Compare two version strings. Returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2"""
        try:
            v1_parts = [int(x) for x in v1.split('.')[:3]]
            v2_parts = [int(x) for x in v2.split('.')[:3]]
            
            while len(v1_parts) < 3:
                v1_parts.append(0)
            while len(v2_parts) < 3:
                v2_parts.append(0)
            
            for i in range(3):
                if v1_parts[i] < v2_parts[i]:
                    return -1
                elif v1_parts[i] > v2_parts[i]:
                    return 1
            return 0
        except:
            return 0
