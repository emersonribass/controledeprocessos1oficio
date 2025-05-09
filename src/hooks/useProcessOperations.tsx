
import { useState } from "react";
import { Process, Department } from "@/types";
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
          
          history.push({
            departmentId: nextDept.id,
            entryDate: new Date().toISOString(),
            exitDate: null,
            userId: "1",
          });
          
          // Se o próximo departamento é "Concluído(a)", marcar o processo como concluído
          const isCompleted = nextDept.name === "Concluído(a)";
          
          return {
            ...process,
            currentDepartment: nextDept.id,
            status: isCompleted ? "completed" : process.status,
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
          
          history.push({
            departmentId: prevDept.id,
            entryDate: new Date().toISOString(),
            exitDate: null,
            userId: "1",
          });
          
          // Se o processo estiver concluído ou vier do departamento "Concluído(a)", 
          // alterar seu status para "pending" (Em andamento)
          const isFromConcluded = currentDept.name === "Concluído(a)";
          const newStatus = (process.status === "completed" || isFromConcluded) ? "pending" : process.status;
          
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
