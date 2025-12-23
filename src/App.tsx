import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/dashboard";
import DashboardBuilderPage from "./pages/dashboard/builder";
import DashboardPreviewPage from "./pages/dashboard/preview";
import ProfileCompletionPage from "./pages/dashboard/profile-completion";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/onboarding" element={<ProfileCompletionPage />} />
      <Route path="/dashboard/builder" element={<DashboardBuilderPage />} />
      <Route path="/dashboard/preview" element={<DashboardPreviewPage />} />
    </Routes>
  );
};

export default App;
