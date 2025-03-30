import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Process, Department } from "@/types";
import { mockProcesses, mockProcessTypes } from "@/lib/mockData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [processTypes] = useState(mockProcessTypes);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('order_num', { ascending: true });

        if (error) {
          throw error;
        }

        const formattedDepartments: Department[] = data.map(dept => ({
          id: dept.id.toString(),
          name: dept.name,
          order: dept.order_num,
          timeLimit: dept.time_limit
        }));

        setDepartments(formattedDepartments);
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

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
      if (filters.department && process.currentDepartment !== filters.department) {
        return false;
      }

      if (filters.status && process.status !== filters.status) {
        return false;
      }

      if (filters.processType && process.processType !== filters.processType) {
        return false;
      }

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
          
          const nextDept = departments.find((d) => d.order === currentDept.order + 1);
          
          if (!nextDept) {
            toast.error("Não há próximo departamento");
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
            toast.error("Não há departamento anterior");
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
