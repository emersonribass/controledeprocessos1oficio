
import { useDepartmentsFetch } from "@/hooks/useDepartmentsFetch";
import { Department } from "@/types";
import { ToastService } from "@/services/toast/toastService";

/**
 * Serviço para gerenciar operações relacionadas a departamentos
 */
export class DepartmentService {
  /**
   * Obtém todos os departamentos
   * @returns Lista de departamentos ou array vazio em caso de erro
   */
  static async fetchAllDepartments(): Promise<Department[]> {
    try {
      const { departments, fetchDepartments } = useDepartmentsFetch();
      
      // Se já temos departamentos, retornamos eles
      if (departments.length > 0) {
        return departments;
      }
      
      // Caso contrário, buscamos novamente
      await fetchDepartments();
      return departments;
    } catch (error) {
      console.error("Erro ao buscar departamentos:", error);
      ToastService.error("Erro ao buscar departamentos");
      return [];
    }
  }

  /**
   * Obtém um departamento pelo ID
   * @param departmentId ID do departamento
   * @returns Departamento ou null se não encontrado
   */
  static async getDepartmentById(departmentId: string): Promise<Department | null> {
    try {
      const departments = await this.fetchAllDepartments();
      return departments.find(dept => dept.id === departmentId) || null;
    } catch (error) {
      console.error("Erro ao buscar departamento por ID:", error);
      ToastService.error("Erro ao buscar departamento");
      return null;
    }
  }

  /**
   * Retorna o nome do departamento pelo ID
   * @param departmentId ID do departamento
   * @returns Nome do departamento ou string vazia se não encontrado
   */
  static async getDepartmentName(departmentId: string): Promise<string> {
    const department = await this.getDepartmentById(departmentId);
    return department ? department.name : "";
  }
}
