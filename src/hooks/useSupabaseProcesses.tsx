
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";
import { useProcessMoveNext } from "./process-movement/useProcessMoveNext";
import { useProcessMovePrevious } from "./process-movement/useProcessMovePrevious";
import { useProcessDelete } from "./process-movement/useProcessDelete";
import { useStartProcess } from "./process-movement/useStartProcess";
import { useProcessesFetch } from "./useProcessesFetch";
import { supabaseService } from "@/services/supabase";

export const useSupabaseProcesses = () => {
  const { processes, isLoading, fetchProcesses, setProcesses } = useProcessesFetch();
  
  // Instanciar os hooks de movimento
  const { moveProcessToNextDepartment: moveNext } = useProcessMoveNext(fetchProcesses);
  const { moveProcessToPreviousDepartment: movePrevious } = useProcessMovePrevious(fetchProcesses);
  const { startProcess: start } = useStartProcess(fetchProcesses);
  const { deleteProcess: deleteP, deleteManyProcesses: deleteMany } = useProcessDelete(fetchProcesses);

  // Adaptador para garantir que a função retorne um boolean como esperado
  const moveProcessToNextDepartment = async (processId: string): Promise<boolean> => {
    try {
      return await moveNext(processId);
    } catch (error) {
      console.error("Erro ao mover processo para o próximo departamento:", error);
      return false;
    }
  };

  const moveProcessToPreviousDepartment = async (processId: string): Promise<boolean> => {
    try {
      return await movePrevious(processId);
    } catch (error) {
      console.error("Erro ao mover processo para o departamento anterior:", error);
      return false;
    }
  };

  const startProcess = async (processId: string): Promise<boolean> => {
    try {
      return await start(processId);
    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
      return false;
    }
  };

  const updateProcessType = async (processId: string, newTypeId: string): Promise<void> => {
    try {
      const { error } = await supabaseService.updateProcessTypeById(processId, newTypeId);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      setProcesses(processes.map(process =>
        process.id === processId ? { ...process, processType: newTypeId } : process
      ));
    } catch (error) {
      console.error("Erro ao atualizar o tipo de processo:", error);
    }
  };

  const updateProcessStatus = async (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado'): Promise<void> => {
    try {
      // Mapear o status amigável para o valor correto no banco de dados
      let dbStatus: 'Em andamento' | 'Concluído' | 'Não iniciado';
      switch (newStatus) {
        case 'Em andamento':
          dbStatus = 'Em andamento';
          break;
        case 'Concluído':
          dbStatus = 'Concluído';
          break;
        case 'Não iniciado':
          dbStatus = 'Não iniciado';
          break;
        default:
          throw new Error(`Status inválido: ${newStatus}`);
      }

      const { error } = await supabaseService.updateProcessStatus(processId, dbStatus);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      setProcesses(processes.map(process => {
        if (process.id === processId) {
          // Mapear o status do banco de dados de volta para o formato do frontend
          let formattedStatus: 'pending' | 'completed' | 'not_started' = 'pending';
          switch (dbStatus) {
            case 'Em andamento':
              formattedStatus = 'pending';
              break;
            case 'Concluído':
              formattedStatus = 'completed';
              break;
            case 'Não iniciado':
              formattedStatus = 'not_started';
              break;
          }
          return { ...process, status: formattedStatus };
        }
        return process;
      }));
    } catch (error) {
      console.error("Erro ao atualizar o status do processo:", error);
    }
  };

  return {
    processes,
    isLoading,
    fetchProcesses,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    updateProcessType,
    updateProcessStatus,
    startProcess,
    deleteProcess: deleteP,
    deleteManyProcesses: deleteMany,
  };
};
