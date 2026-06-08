import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Boot splash is rendered in index.html before JS loads.
// This file just mounts React and fades the splash out.

const root = document.getElementById("root")!;

requestAnimationFrame(() => {
  createRoot(root).render(
    <StrictMode>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0F0A2E",
            }}
          />
        }
      >
        <App />
      </Suspense>
    </StrictMode>,
  );

  // Fade out the HTML boot splash smoothly
  setTimeout(() => {
    const boot = document.getElementById("__geton_boot");
    if (boot) {
      boot.style.transition = "opacity 0.3s ease";
      boot.style.opacity = "0";
      setTimeout(() => boot.remove(), 350);
    }
  }, 80);
});

// Service worker for offline + faster repeat visits (production only)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-critical
    });
  });
}
