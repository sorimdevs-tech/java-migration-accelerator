import React, { useState, useEffect } from "react";
import {
  fetchRepositories,
  analyzeRepository,
  analyzeRepoUrl,
  listRepoFiles,
  getJavaVersions,
  getConversionTypes,
  startMigration,
  getMigrationStatus,
  getMigrationLogs,
} from "../services/api";
import type {
  RepoInfo,
  RepoAnalysis,
  RepoFilesResponse,
  RepoFile,
  MigrationResult,
  ConversionType,
} from "../services/api";

interface JavaVersionOption {
  value: string;
  label: string;
}

const MIGRATION_STEPS = [
  { id: 1, name: "Connect", icon: "🔑", description: "Select Project URL" },
  { id: 2, name: "Files & Folders", icon: "📁", description: "Repository Structure" },
  { id: 3, name: "Discovery", icon: "🔍", description: "Application Discovery" },
  { id: 4, name: "Assessment", icon: "📊", description: "Application Assessment" },
  { id: 5, name: "Strategy", icon: "📋", description: "Migration Strategy" },
  { id: 6, name: "Planning", icon: "🎯", description: "Migration Planning" },
  { id: 7, name: "Dependencies", icon: "📦", description: "Dependencies Analysis" },
  { id: 8, name: "Build & Refactor", icon: "🔧", description: "Build Modernization & Refactor" },
  { id: 9, name: "Code Migration", icon: "⚡", description: "Code Migration" },
  { id: 10, name: "Testing", icon: "✅", description: "Testing & Validation" },
  { id: 11, name: "Report", icon: "📄", description: "Migration Report" },
];

