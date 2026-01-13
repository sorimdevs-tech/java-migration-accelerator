import React from "react";

const shellStyles: { [key: string]: React.CSSProperties } = {
  root: {
    minHeight: "100vh",
    width: "100%",
    margin: 0,
    padding: 0,
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 32px",
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  main: {
    flex: 1,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  content: {
    width: "100%",
    margin: 0,
    padding: 0,
  },
  footer: {
    background: "#fff",
    borderTop: "1px solid #e2e8f0",
    padding: "16px 32px",
    fontSize: 13,
    width: "100%",
    boxSizing: "border-box",
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#64748b",
  },
};

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={shellStyles.root}>
    <header style={shellStyles.header}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28 }}>☕</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Java Migration Accelerator</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="https://github.com" target="_blank" rel="noopener" style={{ color: "#64748b", textDecoration: "none", fontSize: 14 }}>Documentation</a>
        <a href="https://github.com" target="_blank" rel="noopener" style={{ color: "#64748b", textDecoration: "none", fontSize: 14 }}>GitHub</a>
      </div>
    </header>

    <main style={shellStyles.main}>
      <div style={shellStyles.content}>
        {children}
      </div>
    </main>

    <footer style={shellStyles.footer}>
      <div style={shellStyles.footerContent}>
        <span>Java Migration Accelerator v1.0</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  </div>
);

export default AppShell;