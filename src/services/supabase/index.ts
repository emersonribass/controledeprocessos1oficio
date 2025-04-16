
import { supabaseBaseService } from "./client";
import { userService } from "./userService";
import { processService } from "./processService";
import { processTypeService } from "./processTypeService";
import { processHistoryService } from "./processHistoryService";
import { departmentService } from "./departmentService";
import { notificationService } from "./notificationService";

/**
 * Serviço agregador que mantém a compatibilidade com o código existente
 * Centraliza o acesso a todos os serviços específicos
 */
class SupabaseService {
  // Método para obter a URL do Supabase
  getUrl(): string {
    return supabaseBaseService.getUrl();
  }

  // ===== Serviços para Usuários =====
  fetchUsuarios = userService.fetchUsuarios.bind(userService);
  checkAuthUsers = userService.checkAuthUsers.bind(userService);
  updateUsuario = userService.updateUsuario.bind(userService);
  createUsuario = userService.createUsuario.bind(userService);
  deleteUsuario = userService.deleteUsuario.bind(userService);
  toggleUsuarioAtivo = userService.toggleUsuarioAtivo.bind(userService);
  getUserProfile = userService.getUserProfile.bind(userService);

  // ===== Serviços para Tipos de Processo =====
  fetchProcessTypes = processTypeService.fetchProcessTypes.bind(processTypeService);
  createProcessType = processTypeService.createProcessType.bind(processTypeService);
  updateProcessType = processTypeService.updateProcessType.bind(processTypeService);
  toggleProcessTypeActive = processTypeService.toggleProcessTypeActive.bind(processTypeService);

  // ===== Serviços para Processos =====
  updateProcessTypeById = processService.updateProcessTypeById.bind(processService);
  updateProcessStatus = processService.updateProcessStatus.bind(processService);
  getProcess = processService.getProcess.bind(processService);
  checkProcessNotStarted = processService.checkProcessNotStarted.bind(processService);
  getProcessBasicInfo = processService.getProcessBasicInfo.bind(processService);
  checkProcessAccess = processService.checkProcessAccess.bind(processService);
  getProcessos = processService.getProcessos.bind(processService);
  getProcessoById = processService.getProcessoById.bind(processService);
  updateProcesso = processService.updateProcesso.bind(processService);
  createProcesso = processService.createProcesso.bind(processService);
  deleteProcesso = processService.deleteProcesso.bind(processService);

  // ===== Serviços para Histórico de processos =====
  getProcessoHistorico = processHistoryService.getProcessoHistorico.bind(processHistoryService);
  createProcessoHistorico = processHistoryService.createProcessoHistorico.bind(processHistoryService);
  updateProcessoHistorico = processHistoryService.updateProcessoHistorico.bind(processHistoryService);

  // ===== Serviços para Setores =====
  getSetores = departmentService.getSetores.bind(departmentService);
  updateSetor = departmentService.updateSetor.bind(departmentService);
  deleteSetor = departmentService.deleteSetor.bind(departmentService);
  createSetor = departmentService.createSetor.bind(departmentService);
  getProcessResponsibles = departmentService.getProcessResponsibles.bind(departmentService);
  getSetorResponsaveis = departmentService.getSetorResponsaveis.bind(departmentService);
  createSetorResponsavel = departmentService.createSetorResponsavel.bind(departmentService);
  updateSetorResponsavel = departmentService.updateSetorResponsavel.bind(departmentService);

  // ===== Serviços para Notificações =====
  getNotificacoes = notificationService.getNotificacoes.bind(notificationService);
  createNotificacao = notificationService.createNotificacao.bind(notificationService);
  updateNotificacao = notificationService.updateNotificacao.bind(notificationService);
}

// Exporta uma instância única do serviço (Singleton)
export const supabaseService = new SupabaseService();

// Exporta os serviços individuais para uso direto quando necessário
export {
  userService,
  processService,
  processTypeService,
  processHistoryService,
  departmentService,
  notificationService
};