export default function MigrationWizard() {
  const [step, setStep] = useState(1);
  const [connectionMode, setConnectionMode] = useState<"token" | "url">("token");
  const [githubToken, setGithubToken] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(null);
  const [repoAnalysis, setRepoAnalysis] = useState<RepoAnalysis | null>(null);
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [targetRepoName, setTargetRepoName] = useState("");
  const [sourceVersions, setSourceVersions] = useState<JavaVersionOption[]>([]);
  const [targetVersions, setTargetVersions] = useState<JavaVersionOption[]>([]);
  const [selectedSourceVersion, setSelectedSourceVersion] = useState("8");
  const [selectedTargetVersion, setSelectedTargetVersion] = useState("17");
  const [conversionTypes, setConversionTypes] = useState<ConversionType[]>([]);
  const [selectedConversions, setSelectedConversions] = useState<string[]>(["java_version"]);
  const [runTests, setRunTests] = useState(true);
  const [runSonar, setRunSonar] = useState(false);
  const [fixBusinessLogic, setFixBusinessLogic] = useState(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [migrationJob, setMigrationJob] = useState<MigrationResult | null>(null);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [migrationApproach, setMigrationApproach] = useState("in-place");
  const [riskLevel, setRiskLevel] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);

  useEffect(() => {
    getJavaVersions().then((versions) => {
      setSourceVersions(versions.source_versions);
      setTargetVersions(versions.target_versions);
    });
    getConversionTypes().then(setConversionTypes);
  }, []);

  // Debug logging for token state
  useEffect(() => {
    console.log("DEBUG: githubToken state changed:", githubToken ? "present" : "empty", "length:", githubToken.length);
    if (githubToken) {
      console.log("DEBUG: Token starts with:", githubToken.substring(0, 10));
    }
  }, [githubToken]);

  useEffect(() => {
    if (step === 2 && connectionMode === "token" && githubToken) {
      setLoading(true);
      setError("");
      fetchRepositories(githubToken)
        .then(setRepos)
        .catch((err) => setError(err.message || "Failed to fetch repositories."))
        .finally(() => setLoading(false));
    }
  }, [step, connectionMode, githubToken]);

  useEffect(() => {
    if (step === 2 && selectedRepo && !repoAnalysis) {
      // Require token for analysis
      if (!githubToken || githubToken.trim().length === 0) {
        setError(`GitHub token is required to analyze repositories. Current token status: ${githubToken ? 'present but empty' : 'not entered'}. Please enter your Personal Access Token in the appropriate field.`);
        return;
      }

      if (!githubToken.startsWith('ghp_')) {
        setError(`Invalid GitHub token format. Token should start with 'ghp_'. Current token: "${githubToken.substring(0, 10)}...". Please ensure you're entering a valid GitHub Personal Access Token.`);
        return;
      }

      setLoading(true);
      const isUrlMode = connectionMode === "url" && selectedRepo.url.startsWith("http");
      const analyzePromise = isUrlMode
        ? analyzeRepoUrl(selectedRepo.url, githubToken).then(result => result.analysis)
        : (() => {
            const [owner, repo] = selectedRepo.full_name.split("/");
            return analyzeRepository(githubToken, owner, repo);
          })();

      analyzePromise
        .then((analysis) => {
          setRepoAnalysis(analysis);
          // Auto-set source version based on analysis
          if (analysis.java_version && analysis.java_version !== "unknown") {
            setSelectedSourceVersion(analysis.java_version);
          }
          const hasTests = analysis.has_tests;
          const hasBuildTool = analysis.build_tool !== null;
          if (hasTests && hasBuildTool) setRiskLevel("low");
          else if (hasBuildTool) setRiskLevel("medium");
          else setRiskLevel("high");
        })
        .catch((err) => setError(err.message || "Failed to analyze repository."))
        .finally(() => setLoading(false));
    }
  }, [step, selectedRepo, githubToken, repoAnalysis, connectionMode]);

  useEffect(() => {
    if (step === 2 && selectedRepo && connectionMode === "url") {
      setLoading(true);
      listRepoFiles(selectedRepo.url, githubToken, currentPath)
        .then((response) => {
          setRepoFiles(response.files);
        })
        .catch((err) => setError(err.message || "Failed to list repository files."))
        .finally(() => setLoading(false));
    }
  }, [step, selectedRepo, githubToken, currentPath, connectionMode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step >= 9 && migrationJob && migrationJob.status !== "completed" && migrationJob.status !== "failed") {
      interval = setInterval(() => {
        getMigrationStatus(migrationJob.job_id)
          .then((job) => {
            setMigrationJob(job);
            // Auto-advance to report when completed
            if (job.status === "completed") {
              setStep(11);
              // Fetch detailed logs
              getMigrationLogs(job.job_id).then((logs) => setMigrationLogs(logs.logs));
            }
          })
          .catch(() => setError("Failed to fetch migration status."));
      }, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [step, migrationJob?.job_id, migrationJob?.status]);

  const handleConversionToggle = (id: string) => {
    setSelectedConversions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleFrameworkToggle = (framework: string) => {
    setSelectedFrameworks((prev) =>
      prev.includes(framework) ? prev.filter((f) => f !== framework) : [...prev, framework]
    );
  };

  const handleStartMigration = () => {
    if (!selectedRepo && !repoUrl) {
      setError("Please select a repository or enter a repository URL");
      return;
    }

    if (!githubToken || githubToken.trim().length === 0) {
      setError("GitHub token is required for repository creation. Please enter your Personal Access Token.");
      return;
    }

    if (!githubToken.startsWith('ghp_')) {
      setError("Invalid GitHub token format. Token should start with 'ghp_'.");
      return;
    }

    setLoading(true);
    setError("");

    console.log("DEBUG: Starting migration with token:", githubToken ? "present" : "empty", "length:", githubToken.length);
    console.log("DEBUG: Token starts with:", githubToken.substring(0, 10));

    const repoName = selectedRepo?.name || repoUrl.split("/").pop()?.replace(".git", "") || "migrated-repo";
    const finalTargetRepoName = targetRepoName || `${repoName}-migrated`;

    const migrationRequest = {
      source_repo_url: selectedRepo?.url || repoUrl,
      target_repo_name: finalTargetRepoName,
      source_java_version: selectedSourceVersion,
      target_java_version: selectedTargetVersion,
      github_token: githubToken.trim(),
      conversion_types: selectedConversions,
      run_tests: runTests,
      run_sonar: runSonar,
      fix_business_logic: fixBusinessLogic,
      email: email.trim() || undefined,
    };

    console.log("DEBUG: Migration request token field:", migrationRequest.github_token ? "present" : "empty");
    console.log("DEBUG: Full request:", JSON.stringify(migrationRequest, null, 2));

    startMigration(migrationRequest)
      .then((job) => {
        setMigrationJob(job);
        setStep(9); // Go to Code Migration step
      })
      .catch((err) => {
        console.error("Migration error:", err);
        setError(err.message || "Failed to start migration.");
      })
      .finally(() => setLoading(false));
  };

  const resetWizard = () => {
    setStep(1);
    setConnectionMode("token");
    setGithubToken("");
    setRepoUrl("");
    setRepos([]);
    setSelectedRepo(null);
    setRepoAnalysis(null);
    setRepoFiles([]);
    setCurrentPath("");
    setTargetRepoName("");
    setSelectedSourceVersion("8");
    setSelectedTargetVersion("17");
    setSelectedConversions(["java_version"]);
    setRunTests(true);
    setRunSonar(false);
    setLoading(false);
    setMigrationJob(null);
    setMigrationLogs([]);
    setError("");
    setMigrationApproach("in-place");
    setRiskLevel("");
    setSelectedFrameworks([]);
  };

  const renderStepIndicator = () => (
    <div style={styles.stepIndicator}>
      {MIGRATION_STEPS.map((s) => (
        <div key={s.id} style={{ ...styles.stepItem, opacity: step >= s.id ? 1 : 0.5, cursor: step > s.id ? "pointer" : "default" }} onClick={() => step > s.id && setStep(s.id)}>
          <div style={{ ...styles.stepCircle, backgroundColor: step > s.id ? "#22c55e" : step === s.id ? "#3b82f6" : "#e5e7eb", color: step >= s.id ? "#fff" : "#6b7280" }}>{step > s.id ? "✓" : s.icon}</div>
          <div style={styles.stepLabel}>
            <div style={{ fontWeight: step === s.id ? 600 : 400, fontSize: 13 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{s.description}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div style={styles.card}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIcon}>🔑</span>
        <div>
          <h2 style={styles.title}>Connect to GitHub</h2>
          <p style={styles.subtitle}>Choose how you want to connect to GitHub.</p>
        </div>
      </div>
      <div style={styles.connectionModes}>
        <button style={{ ...styles.modeButton, ...(connectionMode === "token" ? styles.modeButtonActive : {}) }} onClick={() => setConnectionMode("token")}>
          <span style={styles.modeIcon}>🔐</span>
          <span style={styles.modeTitle}>Personal Access Token</span>
          <span style={styles.modeDesc}>Browse & select from your repositories</span>
        </button>
        <button style={{ ...styles.modeButton, ...(connectionMode === "url" ? styles.modeButtonActive : {}) }} onClick={() => setConnectionMode("url")}>
          <span style={styles.modeIcon}>🔗</span>
          <span style={styles.modeTitle}>Repository URL</span>
          <span style={styles.modeDesc}>Directly enter a GitHub repository URL</span>
        </button>
      </div>
      {connectionMode === "token" && (
        <>
          <div style={styles.infoBox}>
            <strong>📌 Required Token Scopes:</strong>
            <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
              <li>repo (Full control of private repositories)</li>
              <li>workflow (Update GitHub Action workflows)</li>
            </ul>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>GitHub Personal Access Token</label>
            <input type="password" style={styles.input} value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
            <p style={styles.helpText}>Need a token? <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" style={styles.link}>Create one here</a></p>
          </div>
        </>
      )}
      {connectionMode === "url" && (
        <>
          <div style={styles.infoBox}>
            <strong>📌 Supported URL Formats:</strong>
            <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
              <li>https://github.com/owner/repository</li>
              <li>github.com/owner/repository</li>
              <li>owner/repository</li>
            </ul>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Repository URL</label>
            <input type="text" style={styles.input} value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repository" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Personal Access Token (Optional) {githubToken ? "✅" : "❌"}</label>
            <input
              type="password"
              style={{ ...styles.input, borderColor: githubToken ? "#22c55e" : "#ef4444" }}
              value={githubToken}
              onChange={(e) => {
                console.log("DEBUG: URL mode token input changed to:", e.target.value ? "present" : "empty", "length:", e.target.value.length);
                setGithubToken(e.target.value);
              }}
              placeholder="Enter your GitHub token here (ghp_...)"
            />
            <p style={styles.helpText}>
              Required for repository analysis and migration. Current status: {githubToken ? `✅ Token entered (${githubToken.length} chars, starts with: ${githubToken.substring(0, 10)}...)` : "❌ No token entered"}
            </p>
          </div>
        </>
      )}
      <div style={styles.btnRow}>
        <button style={{ ...styles.primaryBtn, opacity: connectionMode === "token" ? (githubToken ? 1 : 0.5) : (repoUrl ? 1 : 0.5) }} onClick={() => {
            if (connectionMode === "token" && githubToken) {
              setStep(2);
            } else if (connectionMode === "url" && repoUrl) {
              setSelectedRepo({ name: repoUrl.split("/").pop()?.replace(".git", "") || "repo", full_name: repoUrl, url: repoUrl, default_branch: "main", language: null, description: "" });
              setStep(2);
            }
          }} disabled={connectionMode === "token" ? !githubToken : !repoUrl}>
          {connectionMode === "token" ? "Connect & Continue →" : "Continue →"}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.card}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIcon}>📁</span>
        <div>
          <h2 style={styles.title}>Repository Files & Folders</h2>
          <p style={styles.subtitle}>Explore the structure of your selected repository.</p>
        </div>
      </div>
      {connectionMode === "url" && selectedRepo && (
        <div style={styles.selectedRepoBox}>
          <span>📁</span>
          <strong>{selectedRepo.full_name}</strong>
          <button style={styles.changeBtn} onClick={() => { setSelectedRepo(null); setRepoAnalysis(null); setRepoFiles([]); setStep(1); }}>Change</button>
        </div>
      )}
      {connectionMode === "token" && !selectedRepo && (
        <>
          <div style={styles.sectionTitle}>Select Repository</div>
          {loading ? <div style={styles.loadingBox}><div style={styles.spinner}></div><span>Loading repositories...</span></div> : (
            <div style={styles.repoList}>
              {repos.length === 0 && !loading && <p style={styles.emptyText}>No repositories found. Check your token permissions.</p>}
              {repos.filter(r => r.language === "Java" || r.language === null).map((repo) => (
                <div key={repo.full_name} style={styles.repoItem} onClick={() => setSelectedRepo(repo)}>
                  <span style={styles.repoIcon}>📁</span>
                  <div style={styles.repoInfo}>
                    <div style={styles.repoName}>{repo.name}</div>
                    <div style={styles.repoPath}>{repo.full_name}</div>
                  </div>
                  <span style={styles.repoLanguage}>{repo.language || "Unknown"}</span>
                  <span style={styles.arrow}>→</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {selectedRepo && connectionMode === "url" && (
        <>
          <div style={styles.sectionTitle}>Repository Structure</div>
          {loading ? <div style={styles.loadingBox}><div style={styles.spinner}></div><span>Loading files...</span></div> : (
            <div style={styles.fileList}>
              {currentPath && (
                <div style={styles.breadcrumb}>
                  <button style={styles.backBtn} onClick={() => setCurrentPath(currentPath.split("/").slice(0, -1).join("/"))}>← Back</button>
                  <span>{currentPath}</span>
                </div>
              )}
              {repoFiles.map((file) => (
                <div key={file.path} style={styles.fileItem} onClick={() => file.type === "dir" ? setCurrentPath(file.path) : null}>
                  <span style={styles.fileIcon}>{file.type === "dir" ? "📁" : "📄"}</span>
                  <div style={styles.fileInfo}>
                    <div style={styles.fileName}>{file.name}</div>
                    <div style={styles.filePath}>{file.path}</div>
                  </div>
                  <span style={styles.fileSize}>{file.type === "file" ? `${(file.size / 1024).toFixed(1)} KB` : ""}</span>
                  <span style={styles.arrow}>{file.type === "dir" ? "→" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div style={styles.btnRow}>
        <button style={styles.secondaryBtn} onClick={() => setStep(1)}>← Back</button>
        <button style={{ ...styles.primaryBtn, opacity: selectedRepo ? 1 : 0.5 }} onClick={() => selectedRepo && setStep(3)} disabled={!selectedRepo}>
          Continue to Discovery →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.card}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIcon}>🔍</span>
        <div>
          <h2 style={styles.title}>Application Discovery</h2>
          <p style={styles.subtitle}>Analyzing the application structure and components.</p>
        </div>
      </div>
      {selectedRepo && (
        <div style={styles.discoveryContent}>
          <div style={styles.discoveryItem}>
            <span style={styles.discoveryIcon}>📊</span>
            <div>
              <div style={styles.discoveryTitle}>Repository Analysis</div>
              <div style={styles.discoveryDesc}>Scanning {selectedRepo.name} for Java components</div>
            </div>
          </div>
          <div style={styles.discoveryItem}>
            <span style={styles.discoveryIcon}>🔧</span>
            <div>
              <div style={styles.discoveryTitle}>Build Tools Detection</div>
              <div style={styles.discoveryDesc}>Identifying Maven, Gradle, or other build systems</div>
            </div>
          </div>
          <div style={styles.discoveryItem}>
            <span style={styles.discoveryIcon}>📦</span>
            <div>
              <div style={styles.discoveryTitle}>Dependencies Scan</div>
              <div style={styles.discoveryDesc}>Analyzing project dependencies and versions</div>
            </div>
          </div>
        </div>
      )}
      <div style={styles.btnRow}>
        <button style={styles.secondaryBtn} onClick={() => setStep(2)}>← Back</button>
        <button style={styles.primaryBtn} onClick={() => setStep(4)}>Continue to Assessment →</button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div style={styles.card}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIcon}>📊</span>
        <div>
          <h2 style={styles.title}>Application Assessment</h2>
          <p style={styles.subtitle}>Review the detailed assessment report.</p>
        </div>
      </div>
      {selectedRepo && (
        <>
          {loading ? <div style={styles.loadingBox}><div style={styles.spinner}></div><span>Analyzing repository...</span></div> : repoAnalysis ? (
            <>
              <div style={styles.sectionTitle}>📊 Assessment Report</div>
              <div style={{ ...styles.riskBadge, backgroundColor: riskLevel === "low" ? "#dcfce7" : riskLevel === "medium" ? "#fef3c7" : "#fee2e2", color: riskLevel === "low" ? "#166534" : riskLevel === "medium" ? "#92400e" : "#991b1b" }}>Risk Level: {riskLevel.toUpperCase()}</div>
              <div style={styles.assessmentGrid}>
                <div style={styles.assessmentItem}><div style={styles.assessmentLabel}>Build Tool</div><div style={styles.assessmentValue}>{repoAnalysis.build_tool || "Not Detected"}</div></div>
                <div style={styles.assessmentItem}><div style={styles.assessmentLabel}>Java Version</div><div style={styles.assessmentValue}>{repoAnalysis.java_version || "Unknown"}</div></div>
                <div style={styles.assessmentItem}><div style={styles.assessmentLabel}>Has Tests</div><div style={styles.assessmentValue}>{repoAnalysis.has_tests ? "Yes" : "No"}</div></div>
                <div style={styles.assessmentItem}><div style={styles.assessmentLabel}>Dependencies</div><div style={styles.assessmentValue}>{repoAnalysis.dependencies?.length || 0} found</div></div>
              </div>
              <div style={styles.structureBox}>
                <div style={styles.structureTitle}>Project Structure</div>
                <div style={styles.structureGrid}>
                  <span style={repoAnalysis.structure?.has_pom_xml ? styles.structureFound : styles.structureMissing}>{repoAnalysis.structure?.has_pom_xml ? "✓" : "✗"} pom.xml</span>
                  <span style={repoAnalysis.structure?.has_build_gradle ? styles.structureFound : styles.structureMissing}>{repoAnalysis.structure?.has_build_gradle ? "✓" : "✗"} build.gradle</span>
                  <span style={repoAnalysis.structure?.has_src_main ? styles.structureFound : styles.structureMissing}>{repoAnalysis.structure?.has_src_main ? "✓" : "✗"} src/main</span>
                  <span style={repoAnalysis.structure?.has_src_test ? styles.structureFound : styles.structureMissing}>{repoAnalysis.structure?.has_src_test ? "✓" : "✗"} src/test</span>
                </div>
              </div>
              {repoAnalysis.dependencies && repoAnalysis.dependencies.length > 0 && (
                <div style={styles.dependenciesBox}>
                  <div style={styles.sectionTitle}>📦 Dependencies ({repoAnalysis.dependencies.length})</div>
                  <div style={styles.dependenciesList}>
                    {repoAnalysis.dependencies.slice(0, 5).map((dep, idx) => (
                      <div key={idx} style={styles.dependencyItem}>
                        <span>{dep.group_id}:{dep.artifact_id}</span>
                        <span style={styles.dependencyVersion}>{dep.current_version}</span>
                      </div>
                    ))}
                    {repoAnalysis.dependencies.length > 5 && <div style={styles.moreItems}>+{repoAnalysis.dependencies.length - 5} more</div>}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={styles.infoBox}>
              Repository selected. Analysis will be available when the token is provided.
              <br />
              <button
                style={{ ...styles.secondaryBtn, marginTop: 12 }}
                onClick={() => {
                  setRepoAnalysis(null);
                  setStep(2);
                }}
              >
                ← Go Back to Enter Token
              </button>
            </div>
          )}
        </>
      )}
      <div style={styles.btnRow}>
        <button style={styles.secondaryBtn} onClick={() => setStep(3)}>← Back</button>
        <button style={{ ...styles.primaryBtn, opacity: repoAnalysis ? 1 : 0.5 }} onClick={() => repoAnalysis && setStep(5)} disabled={!repoAnalysis}>
          Continue to Strategy →
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div style={styles.card}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIcon}>📋</span>
        <div>
          <h2 style={styles.title}>Migration Strategy</h2>
          <p style={styles.subtitle}>Define your migration approach and target configuration.</p>
        </div>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Migration Approach</label>
        <div style={styles.radioGroup}>
          {[
            { value: "in-place", label: "In-place Migration", desc: "Modify existing codebase directly" },
            { value: "branch", label: "Branch-based Migration", desc: "Safe parallel track with new branch" },
            { value: "fork", label: "Fork & Migrate", desc: "Create new repository with migrated code" },
          ].map((opt) => (
            <label key={opt.value} style={styles.radioLabel}>
              <input type="radio" name="approach" value={opt.value} checked={migrationApproach === opt.value} onChange={(e) => setMigrationApproach(e.target.value)} style={styles.radio} />
              <div>
                <div style={{ fontWeight: 500 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div style={styles.btnRow}>
        <button style={styles.secondaryBtn} onClick={() => setStep(4)}>← Back</button>
        <button style={styles.primaryBtn} onClick={() => setStep(6)}>Continue to Planning →</button>
      </div>
    </div>
  );

  const renderStep6 = () => {
    // Filter target versions to only show versions higher than source
    const availableTargetVersions = targetVersions.filter(v => parseInt(v.value) > parseInt(selectedSourceVersion));

    return (
      <div style={styles.card}>
        <div style={styles.stepHeader}>
          <span style={styles.stepIcon}>🎯</span>
          <div>
            <h2 style={styles.title}>Migration Planning</h2>
            <p style={styles.subtitle}>Configure Java versions and target settings.</p>
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Source Java Version</label>
            <select style={{ ...styles.select, backgroundColor: "#f9fafb", cursor: "not-allowed" }} value={selectedSourceVersion} disabled>
              {sourceVersions.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
            <p style={styles.helpText}>Source version is auto-detected from your project</p>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Target Java Version</label>
            <select style={styles.select} value={selectedTargetVersion} onChange={(e) => setSelectedTargetVersion(e.target.value)}>
              {availableTargetVersions.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
            <p style={styles.helpText}>Only versions newer than source are available</p>
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Target Repository Name</label>
          <input type="text" style={styles.input} value={targetRepoName} onChange={(e) => setTargetRepoName(e.target.value)} placeholder={`${selectedRepo?.name || "repo"}-migrated`} />
        </div>
        <div style={styles.btnRow}>
          <button style={styles.secondaryBtn} onClick={() => setStep(5)}>← Back</button>
          <button style={styles.primaryBtn} onClick={() => setStep(7)}>Continue to Dependencies →</button>
        </div>
      </div>
    );
  }

  const renderStep7 = () => (
    <div style={styles.card}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIcon}>📦</span>
        <div>
          <h2 style={styles.title}>Dependencies Analysis</h2>
          <p style={styles.subtitle}>Review and plan dependency updates.</p>
        </div>
      </div>
      {repoAnalysis && repoAnalysis.dependencies && repoAnalysis.dependencies.length > 0 && (
        <div style={styles.field}>
          <label style={styles.label}>Detected Dependencies ({repoAnalysis.dependencies.length})</label>
          <div style={styles.dependenciesList}>
            {repoAnalysis.dependencies.slice(0, 10).map((dep, idx) => (
              <div key={idx} style={styles.dependencyItem}>
                <span>{dep.group_id}:{dep.artifact_id}</span>
                <span style={styles.dependencyVersion}>{dep.current_version}</span>
                <span style={{ ...styles.detectedBadge, backgroundColor: dep.status === "analyzing" ? "#fef3c7" : dep.status === "upgraded" ? "#dcfce7" : "#e5e7eb", color: dep.status === "analyzing" ? "#92400e" : dep.status === "upgraded" ? "#166534" : "#6b7280" }}>
                  {dep.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            ))}
            {repoAnalysis.dependencies.length > 10 && <div style={styles.moreItems}>+{repoAnalysis.dependencies.length - 10} more</div>}
          </div>
        </div>
      )}
      <div style={styles.field}>
        <label style={styles.label}>Detected Frameworks & Upgrade Paths</label>
        <div style={styles.frameworkGrid}>
          {[
            { id: "spring", name: "Spring Framework", detected: true },
            { id: "spring-boot", name: "Spring Boot 2.x → 3.x", detected: true },
            { id: "hibernate", name: "Hibernate / JPA", detected: false },
            { id: "junit", name: "JUnit 4 → 5", detected: true },
          ].map((fw) => (
            <label key={fw.id} style={styles.frameworkItem}>
              <input type="checkbox" checked={selectedFrameworks.includes(fw.id)} onChange={() => handleFrameworkToggle(fw.id)} style={styles.checkbox} />
              <span>{fw.name}</span>
              {fw.detected && <span style={styles.detectedBadge}>Detected</span>}
            </label>
          ))}
        </div>
      </div>
      <div style={styles.btnRow}>
        <button style={styles.secondaryBtn} onClick={() => setStep(6)}>← Back</button>
        <button style={styles.primaryBtn} onClick={() => setStep(8)}>Continue to Build & Refactor →</button>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div style={styles.card}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIcon}>🔧</span>
        <div>
          <h2 style={styles.title}>Build Modernization & Refactor</h2>
          <p style={styles.subtitle}>Configure conversions and prepare for migration.</p>
        </div>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Conversion Types</label>
        <div style={styles.conversionGrid}>
          {conversionTypes.map((ct) => (
            <label key={ct.id} style={{ ...styles.conversionItem, border: selectedConversions.includes(ct.id) ? "2px solid #3b82f6" : "2px solid #e5e7eb", backgroundColor: selectedConversions.includes(ct.id) ? "#eff6ff" : "#fff" }}>
              <input type="checkbox" checked={selectedConversions.includes(ct.id)} onChange={() => handleConversionToggle(ct.id)} style={{ display: "none" }} />
              <span style={styles.conversionIcon}>{ct.icon}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{ct.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{ct.description}</div>
              </div>
              {selectedConversions.includes(ct.id) && <span style={styles.checkMark}>✓</span>}
            </label>
          ))}
        </div>
      </div>
      <div style={styles.warningBox}>
        <div style={styles.warningTitle}>⚠️ Common Issues to Watch</div>
        <ul style={styles.warningList}>
          <li><strong>javax.xml.bind</strong> - Missing in Java 11+</li>
          <li><strong>Illegal reflective access</strong> - Warnings become errors</li>
          <li><strong>Internal JDK APIs</strong> - sun.misc.* blocked</li>
          <li><strong>Module system</strong> - JPMS compatibility</li>
        </ul>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Migration Options</label>
        <div style={styles.optionsGrid}>
          <label style={styles.optionItem}>
            <input type="checkbox" checked={runTests} onChange={(e) => setRunTests(e.target.checked)} style={styles.checkbox} />
            <div>
              <div style={{ fontWeight: 500 }}>Run Tests</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Execute test suite after migration</div>
            </div>
          </label>
          <label style={styles.optionItem}>
            <input type="checkbox" checked={runSonar} onChange={(e) => setRunSonar(e.target.checked)} style={styles.checkbox} />
            <div>
              <div style={{ fontWeight: 500 }}>SonarQube Analysis</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Run code quality analysis</div>
            </div>
          </label>
          <label style={styles.optionItem}>
            <input type="checkbox" checked={fixBusinessLogic} onChange={(e) => setFixBusinessLogic(e.target.checked)} style={styles.checkbox} />
            <div>
              <div style={{ fontWeight: 500 }}>Fix Business Logic Issues</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Automatically improve code quality and fix common issues</div>
            </div>
          </label>
        </div>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Email for Migration Report (Optional)</label>
        <input type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" />
        <p style={styles.helpText}>Receive detailed migration report via email upon completion</p>
      </div>
      <div style={styles.btnRow}>
        <button style={styles.secondaryBtn} onClick={() => setStep(7)}>← Back</button>
        <button style={{ ...styles.primaryBtn, opacity: loading ? 0.5 : 1 }} onClick={handleStartMigration} disabled={loading}>
          {loading ? "Starting..." : "Start Migration 🚀"}
        </button>
      </div>
    </div>
  );

  const renderMigrationProgress = () => {
    if (!migrationJob) return null;
    return (
      <div style={styles.card}>
        <div style={styles.stepHeader}>
          <span style={styles.stepIcon}>{migrationJob.status === "completed" ? "✅" : migrationJob.status === "failed" ? "❌" : "⏳"}</span>
          <div>
            <h2 style={styles.title}>{migrationJob.status === "completed" ? "Migration Completed!" : migrationJob.status === "failed" ? "Migration Failed" : "Migration in Progress"}</h2>
            <p style={styles.subtitle}>{migrationJob.current_step || "Processing..."}</p>
          </div>
        </div>
        {migrationJob.status === "failed" && migrationJob.error_message && (
          <div style={styles.errorBox}><strong>Error:</strong> {migrationJob.error_message}</div>
        )}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}><span>Overall Progress</span><span>{migrationJob.progress_percent}%</span></div>
          <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${migrationJob.progress_percent}%` }} /></div>
        </div>
        <div style={styles.statsGrid}>
          <div style={styles.statBox}><div style={styles.statValue}>{migrationJob.files_modified}</div><div style={styles.statLabel}>Files Modified</div></div>
          <div style={styles.statBox}><div style={styles.statValue}>{migrationJob.issues_fixed}</div><div style={styles.statLabel}>Issues Fixed</div></div>
          <div style={styles.statBox}><div style={{ ...styles.statValue, color: migrationJob.total_errors > 0 ? "#ef4444" : "#22c55e" }}>{migrationJob.total_errors}</div><div style={styles.statLabel}>Errors</div></div>
          <div style={styles.statBox}><div style={{ ...styles.statValue, color: migrationJob.total_warnings > 0 ? "#f59e0b" : "#22c55e" }}>{migrationJob.total_warnings}</div><div style={styles.statLabel}>Warnings</div></div>
        </div>
        {migrationJob.status === "completed" && migrationJob.target_repo && (
          <div style={styles.successBox}>
            <div style={styles.successTitle}>🎉 Migration Successful!</div>
            <a href={`https://github.com/${migrationJob.target_repo}`} target="_blank" rel="noreferrer" style={styles.repoLink}>View Migrated Repository →</a>
          </div>
        )}
        <div style={styles.btnRow}>
          {migrationJob.status !== "running" && migrationJob.status !== "pending" && (
            <button style={styles.primaryBtn} onClick={() => setStep(11)}>View Migration Report →</button>
          )}
        </div>
      </div>
    );
  };

  const renderStep11 = () => (
    <div style={styles.card}>
      <div style={styles.stepHeader}>
        <span style={styles.stepIcon}>📄</span>
        <div>
          <h2 style={styles.title}>Migration Report</h2>
          <p style={styles.subtitle}>Complete migration summary with logs and results.</p>
        </div>
      </div>
      {migrationJob && (
        <div style={styles.reportContainer}>
          <div style={styles.reportSection}>
            <h3 style={styles.reportTitle}>📊 Migration Summary</h3>
            <div style={styles.reportGrid}>
              <div style={styles.reportItem}>
                <span style={styles.reportLabel}>Source Repository</span>
                <span style={styles.reportValue}>{migrationJob.source_repo}</span>
              </div>
              <div style={styles.reportItem}>
                <span style={styles.reportLabel}>Target Repository</span>
                <span style={styles.reportValue}>{migrationJob.target_repo || "N/A"}</span>
              </div>
              <div style={styles.reportItem}>
                <span style={styles.reportLabel}>Java Version Migration</span>
                <span style={styles.reportValue}>{migrationJob.source_java_version} → {migrationJob.target_java_version}</span>
              </div>
              <div style={styles.reportItem}>
                <span style={styles.reportLabel}>Files Modified</span>
                <span style={styles.reportValue}>{migrationJob.files_modified}</span>
              </div>
              <div style={styles.reportItem}>
                <span style={styles.reportLabel}>Issues Fixed</span>
                <span style={styles.reportValue}>{migrationJob.issues_fixed}</span>
              </div>
              <div style={styles.reportItem}>
                <span style={styles.reportLabel}>Total Errors</span>
                <span style={{ ...styles.reportValue, color: migrationJob.total_errors > 0 ? "#ef4444" : "#22c55e" }}>{migrationJob.total_errors}</span>
              </div>
            </div>
          </div>

          <div style={styles.reportSection}>
            <h3 style={styles.reportTitle}>🧪 Testing Results</h3>
            <div style={styles.testResults}>
              <div style={styles.testItem}>
                <span>API Endpoints Validated</span>
                <span>{migrationJob.api_endpoints_validated}</span>
              </div>
              <div style={styles.testItem}>
                <span>API Endpoints Working</span>
                <span style={{ color: migrationJob.api_endpoints_working === migrationJob.api_endpoints_validated ? "#22c55e" : "#f59e0b" }}>
                  {migrationJob.api_endpoints_working}/{migrationJob.api_endpoints_validated}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.reportSection}>
            <h3 style={styles.reportTitle}>🔍 Code Quality (SonarQube)</h3>
            <div style={styles.sonarqubeResults}>
              <div style={styles.qualityItem}>
                <span>Quality Gate</span>
                <span style={{ color: migrationJob.sonar_quality_gate === "PASSED" ? "#22c55e" : "#ef4444" }}>
                  {migrationJob.sonar_quality_gate || "N/A"}
                </span>
              </div>
              <div style={styles.qualityItem}>
                <span>Bugs</span>
                <span style={{ color: migrationJob.sonar_bugs > 0 ? "#ef4444" : "#22c55e" }}>{migrationJob.sonar_bugs}</span>
              </div>
              <div style={styles.qualityItem}>
                <span>Vulnerabilities</span>
                <span style={{ color: migrationJob.sonar_vulnerabilities > 0 ? "#ef4444" : "#22c55e" }}>{migrationJob.sonar_vulnerabilities}</span>
              </div>
              <div style={styles.qualityItem}>
                <span>Code Smells</span>
                <span style={{ color: migrationJob.sonar_code_smells > 0 ? "#f59e0b" : "#22c55e" }}>{migrationJob.sonar_code_smells}</span>
              </div>
              <div style={styles.qualityItem}>
                <span>Coverage</span>
                <span>{migrationJob.sonar_coverage}%</span>
              </div>
            </div>
          </div>

          <div style={styles.reportSection}>
            <h3 style={styles.reportTitle}>📋 Migration Logs</h3>
            <div style={styles.logsContainer}>
              {migrationLogs.map((log, index) => (
                <div key={index} style={styles.logEntry}>{log}</div>
              ))}
            </div>
          </div>

          <div style={styles.reportSection}>
            <h3 style={styles.reportTitle}>⚠️ Issues & Errors</h3>
            <div style={styles.issuesContainer}>
              {migrationJob.issues && migrationJob.issues.length > 0 ? (
                migrationJob.issues.slice(0, 10).map((issue) => (
                  <div key={issue.id} style={styles.issueItem}>
                    <div style={styles.issueHeader}>
                      <span style={{ ...styles.issueSeverity, backgroundColor: issue.severity === "error" ? "#fee2e2" : "#fef3c7" }}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span style={styles.issueCategory}>{issue.category}</span>
                      <span style={styles.issueStatus}>{issue.status}</span>
                    </div>
                    <div style={styles.issueMessage}>{issue.message}</div>
                    <div style={styles.issueFile}>{issue.file_path}:{issue.line_number}</div>
                  </div>
                ))
              ) : (
                <div style={styles.noIssues}>No issues found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Download Report Button */}
      <div style={styles.btnRow}>
        <button
          style={{ ...styles.secondaryBtn, marginRight: 10 }}
          onClick={() => {
            if (migrationJob) {
              const reportUrl = `http://localhost:8004/api/migration/${migrationJob.job_id}/report`;
              window.open(reportUrl, '_blank');
            }
          }}
        >
          📥 Download Report
        </button>
        <button
          style={{ ...styles.secondaryBtn, marginRight: 10 }}
          onClick={() => {
            if (migrationJob) {
              const jmeterUrl = `http://localhost:8004/api/migration/${migrationJob.job_id}/jmeter`;
              window.open(jmeterUrl, '_blank');
            }
          }}
        >
          🧪 Download JMeter Test
        </button>
        <button style={styles.primaryBtn} onClick={resetWizard}>Start New Migration</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}><span style={styles.logoIcon}>☕</span><span style={styles.logoText}>Java Migration Accelerator</span></div>
      </div>
      <div style={styles.stepIndicatorContainer}>{renderStepIndicator()}</div>
      <div style={styles.main}>
        {error && <div style={styles.errorBanner}><span>{error}</span><button style={styles.errorClose} onClick={() => setError("")}>×</button></div>}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
        {step === 7 && renderStep7()}
        {step === 8 && renderStep8()}
        {step === 9 && renderMigrationProgress()}
        {step === 10 && renderMigrationProgress()}
        {step === 11 && renderStep11()}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 28 },
  logoText: { fontSize: 20, fontWeight: 600, color: "#1f2937" },
  stepIndicatorContainer: { backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", overflowX: "auto" },
  stepIndicator: { display: "flex", gap: 24, justifyContent: "center", minWidth: "fit-content" },
  stepItem: { display: "flex", alignItems: "center", gap: 8 },
  stepCircle: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 },
  stepLabel: { display: "flex", flexDirection: "column" },
  main: { maxWidth: 900, margin: "32px auto", padding: "0 20px" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  stepHeader: { display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 },
  stepIcon: { fontSize: 32 },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 4, color: "#1f2937" },
  subtitle: { fontSize: 15, color: "#6b7280", margin: 0 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#1f2937", marginBottom: 12, marginTop: 20 },
  field: { marginBottom: 20 },
  label: { fontWeight: 500, fontSize: 14, marginBottom: 8, display: "block", color: "#374151" },
  input: { width: "100%", padding: "12px 14px", fontSize: 15, borderRadius: 8, border: "1px solid #d1d5db", boxSizing: "border-box" },
  select: { width: "100%", padding: "12px 14px", fontSize: 15, borderRadius: 8, border: "1px solid #d1d5db", backgroundColor: "#fff" },
  helpText: { fontSize: 13, color: "#6b7280", marginTop: 8 },
  link: { color: "#3b82f6", textDecoration: "none" },
  infoBox: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 14, color: "#1e40af" },
  warningBox: { backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: 16, marginBottom: 20 },
  warningTitle: { fontWeight: 600, marginBottom: 8, color: "#92400e" },
  warningList: { margin: 0, paddingLeft: 20, fontSize: 14, color: "#78350f" },
  errorBanner: { backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#991b1b" },
  errorClose: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#991b1b" },
  errorBox: { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#991b1b" },
  btnRow: { display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" },
  primaryBtn: { backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontWeight: 600, cursor: "pointer", fontSize: 15 },
  secondaryBtn: { backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, padding: "12px 24px", fontWeight: 500, cursor: "pointer", fontSize: 15 },
  row: { display: "flex", gap: 20 },
  loadingBox: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: 40, color: "#6b7280" },
  spinner: { width: 24, height: 24, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" },
  repoList: { display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" },
  repoItem: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", transition: "all 0.2s" },
  repoIcon: { fontSize: 20 },
  repoInfo: { flex: 1 },
  repoName: { fontWeight: 600, fontSize: 15, color: "#1f2937" },
  repoPath: { fontSize: 13, color: "#6b7280" },
  repoLanguage: { fontSize: 12, padding: "4px 8px", backgroundColor: "#f3f4f6", borderRadius: 4, color: "#6b7280" },
  arrow: { fontSize: 16, color: "#9ca3af" },
  emptyText: { textAlign: "center", color: "#6b7280", padding: 40 },
  selectedRepoBox: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", backgroundColor: "#eff6ff", borderRadius: 8, marginBottom: 20 },
  changeBtn: { marginLeft: "auto", background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 14 },
  riskBadge: { display: "inline-block", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 600, marginBottom: 16 },
  assessmentGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 },
  assessmentItem: { backgroundColor: "#f9fafb", padding: 16, borderRadius: 8, textAlign: "center" },
  assessmentLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  assessmentValue: { fontSize: 15, fontWeight: 600, color: "#1f2937" },
  structureBox: { backgroundColor: "#f9fafb", padding: 16, borderRadius: 8, marginBottom: 20 },
  structureTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12 },
  structureGrid: { display: "flex", gap: 16, flexWrap: "wrap" },
  structureFound: { color: "#22c55e" },
  structureMissing: { color: "#9ca3af" },
  dependenciesBox: { marginBottom: 20 },
  dependenciesList: { backgroundColor: "#f9fafb", borderRadius: 8, padding: 12 },
  dependencyItem: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: 14 },
  dependencyVersion: { color: "#6b7280", fontFamily: "monospace" },
  moreItems: { textAlign: "center", color: "#6b7280", fontSize: 13, paddingTop: 8 },
  radioGroup: { display: "flex", flexDirection: "column", gap: 12 },
  radioLabel: { display: "flex", alignItems: "flex-start", gap: 12, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" },
  radio: { marginTop: 4 },
  checkbox: { width: 18, height: 18, accentColor: "#3b82f6" },
  frameworkGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  frameworkItem: { display: "flex", alignItems: "center", gap: 10, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" },
  detectedBadge: { marginLeft: "auto", fontSize: 11, padding: "2px 8px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: 4 },
  conversionGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  conversionItem: { display: "flex", alignItems: "flex-start", gap: 12, padding: 16, border: "2px solid #e5e7eb", borderRadius: 8, cursor: "pointer", position: "relative" },
  conversionIcon: { fontSize: 24 },
  checkMark: { position: "absolute", top: 8, right: 8, color: "#3b82f6", fontWeight: 600 },
  optionsGrid: { display: "flex", flexDirection: "column", gap: 12 },
  optionItem: { display: "flex", alignItems: "flex-start", gap: 12, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" },
  progressSection: { marginBottom: 24 },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, fontWeight: 500 },
  progressBar: { width: "100%", height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#3b82f6", borderRadius: 4, transition: "width 0.3s ease" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statBox: { backgroundColor: "#f9fafb", padding: 16, borderRadius: 8, textAlign: "center" },
  statValue: { fontSize: 24, fontWeight: 700, color: "#1f2937" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  successBox: { backgroundColor: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: 20, textAlign: "center", marginBottom: 24 },
  successTitle: { fontSize: 18, fontWeight: 600, color: "#166534", marginBottom: 12 },
  repoLink: { display: "inline-block", color: "#3b82f6", fontWeight: 600, textDecoration: "none", fontSize: 15 },
  connectionModes: { display: "flex", gap: 16, marginBottom: 24 },
  modeButton: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20, border: "2px solid #e5e7eb", borderRadius: 12, backgroundColor: "#fff", cursor: "pointer", transition: "all 0.2s" },
  modeButtonActive: { border: "2px solid #3b82f6", backgroundColor: "#eff6ff" },
  modeIcon: { fontSize: 32 },
  modeTitle: { fontWeight: 600, fontSize: 15 },
  modeDesc: { fontSize: 12, color: "#6b7280", textAlign: "center" },
  fileList: { display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "8px 12px", backgroundColor: "#f9fafb", borderRadius: 6 },
  backBtn: { background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 14 },
  fileItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", transition: "all 0.2s" },
  fileIcon: { fontSize: 20 },
  fileInfo: { flex: 1 },
  fileName: { fontWeight: 500, fontSize: 15, color: "#1f2937" },
  filePath: { fontSize: 13, color: "#6b7280" },
  fileSize: { fontSize: 12, color: "#6b7280" },
  discoveryContent: { display: "flex", flexDirection: "column", gap: 16 },
  discoveryItem: { display: "flex", alignItems: "center", gap: 16, padding: 16, backgroundColor: "#f9fafb", borderRadius: 8 },
  discoveryIcon: { fontSize: 24 },
  discoveryTitle: { fontSize: 16, fontWeight: 600, color: "#1f2937", marginBottom: 4 },
  discoveryDesc: { fontSize: 14, color: "#6b7280" },
  reportContainer: { display: "flex", flexDirection: "column", gap: 24 },
  reportSection: { backgroundColor: "#f9fafb", borderRadius: 8, padding: 20 },
  reportTitle: { fontSize: 18, fontWeight: 600, color: "#1f2937", marginBottom: 16 },
  reportGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 },
  reportItem: { display: "flex", flexDirection: "column", gap: 4 },
  reportLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  reportValue: { fontSize: 14, color: "#1f2937", fontWeight: 600 },
  testResults: { display: "flex", flexDirection: "column", gap: 12 },
  testItem: { display: "flex", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#fff", borderRadius: 6, border: "1px solid #e5e7eb" },
  sonarqubeResults: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  qualityItem: { display: "flex", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#fff", borderRadius: 6, border: "1px solid #e5e7eb" },
  logsContainer: { backgroundColor: "#000", color: "#0f0", fontFamily: "monospace", padding: 16, borderRadius: 6, maxHeight: 300, overflowY: "auto", fontSize: 12, lineHeight: 1.4 },
  logEntry: { marginBottom: 4 },
  issuesContainer: { display: "flex", flexDirection: "column", gap: 12 },
  issueItem: { padding: 16, backgroundColor: "#fff", borderRadius: 6, border: "1px solid #e5e7eb" },
  issueHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
  issueSeverity: { padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, color: "#fff" },
  issueCategory: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  issueStatus: { fontSize: 12, color: "#22c55e", fontWeight: 500 },
  issueMessage: { fontSize: 14, color: "#1f2937", marginBottom: 4 },
  issueFile: { fontSize: 12, color: "#6b7280", fontFamily: "monospace" },
  noIssues: { textAlign: "center", color: "#6b7280", padding: 20 },
};

