
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/auth";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { UserProfileProvider } from "@/hooks/auth/UserProfileContext";

const Layout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Outlet />;
  }

  return (
    <UserProfileProvider>
      <NotificationsProvider>
        <div className="h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            <Outlet />
          </main>
        </div>
      </NotificationsProvider>
    </UserProfileProvider>
  );
};

export default Layout;
