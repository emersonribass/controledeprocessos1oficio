
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Users, Settings, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

type SidebarLink = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const Sidebar = () => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const links: SidebarLink[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Processos",
      href: "/processes",
      icon: <ClipboardList className="h-5 w-5" />,
    },
  ];

  // Admin-only links
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

  // Check if user has admin access
  const isAdmin = user?.email === "admin@nottar.com";

  return (
    <aside
      className={cn(
        "bg-white border-r border-border transition-all duration-300 h-[calc(100vh-3.5rem)]",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="px-3 py-4 h-full flex flex-col">
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-6 w-6"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="space-y-1 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {link.icon}
              {!collapsed && <span>{link.title}</span>}
            </Link>
          ))}

          {isAdmin && (
            <>
              <Separator className="my-4" />
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {link.icon}
                  {!collapsed && <span>{link.title}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="mt-auto">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2",
              collapsed && "justify-center"
            )}
          >
            {!collapsed && (
              <div className="text-xs text-muted-foreground">
                Nottar v1.0.0
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
