import React, { useState, useRef } from 'react';
import '../components/RepositoryAnalysisPanel.css';

interface DependencyData {
  maven: {
    found: boolean;
    java_version?: string;
    dependencies: any[];
    build_plugins: any[];
  };
  gradle: {
    found: boolean;
    java_version?: string;
    dependencies: any[];
    plugins: any[];
  };
  total_dependencies: number;
  outdated_count: number;
  vulnerable_count: number;
  critical_issues: any[];
}

interface AnalysisResult {
  repo_url: string;
  dependencies: DependencyData;
  business_logic_issues: any[];
  testing_coverage: {
    test_files_found: number;
    test_frameworks: string[];
    coverage_percentage: number;
    issues: any[];
  };
  code_refactoring: {
    total_java_files: number;
    issues: any[];
  };
  summary: {
    total_dependencies: number;
    outdated_dependencies: number;
    vulnerable_dependencies: number;
    business_logic_issues: number;
    test_coverage_percentage: number;
    test_files: number;
    refactoring_opportunities: number;
    overall_health_score: number;
  };
}

export const RepositoryAnalysisPanel: React.FC<{ repoUrl: string }> = ({ repoUrl }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dependencies' | 'logic' | 'testing' | 'refactoring'>('overview');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchAnalysis = async () => {
    if (!repoUrl) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/repository/analyze?repo_url=${encodeURIComponent(repoUrl)}`);
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setAnalysis(data);
      setActiveTab('overview');
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScore = (score: number) => {
    if (score >= 80) return { color: '#22c55e', label: 'Excellent' };
    if (score >= 60) return { color: '#84cc16', label: 'Good' };
    if (score >= 40) return { color: '#eab308', label: 'Fair' };
    return { color: '#ef4444', label: 'Poor' };
  };

  if (!analysis) {
    return (
      <div className="analysis-panel">
        <button onClick={fetchAnalysis} disabled={loading || !repoUrl} className="analyze-btn">
          {loading ? '⏳ Analyzing Repository...' : '🔍 Analyze Repository'}
        </button>
      </div>
    );
  }

  const health = getHealthScore(analysis.summary.overall_health_score);

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <h2>📊 Repository Analysis</h2>
        <div className="health-score" style={{ borderColor: health.color }}>
          <div className="health-value" style={{ color: health.color }}>
            {analysis.summary.overall_health_score}
          </div>
          <div className="health-label">{health.label}</div>
        </div>
      </div>

      <div className="analysis-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'dependencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('dependencies')}
        >
          📦 Dependencies ({analysis.summary.total_dependencies})
        </button>
        <button
          className={`tab-btn ${activeTab === 'logic' ? 'active' : ''}`}
          onClick={() => setActiveTab('logic')}
        >
          🐛 Business Logic ({analysis.summary.business_logic_issues})
        </button>
        <button
          className={`tab-btn ${activeTab === 'testing' ? 'active' : ''}`}
          onClick={() => setActiveTab('testing')}
        >
          ✅ Testing ({analysis.summary.test_coverage_percentage}%)
        </button>
        <button
          className={`tab-btn ${activeTab === 'refactoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('refactoring')}
        >
          🔧 Refactoring ({analysis.summary.refactoring_opportunities})
        </button>
      </div>

      <div className="analysis-content" ref={scrollContainerRef}>
        {activeTab === 'overview' && (
          <div className="tab-content">
            <h3>Overview</h3>
            <div className="metrics-grid">
              <div className="metric-box">
                <div className="metric-icon">📦</div>
                <div className="metric-name">Total Dependencies</div>
                <div className="metric-value">{analysis.summary.total_dependencies}</div>
                <div className="metric-detail">
                  🔴 {analysis.summary.vulnerable_dependencies} Vulnerable |
                  ⚠️ {analysis.summary.outdated_dependencies} Outdated
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-icon">✅</div>
                <div className="metric-name">Test Coverage</div>
                <div className="metric-value">{analysis.summary.test_coverage_percentage}%</div>
                <div className="metric-detail">{analysis.summary.test_files} Test Files</div>
              </div>

              <div className="metric-box">
                <div className="metric-icon">🐛</div>
                <div className="metric-name">Business Logic Issues</div>
                <div className="metric-value">{analysis.summary.business_logic_issues}</div>
                <div className="metric-detail">Need to be fixed</div>
              </div>

              <div className="metric-box">
                <div className="metric-icon">🔧</div>
                <div className="metric-name">Refactoring Opportunities</div>
                <div className="metric-value">{analysis.summary.refactoring_opportunities}</div>
                <div className="metric-detail">Improvements Suggested</div>
              </div>
            </div>

            <div className="recommendations">
              <h4>📋 Recommendations</h4>
              <ul>
                {analysis.summary.vulnerable_dependencies > 0 && (
                  <li>🚨 {analysis.summary.vulnerable_dependencies} vulnerable dependencies need updating</li>
                )}
                {analysis.summary.outdated_dependencies > 0 && (
                  <li>⚠️ {analysis.summary.outdated_dependencies} dependencies are outdated</li>
                )}
                {analysis.summary.test_coverage_percentage < 50 && (
                  <li>❌ Test coverage is below 50% - increase coverage to at least 80%</li>
                )}
                {analysis.summary.business_logic_issues > 10 && (
                  <li>🐛 {analysis.summary.business_logic_issues} business logic issues to fix</li>
                )}
                {analysis.summary.refactoring_opportunities > 5 && (
                  <li>🔧 {analysis.summary.refactoring_opportunities} refactoring opportunities available</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'dependencies' && (
          <div className="tab-content">
            <h3>Dependencies Analysis</h3>
            
            {analysis.dependencies.critical_issues.length > 0 && (
              <div className="critical-section">
                <h4>🚨 Critical Issues</h4>
                {analysis.dependencies.critical_issues.map((issue, idx) => (
                  <div key={idx} className="issue-item critical">
                    <div className="issue-title">{issue.artifact}</div>
                    <div className="issue-description">{issue.issue}</div>
                    <div className="issue-version">Version: {issue.version}</div>
                  </div>
                ))}
              </div>
            )}

            {analysis.dependencies.maven.found && (
              <div className="build-section">
                <h4>🔨 Maven Configuration</h4>
                <div className="config-item">
                  <span>Java Version: </span>
                  <strong>{analysis.dependencies.maven.java_version || 'Not specified'}</strong>
                </div>
                <div className="config-item">
                  <span>Dependencies: </span>
                  <strong>{analysis.dependencies.maven.dependencies.length}</strong>
                </div>
                <div className="dep-list">
                  {analysis.dependencies.maven.dependencies.slice(0, 10).map((dep, idx) => (
                    <div key={idx} className={`dep-item ${dep.is_outdated ? 'outdated' : ''} ${dep.severity === 'CRITICAL' ? 'critical' : ''}`}>
                      <div className="dep-name">{dep.artifact_id}</div>
                      <div className="dep-version">{dep.version}</div>
                      {dep.is_outdated && <span className="badge outdated">Outdated</span>}
                      {dep.severity && dep.severity !== 'LOW' && <span className="badge critical">{dep.severity}</span>}
                    </div>
                  ))}
                  {analysis.dependencies.maven.dependencies.length > 10 && (
                    <div className="more-items">+{analysis.dependencies.maven.dependencies.length - 10} more</div>
                  )}
                </div>
              </div>
            )}

            {analysis.dependencies.gradle.found && (
              <div className="build-section">
                <h4>🐘 Gradle Configuration</h4>
                <div className="config-item">
                  <span>Java Version: </span>
                  <strong>{analysis.dependencies.gradle.java_version || 'Not specified'}</strong>
                </div>
                <div className="config-item">
                  <span>Dependencies: </span>
                  <strong>{analysis.dependencies.gradle.dependencies.length}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logic' && (
          <div className="tab-content">
            <h3>Business Logic Issues</h3>
            <div className="issues-list">
              {analysis.business_logic_issues.slice(0, 20).map((issue, idx) => (
                <div key={idx} className={`issue-item ${issue.severity.toLowerCase()}`}>
                  <div className="issue-header">
                    <span className="severity-badge">{issue.severity}</span>
                    <span className="category">{issue.category}</span>
                  </div>
                  <div className="issue-file">{issue.file} : {issue.line}</div>
                  <div className="issue-message">{issue.suggestion}</div>
                </div>
              ))}
              {analysis.business_logic_issues.length === 0 && (
                <div className="empty-state">✅ No business logic issues detected!</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="tab-content">
            <h3>Testing Coverage</h3>
            <div className="testing-summary">
              <div className="test-metric">
                <div className="test-label">Test Files Found</div>
                <div className="test-value">{analysis.testing_coverage.test_files_found}</div>
              </div>
              <div className="test-metric">
                <div className="test-label">Coverage</div>
                <div className="test-value" style={{
                  color: analysis.testing_coverage.coverage_percentage >= 80 ? '#22c55e' : '#ef4444'
                }}>
                  {analysis.testing_coverage.coverage_percentage}%
                </div>
              </div>
              <div className="test-metric">
                <div className="test-label">Test Frameworks</div>
                <div className="test-value">
                  {analysis.testing_coverage.test_frameworks.length > 0
                    ? analysis.testing_coverage.test_frameworks.join(', ')
                    : 'None detected'}
                </div>
              </div>
            </div>

            {analysis.testing_coverage.issues.length > 0 && (
              <div className="testing-issues">
                <h4>⚠️ Testing Recommendations</h4>
                {analysis.testing_coverage.issues.map((issue, idx) => (
                  <div key={idx} className={`issue-item ${issue.severity.toLowerCase()}`}>
                    <div className="issue-title">{issue.issue}</div>
                    <div className="issue-description">{issue.suggestion}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'refactoring' && (
          <div className="tab-content">
            <h3>Code Refactoring Opportunities</h3>
            <div className="refactoring-summary">
              <div className="ref-metric">
                <div className="ref-label">Java Files</div>
                <div className="ref-value">{analysis.code_refactoring.total_java_files}</div>
              </div>
              <div className="ref-metric">
                <div className="ref-label">Refactoring Issues</div>
                <div className="ref-value">{analysis.code_refactoring.issues.length}</div>
              </div>
            </div>

            <div className="refactoring-list">
              {analysis.code_refactoring.issues.slice(0, 15).map((issue, idx) => (
                <div key={idx} className="refactoring-item">
                  <div className="ref-type">{issue.type}</div>
                  <div className="ref-file">{issue.file}</div>
                  <div className="ref-suggestion">{issue.suggestion}</div>
                  {issue.details && <div className="ref-details">{issue.details}</div>}
                </div>
              ))}
              {analysis.code_refactoring.issues.length === 0 && (
                <div className="empty-state">✅ No refactoring issues detected!</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
