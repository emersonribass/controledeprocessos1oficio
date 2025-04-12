
export enum ProcessResponsibleType {
  NOT_RESPONSIBLE = "not_responsible",
  DEPARTMENT_MEMBER = "department_member",
  PROCESS_RESPONSIBLE = "process_responsible"
}

export const getProcessResponsibilityType = (
  userDepartments: string[] | undefined,
  currentDepartmentId: string | null | undefined,
  isProcessResponsible: boolean
): ProcessResponsibleType => {
  // Se o usuário é responsável direto pelo processo
  if (isProcessResponsible) {
    return ProcessResponsibleType.PROCESS_RESPONSIBLE;
  }
  
  // Se o usuário pertence ao departamento atual do processo
  if (
    userDepartments &&
    currentDepartmentId &&
    userDepartments.includes(currentDepartmentId)
  ) {
    return ProcessResponsibleType.DEPARTMENT_MEMBER;
  }
  
  // Usuário não tem relação com o processo
  return ProcessResponsibleType.NOT_RESPONSIBLE;
};
