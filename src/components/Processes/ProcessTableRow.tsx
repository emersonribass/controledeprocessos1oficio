
const ProcessTableRow = ({
  process,
  departments,
  processTypes,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  getProcessTypeName,
  updateProcessType,
  startProcess,
  onAcceptResponsibility,
  isAccepting,
  hasSectorResponsible = false,
  canInitiateProcesses = false,
  processResponsibles
}: ProcessTableRowProps) => {
  // ... código existente ...

  return (
    <TableRow>
      {/* ... células existentes ... */}
      <ProcessDepartmentsSection 
        sortedDepartments={sortedDepartments}
        isProcessStarted={process.status !== "not_started"}
        getMostRecentEntryDate={(departmentId) => getMostRecentEntryDate(departmentId)}
        hasPassedDepartment={(departmentId) => hasPassedDepartment(departmentId)}
        isCurrentDepartment={(departmentId) => isCurrentDepartment(departmentId)}
        isPreviousDepartment={(departmentId) => isPreviousDepartment(departmentId)}
        isDepartmentOverdue={(departmentId, isProcessStarted) => isDepartmentOverdue(departmentId, isProcessStarted)}
        processId={process.id}
        processResponsible={processResponsibles?.[process.id]?.initial}
        sectorResponsibles={processResponsibles?.[process.id]}
      />
      {/* ... células existentes ... */}
    </TableRow>
  );
};