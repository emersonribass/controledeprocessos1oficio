
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { NavbarBrand } from "./NavbarBrand";
import { NavLinks } from "./NavLinks";
import { AdminMenu } from "./AdminMenu";
import { NotificationsButton } from "./NotificationsButton";
import { UserMenu } from "./UserMenu";

const Navbar = () => {
  const { user, checkAdminStatus } = useAuth();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (user && user.email) {
        try {
          const adminStatus = await checkAdminStatus(user.email);
          setUserIsAdmin(adminStatus);
        } catch (error) {
          console.error("Erro ao verificar status de administrador:", error);
          setUserIsAdmin(false);
        }
      } else {
        setUserIsAdmin(false);
      }
    };
    
    verifyAdminStatus();
  }, [user, checkAdminStatus]);

  return (
    <nav className="bg-white border-b border-border h-14 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <NavbarBrand />
        <NavLinks />
        <AdminMenu isAdmin={userIsAdmin} />
      </div>

      <div className="flex items-center space-x-4">
        <NotificationsButton />
        <UserMenu user={user} />
      </div>
    </nav>
  );
};

export default Navbar;
