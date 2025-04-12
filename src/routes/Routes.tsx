
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { ProcessesProvider } from "@/features/processes";
import React, { useEffect, useState } from "react";

// Importações necessárias para resolver os erros
import Layout from "@/components/Layout/Layout";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import ProcessesPage from "@/pages/ProcessesPage";
import ProcessDetailsPage from "@/pages/ProcessDetailsPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminDepartmentsPage from "@/pages/AdminDepartmentsPage";
import AdminProcessSettingsPage from "@/pages/AdminProcessSettingsPage";
import AdminProcessTypesPage from "@/pages/AdminProcessTypesPage";
import NotFound from "@/pages/NotFound";
import ChangePasswordPage from "@/pages/ChangePasswordPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  needsProcesses?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false, 
  needsProcesses = true 
}) => {
  const { user, isLoading, isAdmin } = useAuth();
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && user.email) {
        try {
          const adminStatus = await isAdmin(user.email);
          setIsUserAdmin(adminStatus);
        } catch (error) {
          console.error("Erro ao verificar status de administrador:", error);
          setIsUserAdmin(false);
        } finally {
          setIsCheckingAdmin(false);
        }
      } else {
        setIsUserAdmin(false);
        setIsCheckingAdmin(false);
      }
    };
    
    if (user) {
      checkAdminStatus();
    } else {
      setIsCheckingAdmin(false);
    }
  }, [user, isAdmin]);
  
  if (isLoading || (adminOnly && isCheckingAdmin)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isUserAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (needsProcesses) {
    return (
      <ProcessesProvider>
        {children}
      </ProcessesProvider>
    );
  }
  
  return <>{children}</>;
};

export const Routes = () => {
  console.log("Renderizando Routes");
  return (
    <RouterRoutes>
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

        <Route path="alterar-senha" element={
          <ProtectedRoute needsProcesses={false}>
            <ChangePasswordPage />
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
    </RouterRoutes>
  );
};
