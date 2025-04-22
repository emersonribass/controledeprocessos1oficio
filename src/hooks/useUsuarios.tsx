import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UsuarioSupabase, FormUsuario } from "@/types/usuario";
import { supabaseService } from "@/services/supabase";

// Tempo de validade do cache em milissegundos (10 minutos)
const CACHE_TTL = 10 * 60 * 1000;

// Sistema de deduplicação de requisições
let pendingFetchPromise: Promise<UsuarioSupabase[]> | null = null;
let lastFetchTimestamp = 0;
const DEBOUNCE_TIME = 300; // 300ms de debounce

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
  
  // Timeout para debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsuarios = useCallback(async (forceRefresh = false) => {
    // Implementar debounce para evitar múltiplas chamadas em sequência rápida
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    return new Promise<UsuarioSupabase[]>((resolve) => {
      debounceTimeoutRef.current = setTimeout(async () => {
        const now = Date.now();
        
        // Verificar se já existe uma requisição em andamento
        if (pendingFetchPromise && now - lastFetchTimestamp < 5000) {
          const result = await pendingFetchPromise;
          resolve(result);
          return;
        }
        
        // Verificar se temos dados em cache válidos
        if (!forceRefresh && cacheRef.current && (now - cacheRef.current.timestamp < CACHE_TTL)) {
          console.log("Usando dados em cache para 'usuarios'");
          setUsuarios(cacheRef.current.data);
          resolve(cacheRef.current.data);
          return;
        }

        setIsLoading(true);
        
        // Criar uma promessa para a requisição atual
        const fetchPromise = (async () => {
          try {
            console.log("Iniciando busca de usuários na tabela 'usuarios' do projeto controledeprocessos1oficio");
            const supabaseUrl = supabaseService.getUrl();
            console.log("URL do Supabase:", supabaseUrl);
            
            const { data, error, count } = await supabaseService.fetchUsuarios();

            if (error) {
              throw error;
            }

            console.log(`Encontrados ${count} usuários na tabela 'usuarios'`);
            
            // Atualizar o cache e o estado
            const usuariosData = data as UsuarioSupabase[] || [];
            setUsuarios(usuariosData);
            
            // Guardar no cache
            cacheRef.current = {
              data: usuariosData,
              timestamp: now
            };
            
            return usuariosData;
          } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            toast({
              title: "Erro",
              description: "Não foi possível carregar a lista de usuários.",
              variant: "destructive",
            });
            return [] as UsuarioSupabase[];
          } finally {
            setIsLoading(false);
            // Limpar a promessa pendente
            if (pendingFetchPromise === fetchPromise) {
              pendingFetchPromise = null;
            }
          }
        })();
        
        // Armazenar a promessa e o timestamp
        pendingFetchPromise = fetchPromise;
        lastFetchTimestamp = now;
        
        const result = await fetchPromise;
        resolve(result);
      }, DEBOUNCE_TIME);
    });
  }, [toast]);

  // Carregar usuários na montagem do componente, mas apenas se não tivermos cache
  useEffect(() => {
    if (!cacheRef.current) {
      fetchUsuarios();
    }
    
    // Limpar o cache e timeouts na desmontagem
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
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
