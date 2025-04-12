
import React from "react";
import { TableBody } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableEmpty from "@/components/Processes/ProcessTableEmpty";
import { ProcessResponsiblesHookResult } from "@/features/processes";
import { ProcessRow, useProcessTableBody } from "./ProcessRow";

interface ProcessTableBodyProps {
  processes: Process[];
  departments: Department[];
  sortedDepartments: Department[];
  concludedDept: Department | undefined;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  responsiblesManager: ProcessResponsiblesHookResult;
}

const ProcessTableBody = ({
  processes,
  departments,
  sortedDepartments,
  concludedDept,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  startProcess,
  responsiblesManager
}: ProcessTableBodyProps) => {
  const {
    handleRowClick,
    handleAcceptProcess
  } = useProcessTableBody(responsiblesManager);
  
  if (processes.length === 0) {
    return <ProcessTableEmpty columnsCount={sortedDepartments.length + 3} />;
  }

  return (
    <TableBody>
      {processes.map(process => (
        <ProcessRow
          key={process.id}
          process={process}
          sortedDepartments={sortedDepartments}
          departments={departments}
          concludedDept={concludedDept}
          getDepartmentName={getDepartmentName}
          getProcessTypeName={getProcessTypeName}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          processTypes={processTypes}
          updateProcessType={updateProcessType}
          startProcess={startProcess}
          responsiblesManager={responsiblesManager}
          handleRowClick={handleRowClick}
          handleAcceptProcess={handleAcceptProcess}
        />
      ))}
    </TableBody>
  );
};

export default ProcessTableBody;
