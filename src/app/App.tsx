import { useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { HomePage } from "../pages/HomePage";
import { LessonPage } from "../pages/LessonPage";
import { NotFoundPage } from "../pages/NotFoundPage";

function RouteEffects() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const heading = document.querySelector<HTMLElement>("main h1");
    if (heading) {
      heading.dataset.routeFocus = "true";
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      const title = heading.textContent?.replace(/\s+/g, " ").trim();
      document.title = title ? `${title} · AgentPath` : "AgentPath · Agent 通识课";
    }
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <AppShell>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lesson/:slug" element={<LessonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
