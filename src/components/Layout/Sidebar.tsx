import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Users, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth";

type SidebarLink = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const Sidebar = () => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAdmin } = useAuth();
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar status de administrador apenas quando o usuário mudar
    const checkAdminStatus = async () => {
      if (user && user.email) {
        try {
          const adminStatus = await isAdmin(user.email);
          setUserIsAdmin(adminStatus);
        } catch (error) {
          console.error("Erro ao verificar status de administrador:", error);
          setUserIsAdmin(false);
        }
      } else {
        setUserIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user, isAdmin]);

  const links: SidebarLink[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Processos",
      href: "/processes",
      icon: <ClipboardList className="h-5 w-5" />,
    },
  ];

  const adminLinks: SidebarLink[] = [
    {
      title: "Usuários",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-b border-border transition-all duration-300",
        collapsed ? "h-14" : "h-auto"
      )}
    >
      <div className="px-4 py-2 w-full">
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-6 w-6"
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!collapsed && (
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {link.icon}
                <span>{link.title}</span>
              </Link>
            ))}

            {userIsAdmin && (
              <>
                <Separator orientation="vertical" className="h-8 mx-2" />
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {link.icon}
                    <span>{link.title}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>
        )}

        {!collapsed && (
          <div className="mt-2 text-xs text-muted-foreground">
            Nottar v1.0.0
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
