
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProcessesProvider } from "@/hooks/useProcesses";
import { NotificationsProvider } from "@/hooks/useNotifications";

import Layout from "@/components/Layout/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ProcessesPage from "./pages/ProcessesPage";
import ProcessDetailsPage from "./pages/ProcessDetailsPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("user") !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProcessesProvider>
        <NotificationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="login" element={<LoginPage />} />
                  
                  {/* Protected routes */}
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="processes" element={
                    <ProtectedRoute>
                      <ProcessesPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="processes/:id" element={
                    <ProtectedRoute>
                      <ProcessDetailsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="users" element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationsProvider>
      </ProcessesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
