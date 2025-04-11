
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const NavbarBrand = () => {
  return (
    <Link to="/" className="flex items-center mr-6">
      <div className="flex items-center">
        <img src="/favicon.png" alt="Logo Nottar" className="h-12 mr-0 object-scale-down" />
        <Separator orientation="vertical" className="h-8 mx-5" />
        <span className="text-amber-950 text-lg font-semibold">Controle de Processos</span>
      </div>
    </Link>
  );
};
