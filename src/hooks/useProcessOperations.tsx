
import { useState } from "react";
import { Process, Department, PROCESS_STATUS, HistoryEntry } from "@/types";
import { toast } from "sonner";

export const useProcessOperations = (
  processes: Process[],
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>,
  departments: Department[]
) => {
  const moveProcessToNextDepartment = (processId: string) => {
    setProcesses((prev) => {
      return prev.map((process) => {
        if (process.id === processId) {
          const currentDeptId = process.currentDepartment;
          const currentDept = departments.find((d) => d.id === currentDeptId);
          
          if (!currentDept) {
            return process;
          }
          
          const nextDept = departments.find((d) => d.order === currentDept.order + 1);
          
          if (!nextDept) {
            toast.error("Não há próximo setor");
            return process;
          }
          
          const history = [...process.history];
          
          const currentDeptHistoryIndex = history.findIndex(
            (h) => h.departmentId === currentDeptId && !h.exitDate
          );
          
          if (currentDeptHistoryIndex >= 0) {
            history[currentDeptHistoryIndex] = {
              ...history[currentDeptHistoryIndex],
              exitDate: new Date().toISOString(),
            };
          }
          
          // Adicionando as propriedades faltantes processId e userName
          history.push({
            processId: process.id,
            departmentId: nextDept.id,
            entryDate: new Date().toISOString(),
            exitDate: undefined,
            userId: "1",
            userName: "Sistema"
          });
          
          toast.success(`Processo movido para ${nextDept.name}`);
          
          const isCompleted = nextDept.name === "Concluído(a)";
          const newStatus = isCompleted ? PROCESS_STATUS.COMPLETED : process.status;
          
          return {
            ...process,
            currentDepartment: nextDept.id,
            status: newStatus,
            history,
          };
        }
        return process;
      });
    });
  };

  const moveProcessToPreviousDepartment = (processId: string) => {
    setProcesses((prev) => {
      return prev.map((process) => {
        if (process.id === processId) {
          const currentDeptId = process.currentDepartment;
          const currentDept = departments.find((d) => d.id === currentDeptId);
          
          if (!currentDept || currentDept.order <= 1) {
            toast.error("Não há setor anterior");
            return process;
          }
          
          const prevDept = departments.find((d) => d.order === currentDept.order - 1);
          
          if (!prevDept) {
            return process;
          }
          
          const history = [...process.history];
          
          const currentDeptHistoryIndex = history.findIndex(
            (h) => h.departmentId === currentDeptId && !h.exitDate
          );
          
          if (currentDeptHistoryIndex >= 0) {
            history[currentDeptHistoryIndex] = {
              ...history[currentDeptHistoryIndex],
              exitDate: new Date().toISOString(),
            };
          }
          
          // Adicionando as propriedades faltantes processId e userName
          history.push({
            processId: process.id,
            departmentId: prevDept.id,
            entryDate: new Date().toISOString(),
            exitDate: undefined,
            userId: "1",
            userName: "Sistema"
          });
          
          toast.success(`Processo devolvido para ${prevDept.name}`);
          
          // Verificando o status usando PROCESS_STATUS ao invés de string direta
          const newStatus = process.status === PROCESS_STATUS.COMPLETED ? PROCESS_STATUS.PENDING : process.status;
          
          return {
            ...process,
            currentDepartment: prevDept.id,
            status: newStatus,
            history,
          };
        }
        return process;
      });
    });
  };

  return {
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
  };
};
