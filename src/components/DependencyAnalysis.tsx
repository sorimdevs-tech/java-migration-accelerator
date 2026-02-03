import React, { useState, useMemo } from 'react';
import { DependencyInfo, DependencySummary } from '../services/api';
import '../components/DependencyAnalysis.css';

interface DependencyAnalysisProps {
  dependencies: DependencyInfo[];
  summary?: DependencySummary;
  javaVersion?: string;
}

const getSeverityColor = (severity: string): string => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return '#dc2626'; // red-600
    case 'HIGH':
      return '#ea580c'; // orange-600
    case 'MEDIUM':
      return '#eab308'; // yellow-500
    case 'LOW':
      return '#3b82f6'; // blue-500
    case 'OK':
      return '#22c55e'; // green-500
    default:
      return '#6b7280'; // gray-500
  }
};

const getSeverityIcon = (severity: string): string => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return '🔴';
    case 'HIGH':
      return '🟠';
    case 'MEDIUM':
      return '🟡';
    case 'LOW':
      return '🔵';
    case 'OK':
      return '🟢';
    default:
      return '⚪';
  }
};

export const DependencyAnalysis: React.FC<DependencyAnalysisProps> = ({
  dependencies,
  summary,
  javaVersion
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);

  const filteredDependencies = useMemo(() => {
    if (!filterSeverity) return dependencies;
    return dependencies.filter(dep => dep.severity === filterSeverity);
  }, [dependencies, filterSeverity]);

  const needsUpdate = dependencies.filter(dep => dep.needs_update).length;
  const totalDeps = dependencies.length;
  const updatePercentage = totalDeps > 0 ? Math.round((needsUpdate / totalDeps) * 100) : 0;

  return (
    <div className="dependency-analysis">
      {/* Summary Dashboard */}
      {summary && (
        <div className="dependency-summary">
          <div className="summary-header">
            <h3>📊 Dependency Analysis Summary</h3>
            <div className="summary-stats">
              <div className="stat-card critical" style={{ borderLeftColor: '#dc2626' }}>
                <div className="stat-number">{summary.critical_issues.length}</div>
                <div className="stat-label">Critical</div>
              </div>
              <div className="stat-card high" style={{ borderLeftColor: '#ea580c' }}>
                <div className="stat-number">{summary.high_issues.length}</div>
                <div className="stat-label">High</div>
              </div>
              <div className="stat-card medium" style={{ borderLeftColor: '#eab308' }}>
                <div className="stat-number">{summary.medium_issues.length}</div>
                <div className="stat-label">Medium</div>
              </div>
              <div className="stat-card low" style={{ borderLeftColor: '#3b82f6' }}>
                <div className="stat-number">{summary.low_issues.length}</div>
                <div className="stat-label">Low</div>
              </div>
              <div className="stat-card ok" style={{ borderLeftColor: '#22c55e' }}>
                <div className="stat-number">{summary.ok_dependencies.length}</div>
                <div className="stat-label">Up to Date</div>
              </div>
            </div>
          </div>

          <div className="summary-insights">
            <div className="insight-item">
              <span className="insight-icon">⏱️</span>
              <span className="insight-text">
                Estimated migration time: <strong>{summary.estimated_migration_hours} hours</strong>
              </span>
            </div>
            {summary.has_critical && (
              <div className="insight-item alert-critical">
                <span className="insight-icon">⚠️</span>
                <span className="insight-text">
                  Critical security issues found - update immediately!
                </span>
              </div>
            )}
            {summary.has_high && !summary.has_critical && (
              <div className="insight-item alert-high">
                <span className="insight-icon">⚠️</span>
                <span className="insight-text">
                  High priority updates recommended
                </span>
              </div>
            )}
          </div>

          {/* Update progress bar */}
          <div className="progress-section">
            <div className="progress-label">
              Update Status: {needsUpdate} of {totalDeps} dependencies need updating ({updatePercentage}%)
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${updatePercentage}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Filter buttons */}
      <div className="filter-section">
        <button
          className={`filter-btn ${!filterSeverity ? 'active' : ''}`}
          onClick={() => setFilterSeverity(null)}
        >
          All ({dependencies.length})
        </button>
        <button
          className={`filter-btn critical ${filterSeverity === 'CRITICAL' ? 'active' : ''}`}
          onClick={() => setFilterSeverity('CRITICAL')}
        >
          🔴 Critical ({dependencies.filter(d => d.severity === 'CRITICAL').length})
        </button>
        <button
          className={`filter-btn high ${filterSeverity === 'HIGH' ? 'active' : ''}`}
          onClick={() => setFilterSeverity('HIGH')}
        >
          🟠 High ({dependencies.filter(d => d.severity === 'HIGH').length})
        </button>
        <button
          className={`filter-btn medium ${filterSeverity === 'MEDIUM' ? 'active' : ''}`}
          onClick={() => setFilterSeverity('MEDIUM')}
        >
          🟡 Medium ({dependencies.filter(d => d.severity === 'MEDIUM').length})
        </button>
        <button
          className={`filter-btn low ${filterSeverity === 'LOW' ? 'active' : ''}`}
          onClick={() => setFilterSeverity('LOW')}
        >
          🔵 Low ({dependencies.filter(d => d.severity === 'LOW').length})
        </button>
      </div>

      {/* Dependencies Table */}
      <div className="dependencies-table-container">
        <table className="dependencies-table">
          <thead>
            <tr>
              <th className="col-severity">Severity</th>
              <th className="col-name">Dependency</th>
              <th className="col-current">Current</th>
              <th className="col-target">Target</th>
              <th className="col-status">Status</th>
              <th className="col-impact">Impact</th>
              <th className="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDependencies.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  No dependencies match the selected filter
                </td>
              </tr>
            ) : (
              filteredDependencies.map((dep, idx) => {
                const isExpanded = expandedId === `${dep.artifact_id}-${idx}`;
                const depId = `${dep.artifact_id}-${idx}`;

                return (
                  <React.Fragment key={depId}>
                    <tr className={`dependency-row ${dep.needs_update ? 'needs-update' : ''}`}>
                      <td className="col-severity">
                        <span
                          className="severity-badge"
                          style={{ backgroundColor: getSeverityColor(dep.severity) }}
                        >
                          {getSeverityIcon(dep.severity)} {dep.severity || 'OK'}
                        </span>
                      </td>
                      <td className="col-name">
                        <div className="dep-name">{dep.artifact_id}</div>
                        <div className="dep-group">{dep.group_id}</div>
                      </td>
                      <td className="col-current">{dep.current_version}</td>
                      <td className="col-target">
                        {dep.new_version ? (
                          <span className="version-badge">{dep.new_version}</span>
                        ) : (
                          <span className="version-na">—</span>
                        )}
                      </td>
                      <td className="col-status">
                        {dep.needs_update ? (
                          <span className="status-badge update-needed">🔄 Update</span>
                        ) : (
                          <span className="status-badge current">✅ Current</span>
                        )}
                      </td>
                      <td className="col-impact">
                        {dep.code_changes_needed ? (
                          <span className="impact-badge high">Code changes</span>
                        ) : (
                          <span className="impact-badge low">No code changes</span>
                        )}
                      </td>
                      <td className="col-action">
                        {dep.reason && (
                          <button
                            className="expand-btn"
                            onClick={() => setExpandedId(isExpanded ? null : depId)}
                          >
                            {isExpanded ? '▼ Less' : '▶ More'}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded details */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan={7}>
                          <div className="expanded-content">
                            <div className="detail-section">
                              <h4>📝 Reason</h4>
                              <p>{dep.reason}</p>
                            </div>

                            {dep.migration_guide && (
                              <div className="detail-section">
                                <h4>📋 Migration Guide</h4>
                                <p>{dep.migration_guide}</p>
                              </div>
                            )}

                            {dep.code_changes_needed && (
                              <div className="detail-section alert">
                                <h4>⚠️ Code Changes Required</h4>
                                <p>
                                  This update requires code changes beyond just updating the version number.
                                  Review the migration guide carefully.
                                </p>
                              </div>
                            )}

                            <div className="detail-section">
                              <h4>📊 Update Details</h4>
                              <div className="update-details">
                                <div className="detail-row">
                                  <span className="detail-label">Current Version:</span>
                                  <span className="detail-value">{dep.current_version}</span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Target Version:</span>
                                  <span className="detail-value">{dep.new_version || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Severity:</span>
                                  <span className="detail-value">
                                    {getSeverityIcon(dep.severity)} {dep.severity}
                                  </span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Estimated Impact:</span>
                                  <span className="detail-value">{dep.estimated_impact || 'Unknown'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      {summary && (summary.critical_issues.length > 0 || summary.high_issues.length > 0) && (
        <div className="action-section">
          <div className="action-card critical-action">
            <h3>🚨 Immediate Actions Required</h3>
            <ol className="action-list">
              {summary.critical_issues.map((issue, idx) => (
                <li key={idx}>
                  <strong>{issue.dependency}</strong>: {issue.reason}
                  {issue.migration_guide && (
                    <div className="guide-preview">{issue.migration_guide}</div>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {summary.high_issues.length > 0 && (
            <div className="action-card high-action">
              <h3>⚠️ High Priority Updates</h3>
              <ol className="action-list">
                {summary.high_issues.slice(0, 3).map((issue, idx) => (
                  <li key={idx}>
                    <strong>{issue.dependency}</strong>: {issue.reason}
                  </li>
                ))}
                {summary.high_issues.length > 3 && (
                  <li className="more-items">
                    +{summary.high_issues.length - 3} more high priority items
                  </li>
                )}
              </ol>
            </div>
          )}

          <div className="migration-estimate">
            <p>
              <strong>⏱️ Total Estimated Time:</strong> {summary.estimated_migration_hours} hours
            </p>
            <p className="estimate-details">
              This includes analysis, code updates, testing, and validation. Actual time may vary based on complexity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependencyAnalysis;
