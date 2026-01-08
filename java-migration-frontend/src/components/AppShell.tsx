import React from "react";
import Sidebar from "./Sidebar";

const shellStyles: { [key: string]: React.CSSProperties } = {
  root: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    height: 64,
    background: "#fff",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    padding: "0 32px",
    justifyContent: "space-between",
    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
    zIndex: 10,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    fontSize: 20,
    color: "#2563eb",
    letterSpacing: "-0.01em",
  },
  navLogo: {
    fontSize: 28,
    color: "#2563eb",
    marginRight: 4,
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  navLink: {
    color: "#334155",
    fontWeight: 500,
    fontSize: 15,
    textDecoration: "none",
    padding: "4px 0",
    borderRadius: 2,
    transition: "color 0.2s, background 0.2s",
  },
  navLinkActive: {
    color: "#2563eb",
    background: "#e3f2fd",
    borderBottom: "2px solid #2563eb",
    paddingBottom: 2,
  },
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "32px 0 24px 0",
  },
  content: {
    width: "100%",
    maxWidth: 900,
    minHeight: 500,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    padding: "32px 24px",
  },
  footer: {
    background: "#fff",
    borderTop: "1px solid #e0e0e0",
    textAlign: "center",
    padding: "16px 0 10px 0",
    color: "#64748b",
    fontSize: 13,
    letterSpacing: "0.01em",
  },
};

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={shellStyles.root}>
    <nav style={shellStyles.nav}>
      <div style={shellStyles.navBrand}>
        <span style={shellStyles.navLogo}>☕</span>
        Java Migration Accelerator
      </div>
      <div style={shellStyles.navLinks}>
        <a href="#" style={shellStyles.navLink}>Docs</a>
        <a href="#" style={shellStyles.navLink}>Support</a>
        <a href="#" style={shellStyles.navLink}>Contact</a>
      </div>
    </nav>
    <div style={{ display: "flex", flex: 1, background: "#f8fafc" }}>
      <Sidebar />
      <main style={shellStyles.main}>
        <div style={shellStyles.content}>{children}</div>
      </main>
    </div>
    <footer style={shellStyles.footer}>
      &copy; {new Date().getFullYear()} Java Migration Accelerator &mdash; All rights reserved.
    </footer>
  </div>
);

export default AppShell;
