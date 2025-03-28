
import { createContext, useContext, useState, ReactNode } from "react";
import { Process, Department } from "@/types";
import { mockProcesses, mockDepartments, mockProcessTypes } from "@/lib/mockData";
import { toast } from "sonner";

type ProcessesContextType = {
  processes: Process[];
  departments: Department[];
  processTypes: typeof mockProcessTypes;
  filterProcesses: (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }) => Process[];
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  isProcessOverdue: (process: Process) => boolean;
};

const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  const [processes, setProcesses] = useState<Process[]>(mockProcesses);
  const [departments] = useState<Department[]>(mockDepartments);
  const [processTypes] = useState(mockProcessTypes);

  const getDepartmentName = (id: string) => {
    const department = departments.find((d) => d.id === id);
    return department ? department.name : "Desconhecido";
  };

  const getProcessTypeName = (id: string) => {
    const processType = processTypes.find((pt) => pt.id === id);
    return processType ? processType.name : "Desconhecido";
  };

  const filterProcesses = (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }) => {
    return processes.filter((process) => {
      // Department filter
      if (filters.department && process.currentDepartment !== filters.department) {
        return false;
      }

      // Status filter
      if (filters.status && process.status !== filters.status) {
        return false;
      }

      // Process type filter
      if (filters.processType && process.processType !== filters.processType) {
        return false;
      }

      // Search by protocol number
      if (
        filters.search &&
        !process.protocolNumber.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  const isProcessOverdue = (process: Process) => {
    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  const moveProcessToNextDepartment = (processId: string) => {
    setProcesses((prev) => {
      return prev.map((process) => {
        if (process.id === processId) {
          const currentDeptId = process.currentDepartment;
          const currentDept = departments.find((d) => d.id === currentDeptId);
          
          if (!currentDept) {
            return process;
          }
          
          // Find the next department in order
          const nextDept = departments.find((d) => d.order === currentDept.order + 1);
          
          if (!nextDept) {
            toast.error("Não há próximo departamento");
            return process;
          }
          
          // Update history
          const history = [...process.history];
          
          // Set exit date for current department
          const currentDeptHistoryIndex = history.findIndex(
            (h) => h.departmentId === currentDeptId && !h.exitDate
          );
          
          if (currentDeptHistoryIndex >= 0) {
            history[currentDeptHistoryIndex] = {
              ...history[currentDeptHistoryIndex],
              exitDate: new Date().toISOString(),
            };
          }
          
          // Add entry for next department
          history.push({
            departmentId: nextDept.id,
            entryDate: new Date().toISOString(),
            exitDate: null,
            userId: "1", // In a real app, this would be the current user
          });
          
          toast.success(`Processo movido para ${nextDept.name}`);
          
          // If the process is moved to "Concluído(a)", mark it as completed
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
            toast.error("Não há departamento anterior");
            return process;
          }
          
          // Find the previous department in order
          const prevDept = departments.find((d) => d.order === currentDept.order - 1);
          
          if (!prevDept) {
            return process;
          }
          
          // Update history
          const history = [...process.history];
          
          // Set exit date for current department
          const currentDeptHistoryIndex = history.findIndex(
            (h) => h.departmentId === currentDeptId && !h.exitDate
          );
          
          if (currentDeptHistoryIndex >= 0) {
            history[currentDeptHistoryIndex] = {
              ...history[currentDeptHistoryIndex],
              exitDate: new Date().toISOString(),
            };
          }
          
          // Add entry for previous department
          history.push({
            departmentId: prevDept.id,
            entryDate: new Date().toISOString(),
            exitDate: null,
            userId: "1", // In a real app, this would be the current user
          });
          
          toast.success(`Processo devolvido para ${prevDept.name}`);
          
          return {
            ...process,
            currentDepartment: prevDept.id,
            // If a process is moved back, it's no longer completed
            status: process.status === "completed" ? "pending" : process.status,
            history,
          };
        }
        return process;
      });
    });
  };

  return (
    <ProcessesContext.Provider
      value={{
        processes,
        departments,
        processTypes,
        filterProcesses,
        getDepartmentName,
        getProcessTypeName,
        moveProcessToNextDepartment,
        moveProcessToPreviousDepartment,
        isProcessOverdue,
      }}
    >
      {children}
    </ProcessesContext.Provider>
  );
};

export const useProcesses = () => {
  const context = useContext(ProcessesContext);
  if (context === undefined) {
    throw new Error("useProcesses must be used within a ProcessesProvider");
  }
  return context;
};
