
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export const NavLinks = () => {
  const { pathname } = useLocation();
  
  const navLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-4 w-4 mr-1" />
    },
    {
      title: "Processos",
      href: "/processes",
      icon: <ClipboardList className="h-4 w-4 mr-1" />
    }
  ];
  
  return (
    <div className="hidden md:flex items-center space-x-1">
      {navLinks.map(link => (
        <Link
          key={link.href}
          to={link.href}
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === link.href
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary"
          )}
        >
          {link.icon}
          <span>{link.title}</span>
        </Link>
      ))}
    </div>
  );
};
