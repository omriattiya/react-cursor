import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CursorProvider } from "@omriattiya/react-cursor";
import { App } from "./App";
import "./playground.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CursorProvider>
      <App />
    </CursorProvider>
  </StrictMode>,
);
