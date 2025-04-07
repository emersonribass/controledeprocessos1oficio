import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProcessesProvider } from "@/hooks/useProcesses";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

import Layout from "@/components/Layout/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ProcessesPage from "./pages/ProcessesPage";
import ProcessDetailsPage from "./pages/ProcessDetailsPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

import AdminUsersPage from "./pages/AdminUsersPage";
import AdminDepartmentsPage from "./pages/AdminDepartmentsPage";
import AdminProcessSettingsPage from "./pages/AdminProcessSettingsPage";
import AdminProcessTypesPage from "./pages/AdminProcessTypesPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false, needsProcesses = true }: { children: React.ReactNode, adminOnly?: boolean, needsProcesses?: boolean }) => {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin(user.email)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (needsProcesses) {
    return (
      <ProcessesProvider>
        {children}
      </ProcessesProvider>
    );
  }
  
  return children;
};

const AppRoutes = () => {
  console.log("Renderizando AppRoutes");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="login" element={<LoginPage />} />
          
          <Route path="dashboard" element={
            <ProtectedRoute needsProcesses={false}>
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

          <Route path="admin/users" element={
            <ProtectedRoute adminOnly={true}>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          
          <Route path="admin/departments" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDepartmentsPage />
            </ProtectedRoute>
          } />
          
          <Route path="admin/process-settings" element={
            <ProtectedRoute adminOnly={true}>
              <AdminProcessSettingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="admin/process-types" element={
            <ProtectedRoute adminOnly={true}>
              <AdminProcessTypesPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  console.log("Renderizando App");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
