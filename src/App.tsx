import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/dashboard";
import DashboardBuilderPage from "./pages/dashboard/builder";
import DashboardPreviewPage from "./pages/dashboard/preview";
import ProfileCompletionPage from "./pages/dashboard/profile-completion";
import PublicPortfolioPage from "./pages/PublicPortfolioPage";
import AuthCallback from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/route/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/auth/callback"
        element={
          <ProtectedRoute>
            <AuthCallback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <ProfileCompletionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/builder"
        element={
          <ProtectedRoute>
            <DashboardBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/preview"
        element={
          <ProtectedRoute>
            <DashboardPreviewPage />
          </ProtectedRoute>
        }
      />
      <Route path="/:username" element={<PublicPortfolioPage />} />
    </Routes>
  );
};

export default App;
