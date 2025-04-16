
import { Process, Department, ProcessType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import ProcessFilters from "./ProcessFilters";
import ProcessTable from "./ProcessTable";
import { Loader2 } from "lucide-react";

interface ProcessListContentProps {
  processes: Process[];
  isLoading: boolean;
  filteredProcesses: Process[];
  filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
    }>
  >;
  sortField?: keyof Process;
  sortDirection?: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  departments: Department[];
  startProcess?: (processId: string) => Promise<void>;
  availableDepartments: Department[];
  filterProcesses: (filters: any, processesToFilter?: Process[]) => Process[];
  isUserInAttendanceSector: () => boolean;
  responsiblesData?: Record<string, Record<string, any>>;
}

const ProcessListContent = ({
  processes,
  isLoading,
  filteredProcesses,
  filters,
  setFilters,
  sortField,
  sortDirection,
  toggleSort,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  departments,
  startProcess,
  availableDepartments,
  isUserInAttendanceSector,
  responsiblesData = {}
}: ProcessListContentProps) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <Input
          placeholder="Pesquisar pelo número de protocolo..."
          className="md:w-96"
          value={filters.search || ""}
          onChange={handleSearchChange}
        />
        <ProcessFilters
          filters={filters}
          setFilters={setFilters}
          departments={availableDepartments}
          getDepartmentName={getDepartmentName}
          processTypes={processTypes}
          getProcessTypeName={getProcessTypeName}
        />
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="w-full mb-4 max-w-lg">
          <TabsTrigger value="todos" className="flex-1">
            Todos
          </TabsTrigger>
          <TabsTrigger value="pendentes" className="flex-1">
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="concluidos" className="flex-1">
            Concluídos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4 p-0">
          {isLoading ? (
            <div className="flex justify-center items-center pt-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ProcessTable
              processes={processes}
              filteredProcesses={filteredProcesses}
              sortField={sortField}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
              getDepartmentName={getDepartmentName}
              getProcessTypeName={getProcessTypeName}
              moveProcessToNextDepartment={moveProcessToNextDepartment}
              moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
              departments={departments}
              processTypes={processTypes}
              updateProcessType={updateProcessType}
              startProcess={startProcess}
              isUserInAttendanceSector={isUserInAttendanceSector}
              responsiblesData={responsiblesData}
            />
          )}
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-4 p-0">
          {isLoading ? (
            <div className="flex justify-center items-center pt-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ProcessTable
              processes={processes}
              filteredProcesses={filteredProcesses.filter(
                (p) => p.status === "pending" || p.status === "overdue"
              )}
              sortField={sortField}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
              getDepartmentName={getDepartmentName}
              getProcessTypeName={getProcessTypeName}
              moveProcessToNextDepartment={moveProcessToNextDepartment}
              moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
              departments={departments}
              processTypes={processTypes}
              updateProcessType={updateProcessType}
              startProcess={startProcess}
              isUserInAttendanceSector={isUserInAttendanceSector}
              responsiblesData={responsiblesData}
            />
          )}
        </TabsContent>

        <TabsContent value="concluidos" className="space-y-4 p-0">
          {isLoading ? (
            <div className="flex justify-center items-center pt-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ProcessTable
              processes={processes}
              filteredProcesses={filteredProcesses.filter(
                (p) => p.status === "completed"
              )}
              sortField={sortField}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
              getDepartmentName={getDepartmentName}
              getProcessTypeName={getProcessTypeName}
              moveProcessToNextDepartment={moveProcessToNextDepartment}
              moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
              departments={departments}
              processTypes={processTypes}
              updateProcessType={updateProcessType}
              startProcess={startProcess}
              isUserInAttendanceSector={isUserInAttendanceSector}
              responsiblesData={responsiblesData}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcessListContent;
