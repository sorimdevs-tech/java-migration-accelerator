import React from "react";
import type { RepoAnalysis, DependencyInfo } from "../services/api";

interface PreMigrationSummaryProps {
  repoAnalysis: RepoAnalysis;
  selectedSourceVersion: string;
  selectedTargetVersion: string;
  runTests: boolean;
  runSonar: boolean;
  runFossa: boolean;
  fixBusinessLogic: boolean;
  fossaResult?: any;
  fossaLoading: boolean;
}

export default function PreMigrationSummary({ 
  repoAnalysis, 
  selectedSourceVersion, 
  selectedTargetVersion, 
  runTests, 
  runSonar, 
  runFossa, 
  fixBusinessLogic,
  fossaResult,
  fossaLoading
}: PreMigrationSummaryProps) {
  
  // Calculate dependency statistics
  const totalDependencies = repoAnalysis.dependencies.length;
  const outdatedDependencies = repoAnalysis.dependencies.filter(dep => dep.status === "outdated" || dep.status === "needs_upgrade").length;
  const upgradableDependencies = repoAnalysis.dependencies.filter(dep => dep.new_version && dep.new_version !== dep.current_version).length;
  
  // Calculate risk level based on analysis
  const calculateRiskLevel = () => {
    let riskScore = 0;
    
    // Build tool risk
    if (!repoAnalysis.build_tool) riskScore += 2;
    else if (repoAnalysis.build_tool === "maven" || repoAnalysis.build_tool === "gradle") riskScore += 0;
    else riskScore += 1;
    
    // Java version risk
    if (!repoAnalysis.java_version) riskScore += 3;
    else if (parseInt(repoAnalysis.java_version) < 8) riskScore += 3;
    else if (parseInt(repoAnalysis.java_version) < 11) riskScore += 2;
    else riskScore += 1;
    
    // Dependency risk
    if (outdatedDependencies > totalDependencies * 0.5) riskScore += 3;
    else if (outdatedDependencies > totalDependencies * 0.3) riskScore += 2;
    else if (outdatedDependencies > 0) riskScore += 1;
    
    // Test coverage risk
    if (!repoAnalysis.has_tests) riskScore += 2;
    
    // Structure risk
    if (!repoAnalysis.structure.has_pom_xml && !repoAnalysis.structure.has_build_gradle) riskScore += 3;
    if (!repoAnalysis.structure.has_src_main) riskScore += 2;
    if (!repoAnalysis.structure.has_src_test) riskScore += 1;
    
    if (riskScore >= 8) return "high";
    if (riskScore >= 5) return "medium";
    return "low";
  };
  
  const riskLevel = calculateRiskLevel();
  
  // Determine if a dependency needs attention
  const isDependencyOutdated = (dep: DependencyInfo) => {
    return dep.status === "outdated" || dep.status === "needs_upgrade" || (dep.new_version && dep.new_version !== dep.current_version);
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Pre-Migration Summary</h1>
          <p style={styles.subtitle}>Comprehensive analysis of your project before migration</p>
        </div>
        <div style={{
          ...styles.riskBadge,
          backgroundColor: riskLevel === "low" ? "#dcfce7" : riskLevel === "medium" ? "#fef3c7" : "#fee2e2",
          color: riskLevel === "low" ? "#166534" : riskLevel === "medium" ? "#92400e" : "#991b1b"
        }}>
          Risk Level: {riskLevel.toUpperCase()}
        </div>
      </div>

      {/* Project Overview */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏗️ Project Overview</h2>
        <div style={styles.overviewGrid}>
          <div style={styles.overviewCard}>
            <div style={styles.overviewIcon}>☕</div>
            <div style={styles.overviewContent}>
              <div style={styles.overviewLabel}>Java Version</div>
              <div style={styles.overviewValue}>
                <span style={{ color: "#64748b" }}>From: Java {selectedSourceVersion}</span>
                <span style={styles.arrow}>→</span>
                <span style={{ color: "#2563eb" }}>To: Java {selectedTargetVersion}</span>
              </div>
            </div>
          </div>
          
          <div style={styles.overviewCard}>
            <div style={styles.overviewIcon}>🔧</div>
            <div style={styles.overviewContent}>
              <div style={styles.overviewLabel}>Build Tool</div>
              <div style={styles.overviewValue}>
                {repoAnalysis.build_tool || "Not Detected"}
              </div>
            </div>
          </div>
          
          <div style={styles.overviewCard}>
            <div style={styles.overviewIcon}>📦</div>
            <div style={styles.overviewContent}>
              <div style={styles.overviewLabel}>Total Dependencies</div>
              <div style={styles.overviewValue}>{totalDependencies}</div>
            </div>
          </div>
          
          <div style={styles.overviewCard}>
            <div style={styles.overviewIcon}>⚠️</div>
            <div style={styles.overviewContent}>
              <div style={styles.overviewLabel}>Outdated Dependencies</div>
              <div style={{
                ...styles.overviewValue,
                color: outdatedDependencies > 0 ? "#ef4444" : "#22c55e"
              }}>
                {outdatedDependencies}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structure Analysis */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📂 Project Structure</h2>
        <div style={styles.structureGrid}>
          <div style={{
            ...styles.structureItem,
            backgroundColor: repoAnalysis.structure.has_pom_xml ? "#dcfce7" : "#fee2e2",
            borderColor: repoAnalysis.structure.has_pom_xml ? "#86efac" : "#fecaca"
          }}>
            <span style={repoAnalysis.structure.has_pom_xml ? styles.checkmark : styles.cross}>
              {repoAnalysis.structure.has_pom_xml ? "✓" : "✗"}
            </span>
            <div>
              <div style={styles.structureTitle}>pom.xml</div>
              <div style={styles.structureDesc}>Maven configuration</div>
            </div>
          </div>
          
          <div style={{
            ...styles.structureItem,
            backgroundColor: repoAnalysis.structure.has_build_gradle ? "#dcfce7" : "#fee2e2",
            borderColor: repoAnalysis.structure.has_build_gradle ? "#86efac" : "#fecaca"
          }}>
            <span style={repoAnalysis.structure.has_build_gradle ? styles.checkmark : styles.cross}>
              {repoAnalysis.structure.has_build_gradle ? "✓" : "✗"}
            </span>
            <div>
              <div style={styles.structureTitle}>build.gradle</div>
              <div style={styles.structureDesc}>Gradle configuration</div>
            </div>
          </div>
          
          <div style={{
            ...styles.structureItem,
            backgroundColor: repoAnalysis.structure.has_src_main ? "#dcfce7" : "#fee2e2",
            borderColor: repoAnalysis.structure.has_src_main ? "#86efac" : "#fecaca"
          }}>
            <span style={repoAnalysis.structure.has_src_main ? styles.checkmark : styles.cross}>
              {repoAnalysis.structure.has_src_main ? "✓" : "✗"}
            </span>
            <div>
              <div style={styles.structureTitle}>src/main</div>
              <div style={styles.structureDesc}>Main source directory</div>
            </div>
          </div>
          
          <div style={{
            ...styles.structureItem,
            backgroundColor: repoAnalysis.structure.has_src_test ? "#dcfce7" : "#fee2e2",
            borderColor: repoAnalysis.structure.has_src_test ? "#86efac" : "#fecaca"
          }}>
            <span style={repoAnalysis.structure.has_src_test ? styles.checkmark : styles.cross}>
              {repoAnalysis.structure.has_src_test ? "✓" : "✗"}
            </span>
            <div>
              <div style={styles.structureTitle}>src/test</div>
              <div style={styles.structureDesc}>Test source directory</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dependencies Analysis */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📦 Dependencies Analysis</h2>
        
        <div style={styles.dependencyStats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalDependencies}</div>
            <div style={styles.statLabel}>Total Dependencies</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: "#ef4444" }}>{outdatedDependencies}</div>
            <div style={styles.statLabel}>Outdated</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: "#f59e0b" }}>{upgradableDependencies}</div>
            <div style={styles.statLabel}>Upgradable</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: "#22c55e" }}>
              {totalDependencies - outdatedDependencies}
            </div>
            <div style={styles.statLabel}>Current</div>
          </div>
        </div>

        {/* Dependency List */}
        <div style={styles.dependencyListContainer}>
          <div style={styles.dependencyListHeader}>
            <div style={{ ...styles.dependencyCell, flex: 3 }}>Dependency</div>
            <div style={{ ...styles.dependencyCell, flex: 1 }}>Current Version</div>
            <div style={{ ...styles.dependencyCell, flex: 1 }}>Target Version</div>
            <div style={{ ...styles.dependencyCell, flex: 1 }}>Status</div>
          </div>
          
          {repoAnalysis.dependencies.slice(0, 15).map((dep, index) => (
            <div key={index} style={styles.dependencyRow}>
              <div style={{ ...styles.dependencyCell, flex: 3, fontWeight: 600 }}>
                {dep.group_id}:{dep.artifact_id}
              </div>
              <div style={{ ...styles.dependencyCell, flex: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                {dep.current_version}
              </div>
              <div style={{ ...styles.dependencyCell, flex: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                {dep.new_version || "N/A"}
              </div>
              <div style={{ ...styles.dependencyCell, flex: 1 }}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: isDependencyOutdated(dep) ? "#fee2e2" : "#dcfce7",
                  color: isDependencyOutdated(dep) ? "#991b1b" : "#166534"
                }}>
                  {isDependencyOutdated(dep) ? "OUTDATED" : "CURRENT"}
                </span>
              </div>
            </div>
          ))}
          
          {repoAnalysis.dependencies.length > 15 && (
            <div style={styles.moreDependencies}>
              +{repoAnalysis.dependencies.length - 15} more dependencies...
            </div>
          )}
        </div>
      </div>

      {/* Migration Configuration */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⚙️ Migration Configuration</h2>
        <div style={styles.configGrid}>
          <div style={styles.configCard}>
            <div style={styles.configIcon}>🧪</div>
            <div style={styles.configContent}>
              <div style={styles.configTitle}>Run Tests</div>
              <div style={{
                ...styles.configValue,
                color: runTests ? "#22c55e" : "#64748b"
              }}>
                {runTests ? "Enabled" : "Disabled"}
              </div>
              <div style={styles.configDesc}>
                Execute test suite after migration
              </div>
            </div>
          </div>
          
          <div style={styles.configCard}>
            <div style={styles.configIcon}>🔍</div>
            <div style={styles.configContent}>
              <div style={styles.configTitle}>SonarQube Analysis</div>
              <div style={{
                ...styles.configValue,
                color: runSonar ? "#22c55e" : "#64748b"
              }}>
                {runSonar ? "Enabled" : "Disabled"}
              </div>
              <div style={styles.configDesc}>
                Run code quality and security analysis
              </div>
            </div>
          </div>
          
          <div style={styles.configCard}>
            <div style={styles.configIcon}>📜</div>
            <div style={styles.configContent}>
              <div style={styles.configTitle}>FOSSA License Scan</div>
              <div style={{
                ...styles.configValue,
                color: runFossa ? "#22c55e" : "#64748b"
              }}>
                {runFossa ? "Enabled" : "Disabled"}
              </div>
              <div style={styles.configDesc}>
                Check open-source license compliance
              </div>
            </div>
          </div>
          
          <div style={styles.configCard}>
            <div style={styles.configIcon}>🛠️</div>
            <div style={styles.configContent}>
              <div style={styles.configTitle}>Fix Business Logic</div>
              <div style={{
                ...styles.configValue,
                color: fixBusinessLogic ? "#22c55e" : "#64748b"
              }}>
                {fixBusinessLogic ? "Enabled" : "Disabled"}
              </div>
              <div style={styles.configDesc}>
                Automatically fix common issues
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOSSA Analysis (if enabled and available) */}
      {runFossa && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📜 FOSSA License & Security Scan</h2>
          {fossaLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <span>Scanning dependencies for license and security issues...</span>
            </div>
          ) : fossaResult ? (
            <div style={styles.fossaGrid}>
              <div style={styles.fossaCard}>
                <div style={styles.fossaValue}>{fossaResult.total_dependencies || 0}</div>
                <div style={styles.fossaLabel}>Total Dependencies</div>
              </div>
              
              <div style={styles.fossaCard}>
                <div style={{
                  ...styles.fossaValue,
                  color: (fossaResult.license_issues || 0) > 0 ? "#ef4444" : "#22c55e"
                }}>
                  {fossaResult.license_issues || 0}
                </div>
                <div style={styles.fossaLabel}>License Issues</div>
              </div>
              
              <div style={styles.fossaCard}>
                <div style={{
                  ...styles.fossaValue,
                  color: (fossaResult.vulnerabilities || 0) > 0 ? "#ef4444" : "#22c55e"
                }}>
                  {typeof fossaResult.vulnerabilities === 'number' 
                    ? fossaResult.vulnerabilities 
                    : Object.values(fossaResult.vulnerabilities || {}).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0)
                  }
                </div>
                <div style={styles.fossaLabel}>Security Vulnerabilities</div>
              </div>
              
              <div style={styles.fossaCard}>
                <div style={{
                  ...styles.fossaValue,
                  color: (fossaResult.outdated_dependencies || 0) > 0 ? "#f59e0b" : "#22c55e"
                }}>
                  {fossaResult.outdated_dependencies || 0}
                </div>
                <div style={styles.fossaLabel}>Outdated Packages</div>
              </div>
              
              <div style={{ ...styles.fossaCard, gridColumn: "span 2" }}>
                <div style={{
                  ...styles.fossaValue,
                  color: (fossaResult.compliance_status || "FAILED") === "PASSED" ? "#22c55e" : "#ef4444"
                }}>
                  {fossaResult.compliance_status || "N/A"}
                </div>
                <div style={styles.fossaLabel}>Policy Compliance</div>
              </div>
            </div>
          ) : (
            <div style={styles.infoContainer}>
              FOSSA scan not configured. Enable FOSSA analysis to see detailed security and license information.
            </div>
          )}
        </div>
      )}

      {/* Issues & Fixes */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔧 Expected Changes & Fixes</h2>
        <div style={styles.issuesGrid}>
          <div style={styles.issueCard}>
            <div style={styles.issueIcon}>📄</div>
            <div style={styles.issueContent}>
              <div style={styles.issueTitle}>Files to Modify</div>
              <div style={styles.issueValue}>{repoAnalysis.java_files?.length || 0} Java files</div>
              <div style={styles.issueDesc}>
                Source files will be updated to support Java {selectedTargetVersion}
              </div>
            </div>
          </div>
          
          <div style={styles.issueCard}>
            <div style={styles.issueIcon}>🔧</div>
            <div style={styles.issueContent}>
              <div style={styles.issueTitle}>Dependencies Need to Update</div>
              <div style={styles.issueValue}>{upgradableDependencies} dependencies</div>
              <div style={styles.issueDesc}>
                Outdated dependencies will be upgraded to compatible versions
              </div>
            </div>
          </div>
          
          <div style={styles.issueCard}>
            <div style={styles.issueIcon}>🧪</div>
            <div style={styles.issueContent}>
              <div style={styles.issueTitle}>Tests to Execute</div>
              <div style={styles.issueValue}>
                {repoAnalysis.has_tests ? "All tests" : "No tests detected"}
              </div>
              <div style={styles.issueDesc}>
                {repoAnalysis.has_tests 
                  ? "Test suite will be executed to verify changes" 
                  : "Add tests for better migration confidence"}
              </div>
            </div>
          </div>
          
          <div style={styles.issueCard}>
            <div style={styles.issueIcon}>🎯</div>
            <div style={styles.issueContent}>
              <div style={styles.issueTitle}>API Need Changes</div>
              <div style={styles.issueValue}>{repoAnalysis.api_endpoints.length} endpoints</div>
              <div style={styles.issueDesc}>
                REST API endpoints will be validated after migration
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⚠️ Risk Assessment</h2>
        <div style={styles.riskContainer}>
          <div style={styles.riskContent}>
            <div style={styles.riskHeader}>
              <div style={{
                ...styles.riskLevel,
                backgroundColor: riskLevel === "low" ? "#dcfce7" : riskLevel === "medium" ? "#fef3c7" : "#fee2e2",
                color: riskLevel === "low" ? "#166534" : riskLevel === "medium" ? "#92400e" : "#991b1b"
              }}>
                {riskLevel.toUpperCase()} RISK
              </div>
              <div style={styles.riskScore}>
                Score: {riskLevel === "high" ? "8-10" : riskLevel === "medium" ? "5-7" : "1-4"}/10
              </div>
            </div>
            
            <div style={styles.riskFactors}>
              <h3 style={styles.riskFactorsTitle}>Key Risk Factors:</h3>
              <ul style={styles.riskFactorsList}>
                {!repoAnalysis.build_tool && (
                  <li style={styles.riskFactor}>
                    <span style={styles.riskSeverity}>High</span>
                    <span>No build tool detected</span>
                  </li>
                )}
                {parseInt(repoAnalysis.java_version || "0") < 8 && (
                  <li style={styles.riskFactor}>
                    <span style={styles.riskSeverity}>High</span>
                    <span>Java version {repoAnalysis.java_version} is very outdated</span>
                  </li>
                )}
                {outdatedDependencies > totalDependencies * 0.5 && (
                  <li style={styles.riskFactor}>
                    <span style={styles.riskSeverity}>High</span>
                    <span>More than 50% of dependencies are outdated</span>
                  </li>
                )}
                {!repoAnalysis.has_tests && (
                  <li style={styles.riskFactor}>
                    <span style={styles.riskSeverity}>Medium</span>
                    <span>No test files detected</span>
                  </li>
                )}
                {outdatedDependencies > 0 && outdatedDependencies <= totalDependencies * 0.5 && (
                  <li style={styles.riskFactor}>
                    <span style={styles.riskSeverity}>Low</span>
                    <span>{outdatedDependencies} dependencies need updating</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div style={styles.recommendations}>
              <h3 style={styles.recommendationsTitle}>Recommendations:</h3>
              <div style={styles.recommendationList}>
                {riskLevel === "high" && (
                  <div style={styles.recommendation}>
                    <span style={styles.recommendationIcon}>⚠️</span>
                    <span>This is a high-risk migration. Consider thorough testing and backup before proceeding.</span>
                  </div>
                )}
                {riskLevel === "medium" && (
                  <div style={styles.recommendation}>
                    <span style={styles.recommendationIcon}>⚠️</span>
                    <span>Some risks identified. Ensure proper testing and review changes carefully.</span>
                  </div>
                )}
                {riskLevel === "low" && (
                  <div style={styles.recommendation}>
                    <span style={styles.recommendationIcon}>✅</span>
                    <span>Migration appears to be low-risk. Proceed with standard testing procedures.</span>
                  </div>
                )}
                <div style={styles.recommendation}>
                  <span style={styles.recommendationIcon}>📊</span>
                  <span>Review the detailed dependency changes before starting migration</span>
                </div>
                <div style={styles.recommendation}>
                  <span style={styles.recommendationIcon}>🧪</span>
                  <span>Ensure test coverage is adequate for critical functionality</span>
                </div>
                <div style={styles.recommendation}>
                  <span style={styles.recommendationIcon}>🔍</span>
                  <span>Consider running SonarQube analysis to identify additional code quality issues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap",
    gap: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    margin: 0,
    lineHeight: 1.6,
  },
  riskBadge: {
    padding: "10px 20px",
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  section: {
    marginBottom: 32,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1e293b",
    margin: 0,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  overviewCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  overviewIcon: {
    fontSize: 32,
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    color: "#2563eb",
  },
  overviewContent: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  arrow: {
    fontSize: 20,
    color: "#64748b",
    fontWeight: 300,
  },
  structureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
  },
  structureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  checkmark: {
    fontSize: 24,
    color: "#22c55e",
    fontWeight: 700,
  },
  cross: {
    fontSize: 24,
    color: "#dc2626",
    fontWeight: 700,
  },
  structureTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: 4,
  },
  structureDesc: {
    fontSize: 12,
    color: "#64748b",
  },
  dependencyStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#2563eb",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dependencyListContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  dependencyListHeader: {
    display: "flex",
    padding: "16px 20px",
    backgroundColor: "#1e293b",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13,
    borderBottom: "1px solid #e2e8f0",
  },
  dependencyCell: {
    padding: "12px 16px",
    fontSize: 14,
    color: "#374151",
  },
  dependencyRow: {
    display: "flex",
    padding: "14px 20px",
    borderBottom: "1px solid #e2e8f0",
    transition: "background-color 0.2s ease",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  moreDependencies: {
    padding: "16px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    fontStyle: "italic",
  },
  configGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
  },
  configCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  configIcon: {
    fontSize: 28,
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    color: "#2563eb",
    flexShrink: 0,
  },
  configContent: {
    flex: 1,
  },
  configTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: 8,
  },
  configValue: {
    fontSize: 18,
    fontWeight: 600,
    color: "#22c55e",
    marginBottom: 8,
  },
  configDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
    color: "#2563eb",
    fontWeight: 500,
    fontSize: 15,
  },
  spinner: {
    width: 24,
    height: 24,
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  fossaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  fossaCard: {
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  fossaValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#2563eb",
    marginBottom: 8,
  },
  fossaLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 24,
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  issuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  issueCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  issueIcon: {
    fontSize: 28,
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    color: "#2563eb",
    flexShrink: 0,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: 8,
  },
  issueValue: {
    fontSize: 18,
    fontWeight: 600,
    color: "#22c55e",
    marginBottom: 8,
  },
  issueDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  riskContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 24,
    border: "1px solid #e2e8f0",
  },
  riskContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  riskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap",
    gap: 16,
  },
  riskLevel: {
    padding: "10px 20px",
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  riskScore: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: 500,
  },
  riskFactors: {
    marginBottom: 24,
  },
  riskFactorsTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1e293b",
    margin: 0,
    marginBottom: 12,
  },
  riskFactorsList: {
    margin: 0,
    paddingLeft: 20,
    fontSize: 14,
    color: "#374151",
  },
  riskFactor: {
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  riskSeverity: {
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  recommendations: {
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1e293b",
    margin: 0,
    marginBottom: 12,
  },
  recommendationList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  recommendation: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.6,
  },
  recommendationIcon: {
    fontSize: 18,
    color: "#2563eb",
    marginTop: 2,
  },
};
