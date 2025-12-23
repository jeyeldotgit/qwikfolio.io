import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthSessionProvider } from "@/hooks/useAuthSession";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthSessionProvider>
        <App />
        <Toaster />
      </AuthSessionProvider>
    </BrowserRouter>
  </StrictMode>
);
