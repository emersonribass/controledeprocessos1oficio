
import { useState, useEffect } from "react";
import { useUsuarios } from "@/hooks/useUsuarios";

export const useAvailableUsers = () => {
  const { usuarios, fetchUsuarios } = useUsuarios();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsuarios();
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [fetchUsuarios]);

  return {
    usuarios: usuarios.filter(user => user.ativo),
    isLoading
  };
};
