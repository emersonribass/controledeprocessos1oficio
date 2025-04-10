
import { useState } from "react";
import { UsuarioSupabase } from "@/types/usuario";
import { useUsuariosFetch } from "./usuarios/useUsuariosFetch";
import { useUsuariosOperations } from "./usuarios/useUsuariosOperations";

export function useUsuarios() {
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSupabase | null>(null);
  const { usuarios, isLoading, fetchUsuarios } = useUsuariosFetch();
  const { handleToggleAtivo, handleDeleteUsuario, saveUsuario } = useUsuariosOperations();

  return {
    usuarios,
    isLoading,
    usuarioAtual,
    setUsuarioAtual,
    fetchUsuarios,
    handleToggleAtivo,
    handleDeleteUsuario,
    saveUsuario
  };
}
