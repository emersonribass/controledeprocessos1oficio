
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "@/features/auth";
import { NotificationsProvider } from "@/hooks/NotificationsProvider";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";
import { toast } from "sonner";
import { useEffect } from "react";

// Componente de apresentação pura
export const LayoutPresentation = ({
  isLoading,
  hasUser,
  children
}: {
  isLoading: boolean;
  hasUser: boolean;
  children: React.ReactNode;
}) => {
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasUser) {
    return <>{children}</>;
  }

  return (
    <NotificationsProvider>
      <div className="h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <ErrorBoundary 
            onError={(error) => {
              toast.error("Ocorreu um erro", {
                description: "Um erro inesperado aconteceu na aplicação.",
                duration: 5000,
              });
            }}
          >
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </NotificationsProvider>
  );
};

// Componente container que gerencia a lógica
const Layout = () => {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("Layout renderizado. User:", !!user, "isLoading:", isLoading);
  }, [user, isLoading]);

  return (
    <LayoutPresentation 
      isLoading={isLoading} 
      hasUser={!!user}
    >
      <Outlet />
    </LayoutPresentation>
  );
};

export default Layout;
