
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
          
          toast.success(`Processo movido para ${nextDept.name}`);
          
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
          
          toast.success(`Processo devolvido para ${prevDept.name}`);
          
          return {
            ...process,
            currentDepartment: prevDept.id,
            status: process.status === "completed" ? "pending" : process.status,
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
