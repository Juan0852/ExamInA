import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "./app/providers";
import { AppRouter } from "./app/router";
import { AppErrorBoundary } from "./shared/components/AppErrorBoundary";
import "./index.css";

// Buscamos el nodo contenedor del DOM definido en index.html
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento root en el DOM.");
}

// Montamos la aplicación React envuelta en StrictMode para detectar fallas tempranas
createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </AppErrorBoundary>
  </StrictMode>
);
