
import { supabase } from "@/integrations/supabase/client";
import { Database, Tables } from "@/integrations/supabase/schema";

export function useSupabase() {
  // Setores
  const getSetores = () => {
    return supabase
      .from("setores")
      .select("*")
      .order("order_num", { ascending: true });
  };

  const updateSetor = (id: number, data: Partial<Tables["setores"]>) => {
    return supabase.from("setores").update(data).eq("id", id);
  };

  const deleteSetor = (id: number) => {
    return supabase.from("setores").delete().eq("id", id);
  };

  const createSetor = (data: Omit<Tables["setores"], "id">) => {
    return supabase.from("setores").insert(data);
  };

  // Usuários
  const getUsuarios = () => {
    return supabase.from("usuarios").select("*");
  };

  const getUsuarioById = (id: string) => {
    return supabase.from("usuarios").select("*").eq("id", id).single();
  };

  const getUsuarioByEmail = (email: string) => {
    return supabase.from("usuarios").select("*").eq("email", email).single();
  };

  const updateUsuario = (id: string, data: Partial<Tables["usuarios"]>) => {
    return supabase.from("usuarios").update(data).eq("id", id);
  };

  const createUsuario = (data: Tables["usuarios"]) => {
    return supabase.from("usuarios").insert(data);
  };

  // Processos
  const getProcessos = () => {
    return supabase.from("processos").select("*");
  };

  const getProcessoById = (id: string) => {
    return supabase.from("processos").select("*").eq("id", id).single();
  };

  const updateProcesso = (id: string, data: Partial<Tables["processos"]>) => {
    return supabase.from("processos").update(data).eq("id", id);
  };

  const createProcesso = (data: Omit<Tables["processos"], "id">) => {
    return supabase.from("processos").insert(data);
  };

  const deleteProcesso = (id: string) => {
    return supabase.from("processos").delete().eq("id", id);
  };

  // Histórico de processos
  const getProcessoHistorico = (processoId: string) => {
    return supabase
      .from("processos_historico")
      .select("*")
      .eq("processo_id", processoId)
      .order("data_entrada", { ascending: true });
  };

  const createProcessoHistorico = (data: Omit<Tables["processos_historico"], "id">) => {
    return supabase.from("processos_historico").insert(data);
  };

  const updateProcessoHistorico = (id: number, data: Partial<Tables["processos_historico"]>) => {
    return supabase.from("processos_historico").update(data).eq("id", id);
  };

  // Notificações
  const getNotificacoes = (usuarioId: string) => {
    return supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("data_criacao", { ascending: false });
  };

  const createNotificacao = (data: Omit<Tables["notificacoes"], "id">) => {
    return supabase.from("notificacoes").insert(data);
  };

  const updateNotificacao = (id: string, data: Partial<Tables["notificacoes"]>) => {
    return supabase.from("notificacoes").update(data).eq("id", id);
  };

  // Responsáveis por setor
  const getSetorResponsaveis = (processoId: string, setorId: string) => {
    return supabase
      .from("setor_responsaveis")
      .select("*")
      .eq("processo_id", processoId)
      .eq("setor_id", setorId);
  };

  const createSetorResponsavel = (data: Omit<Tables["setor_responsaveis"], "id">) => {
    return supabase.from("setor_responsaveis").insert(data);
  };

  const updateSetorResponsavel = (id: string, data: Partial<Tables["setor_responsaveis"]>) => {
    return supabase.from("setor_responsaveis").update(data).eq("id", id);
  };

  return {
    getSetores,
    updateSetor,
    deleteSetor,
    createSetor,
    getUsuarios,
    getUsuarioById,
    getUsuarioByEmail,
    updateUsuario,
    createUsuario,
    getProcessos,
    getProcessoById,
    updateProcesso,
    createProcesso,
    deleteProcesso,
    getProcessoHistorico,
    createProcessoHistorico,
    updateProcessoHistorico,
    getNotificacoes,
    createNotificacao,
    updateNotificacao,
    getSetorResponsaveis,
    createSetorResponsavel,
    updateSetorResponsavel,
  };
}
