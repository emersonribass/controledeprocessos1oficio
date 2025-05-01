
import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UsuarioSupabase, FormUsuario } from "@/types/usuario";
import { supabaseService } from "@/services/supabase";

// Tempo de validade do cache em milissegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSupabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSupabase | null>(null);
  const { toast } = useToast();
  
  // Referências para controle de cache
  const cacheRef = useRef<{
    data: UsuarioSupabase[];
    timestamp: number;
  } | null>(null);
  
  // Controle para evitar múltiplas requisições simultâneas
  const loadingRef = useRef(false);

  const fetchUsuarios = useCallback(async (forceRefresh = false) => {
    // Verificar se já existe uma requisição em andamento
    if (loadingRef.current) {
      console.log("Já existe uma requisição em andamento. Ignorando nova solicitação.");
      return;
    }
    
    // Verificar se temos dados em cache válidos
    const now = Date.now();
    if (!forceRefresh && cacheRef.current && (now - cacheRef.current.timestamp < CACHE_TTL)) {
      console.log("Usando dados em cache para 'usuarios'");
      setUsuarios(cacheRef.current.data);
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log("Iniciando busca de usuários na tabela 'usuarios' do projeto controledeprocessos1oficio");
      const supabaseUrl = supabaseService.getUrl();
      console.log("URL do Supabase:", supabaseUrl);
      
      const { data, error, count } = await supabaseService.fetchUsuarios();

      if (error) {
        throw error;
      }

      console.log(`Encontrados ${count} usuários na tabela 'usuarios':`, data);
      
      if (!data || data.length === 0) {
        console.log("Nenhum usuário encontrado na tabela 'usuarios'. Verificando auth.users...");
        
        try {
          const { data: authUsers, error: authError } = await supabaseService.checkAuthUsers();
          
          if (authError) {
            console.error("Erro ao buscar usuários autenticados:", authError);
          } else if (authUsers && authUsers.users && authUsers.users.length > 0) {
            console.log(`Encontrados ${authUsers.users.length} usuários no sistema de autenticação.`);
            console.log("É necessário sincronizar usuários do auth.users para a tabela 'usuarios'");
          } else {
            console.log("Nenhum usuário encontrado no sistema de autenticação.");
          }
        } catch (authError) {
          console.log("Não foi possível verificar usuários no sistema de autenticação:", authError);
        }
      }

      // Atualizar o cache e o estado
      const usuariosData = data as UsuarioSupabase[] || [];
      setUsuarios(usuariosData);
      
      // Guardar no cache
      cacheRef.current = {
        data: usuariosData,
        timestamp: now
      };
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [toast]);

  // Carregar usuários na montagem do componente
  useEffect(() => {
    fetchUsuarios();
    
    // Limpar o cache na desmontagem
    return () => {
      cacheRef.current = null;
    };
  }, [fetchUsuarios]);

  const handleToggleAtivo = async (usuario: UsuarioSupabase) => {
    try {
      const { error } = await supabaseService.toggleUsuarioAtivo(usuario.id, usuario.ativo);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso!`,
      });

      // Forçar atualização do cache após modificação
      await fetchUsuarios(true);
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    try {
      const { error } = await supabaseService.deleteUsuario(id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

      // Forçar atualização do cache após modificação
      await fetchUsuarios(true);
      return true;
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveUsuario = async (data: FormUsuario, usuarioId?: string) => {
    try {
      if (usuarioId) {
        const updateData: Partial<UsuarioSupabase> = {
          nome: data.nome,
          email: data.email,
          ativo: data.ativo,
          setores_atribuidos: data.setores_atribuidos,
          perfil: data.perfil,
        };

        if (data.senha) {
          updateData.senha = data.senha;
        }

        const { error } = await supabaseService.updateUsuario(usuarioId, updateData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
      } else {
        const { error } = await supabaseService.createUsuario({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          ativo: data.ativo,
          setores_atribuidos: data.setores_atribuidos,
          perfil: data.perfil,
        });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
        });
      }

      // Forçar atualização do cache após modificação
      await fetchUsuarios(true);
      return true;
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
      return false;
    }
  };

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
