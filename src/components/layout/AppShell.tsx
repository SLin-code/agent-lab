import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="AgentPath 首页">
          <span className="brand-mark" aria-hidden="true">
            A
          </span>
          <span>AgentPath</span>
          <span className="brand-subtitle">Agent 通识课</span>
        </Link>
        <nav className="top-nav" aria-label="主导航">
          <NavLink to="/">学习路径</NavLink>
          <a
            href="https://github.com/buynao/aipath"
            target="_blank"
            rel="noreferrer"
          >
            灵感来源
          </a>
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <span>AgentPath · 用实验理解 Agent 系统</span>
        <span>Stable principles, evolving implementations.</span>
      </footer>
    </div>
  );
}
