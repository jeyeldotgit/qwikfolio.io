import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/dashboard";
import DashboardBuilderPage from "./pages/dashboard/builder";
import DashboardPreviewPage from "./pages/dashboard/preview";

const app = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/builder" element={<DashboardBuilderPage />} />
      <Route path="/dashboard/preview" element={<DashboardPreviewPage />} />
    </Routes>
  );
};

export default app;
