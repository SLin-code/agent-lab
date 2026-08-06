import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./app/App";
import { ProgressProvider } from "./app/ProgressContext";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/learning-output.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </HashRouter>
  </StrictMode>,
);
