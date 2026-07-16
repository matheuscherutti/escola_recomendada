import { mockDb } from './mockDb';
import type { Candidate, CandidateModuleProgress, AuditLog, Notification, CandidateStatus, SelectionStatus, ModuleCode, User, ModuleStatus, GupyStatus } from './mockDb';

// Função auxiliar para gerar IDs aleatórios
const generateId = () => Math.random().toString(36).substring(2, 9);

// Mapeador de textos legíveis de status do processo seletivo
export const getSelectionStatusLabel = (status: SelectionStatus): string => {
  switch (status) {
    case 'finalized': return 'Finalizou';
    case 'in_selection': return 'Processo Seletivo';
    case 'hired': return 'Contratado';
    default: return status;
  }
};

// Mapeador de textos legíveis de status geral
export const getCandidateStatusLabel = (status: CandidateStatus): string => {
  switch (status) {
    case 'pending_validation': return 'Pendente de Validação';
    case 'rejected': return 'Validação Recusada';
    case 'in_progress': return 'Em Andamento (Treinamento)';
    case 'completed': return 'Curso Concluído';
    default: return status;
  }
};

export const stateMachine = {
  // 1. Cadastrar candidato (Escola ou Admin)
  createCandidate: (
    re: string,
    name: string,
    anac: string,
    schoolId: string,
    currentUser: User
  ): { success: boolean; message: string } => {
    const candidates = mockDb.getCandidates();

    // Validações
    if (candidates.some(c => c.re === re)) {
      return { success: false, message: `Já existe um candidato cadastrado com o RE: ${re}` };
    }
    if (candidates.some(c => c.anac === anac)) {
      return { success: false, message: `Já existe um candidato cadastrado com a licença ANAC: ${anac}` };
    }

    const newCandidate: Candidate = {
      id: `cand-${generateId()}`,
      re,
      name,
      anac,
      schoolId,
      status: 'pending_validation',
      selectionStatus: 'finalized',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Grava Candidato
    mockDb.setCandidates([...candidates, newCandidate]);

    // Grava Log de Auditoria
    const logs = mockDb.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${generateId()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      candidateId: newCandidate.id,
      candidateName: newCandidate.name,
      changedField: 'Cadastro',
      oldValue: '-',
      newValue: `Criado no sistema por ${currentUser.name}`
    };
    mockDb.setAuditLogs([newLog, ...logs]);

    // Envia Notificação para o Admin
    const schools = mockDb.getSchools();
    const schoolName = schools.find(s => s.id === schoolId)?.name || 'Escola Parceira';
    const notifications = mockDb.getNotifications();
    const newNotification: Notification = {
      id: `not-${generateId()}`,
      recipientRole: 'admin',
      title: 'Novo candidato pendente de validação',
      message: `A escola ${schoolName} cadastrou o candidato ${name} (RE: ${re}, ANAC: ${anac}).`,
      type: 'pending_validation',
      candidateId: newCandidate.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    mockDb.setNotifications([newNotification, ...notifications]);

    // Disparar evento nativo do browser para alertar a UI em tempo real
    window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

    return { success: true, message: 'Candidato enviado com sucesso! Aguardando validação.' };
  },

  // 2. Validação do Funcionário (Aprovar / Recusar - Apenas Admin)
  validateCandidate: (
    candidateId: string,
    approve: boolean,
    currentUser: User
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem validar candidatos.' };
    }

    const candidates = mockDb.getCandidates();
    const candidateIndex = candidates.findIndex(c => c.id === candidateId);

    if (candidateIndex === -1) {
      return { success: false, message: 'Candidato não encontrado.' };
    }

    const candidate = candidates[candidateIndex];
    const oldStatus = candidate.status;
    const newStatus: CandidateStatus = approve ? 'in_progress' : 'rejected';

    // Atualiza Candidato
    candidates[candidateIndex] = {
      ...candidate,
      status: newStatus,
      validatedBy: currentUser.id,
      validatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockDb.setCandidates(candidates);

    // Grava Log de Auditoria
    const logs = mockDb.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${generateId()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      candidateId: candidate.id,
      candidateName: candidate.name,
      changedField: 'Validação',
      oldValue: getCandidateStatusLabel(oldStatus),
      newValue: getCandidateStatusLabel(newStatus)
    };
    mockDb.setAuditLogs([newLog, ...logs]);

    // Se aprovado, instancia os 3 módulos pendentes
    if (approve) {
      const modules = mockDb.getModuleProgress();
      const newModules: CandidateModuleProgress[] = [
        {
          id: `mod-${generateId()}`,
          candidateId: candidate.id,
          moduleCode: 'TEORICO',
          status: 'pending',
          updatedAt: new Date().toISOString()
        },
        {
          id: `mod-${generateId()}`,
          candidateId: candidate.id,
          moduleCode: 'SIMULADOR',
          status: 'pending',
          updatedAt: new Date().toISOString()
        },
        {
          id: `mod-${generateId()}`,
          candidateId: candidate.id,
          moduleCode: 'VOO',
          status: 'pending',
          updatedAt: new Date().toISOString()
        }
      ];
      mockDb.setModuleProgress([...modules, ...newModules]);
    }

    // Envia Notificação para a Escola de origem
    const notifications = mockDb.getNotifications();
    const resultText = approve ? 'aprovado' : 'recusado';
    const newNotification: Notification = {
      id: `not-${generateId()}`,
      recipientSchoolId: candidate.schoolId,
      title: `Candidato ${resultText}`,
      message: `O candidato ${candidate.name} (RE: ${candidate.re}) foi ${resultText} pelo Administrador da Empresa.`,
      type: 'validation_result',
      candidateId: candidate.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    mockDb.setNotifications([newNotification, ...notifications]);
    window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

    return { success: true, message: `Candidato ${approve ? 'aprovado' : 'recusado'} com sucesso.` };
  },

  // 3. Atualizar Módulo de Treinamento (Anexar Certificado - Escola)
  completeModule: (
    candidateId: string,
    moduleCode: ModuleCode,
    completionDate: string,
    schoolId: string,
    certificateName: string,
    classSheets: string[],
    currentUser: User
  ): { success: boolean; message: string } => {
    const modules = mockDb.getModuleProgress();
    const modIndex = modules.findIndex(m => m.candidateId === candidateId && m.moduleCode === moduleCode);

    if (modIndex === -1) {
      return { success: false, message: 'Registro do módulo não encontrado para este candidato.' };
    }

    // Atualiza o progresso do módulo
    modules[modIndex] = {
      ...modules[modIndex],
      status: 'completed',
      completionDate,
      schoolId,
      certificateUrl: certificateName,
      classSheets,
      uploadedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString()
    };
    mockDb.setModuleProgress(modules);

    const candidates = mockDb.getCandidates();
    const candidateIndex = candidates.findIndex(c => c.id === candidateId);
    const candidate = candidates[candidateIndex];

    // Grava Log de Auditoria
    const logs = mockDb.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${generateId()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      candidateId: candidateId,
      candidateName: candidate?.name || 'Candidato',
      changedField: `Módulo ${moduleCode.charAt(0) + moduleCode.slice(1).toLowerCase()}`,
      oldValue: 'Pendente',
      newValue: `Concluído (${certificateName})`
    };
    mockDb.setAuditLogs([newLog, ...logs]);

    // Valida se todos os 3 módulos do candidato estão concluídos
    const candidateModules = modules.filter(m => m.candidateId === candidateId);
    const completedAll = candidateModules.length === 3 && candidateModules.every(m => m.status === 'completed');

    if (completedAll && candidate && candidate.status !== 'completed') {
      // Transição automática para concluído
      candidates[candidateIndex] = {
        ...candidate,
        status: 'completed',
        selectionStatus: 'finalized', // Padrão automático inicial
        updatedAt: new Date().toISOString()
      };
      mockDb.setCandidates(candidates);

      // Log automático do sistema
      const autoLog: AuditLog = {
        id: `log-${generateId()}`,
        createdAt: new Date().toISOString(),
        userName: 'Sistema',
        candidateId: candidate.id,
        candidateName: candidate.name,
        changedField: 'Status Geral',
        oldValue: 'Em Andamento',
        newValue: 'Curso Concluído (Gatilho Automático)'
      };
      mockDb.setAuditLogs([autoLog, ...mockDb.getAuditLogs()]);

      // Notificação para o Admin (Conclusão total)
      const notifications = mockDb.getNotifications();
      const completionNotification: Notification = {
        id: `not-${generateId()}`,
        recipientRole: 'admin',
        title: 'Treinamento Concluído',
        message: `O candidato ${candidate.name} concluiu todos os 3 módulos obrigatórios de treinamento.`,
        type: 'course_completed',
        candidateId: candidate.id,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      mockDb.setNotifications([completionNotification, ...notifications]);
      window.dispatchEvent(new CustomEvent('new_notification', { detail: completionNotification }));
    }

    return { success: true, message: `Módulo ${moduleCode} atualizado com sucesso.` };
  },

  // 4. Alterar Status do Processo Seletivo (Apenas Admin)
  updateSelectionStatus: (
    candidateId: string,
    newStatus: SelectionStatus,
    currentUser: User
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem atualizar o processo seletivo.' };
    }

    const candidates = mockDb.getCandidates();
    const candidateIndex = candidates.findIndex(c => c.id === candidateId);

    if (candidateIndex === -1) {
      return { success: false, message: 'Candidato não encontrado.' };
    }

    const candidate = candidates[candidateIndex];
    const oldStatus = candidate.selectionStatus;

    if (candidate.status !== 'completed') {
      return { success: false, message: 'Apenas candidatos com o treinamento concluído podem entrar no processo seletivo.' };
    }

    // Atualiza Status do Processo Seletivo
    candidates[candidateIndex] = {
      ...candidate,
      selectionStatus: newStatus,
      updatedAt: new Date().toISOString()
    };
    mockDb.setCandidates(candidates);

    // Grava Log de Auditoria
    const logs = mockDb.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${generateId()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      candidateId: candidate.id,
      candidateName: candidate.name,
      changedField: 'Status Seleção',
      oldValue: getSelectionStatusLabel(oldStatus),
      newValue: getSelectionStatusLabel(newStatus)
    };
    mockDb.setAuditLogs([newLog, ...logs]);

    // Envia Notificação para a Escola em tempo real
    const notifications = mockDb.getNotifications();
    const newNotification: Notification = {
      id: `not-${generateId()}`,
      recipientSchoolId: candidate.schoolId,
      title: 'Status Processo Seletivo',
      message: `O status do processo seletivo do candidato ${candidate.name} foi atualizado para: "${getSelectionStatusLabel(newStatus)}".`,
      type: 'selection_status_update',
      candidateId: candidate.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    mockDb.setNotifications([newNotification, ...notifications]);
    window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

    return { success: true, message: 'Status do processo seletivo atualizado com sucesso.' };
  },

  // 4.1 Atualizar Status Gupy (Qualquer perfil ou apenas admin)
  updateGupyStatus: (
    candidateId: string,
    gupyStatus: GupyStatus,
    currentUser: User
  ): { success: boolean; message: string } => {
    const candidates = mockDb.getCandidates();
    const candidateIndex = candidates.findIndex(c => c.id === candidateId);

    if (candidateIndex === -1) {
      return { success: false, message: 'Candidato não encontrado.' };
    }

    const candidate = candidates[candidateIndex];
    const oldGupy = candidate.gupyStatus;

    candidates[candidateIndex] = {
      ...candidate,
      gupyStatus,
      updatedAt: new Date().toISOString()
    };
    mockDb.setCandidates(candidates);

    // Grava Log de Auditoria
    const logs = mockDb.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${generateId()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      candidateId: candidate.id,
      candidateName: candidate.name,
      changedField: 'Status Gupy',
      oldValue: oldGupy === 'gupy_min' ? 'Na Gupy (com mínimos)' : oldGupy === 'gupy_no_min' ? 'Na Gupy (sem mínimos)' : oldGupy === 'not_gupy' ? 'Não está na Gupy' : 'Não Informado',
      newValue: gupyStatus === 'gupy_min' ? 'Na Gupy (com mínimos)' : gupyStatus === 'gupy_no_min' ? 'Na Gupy (sem mínimos)' : 'Não está na Gupy'
    };
    mockDb.setAuditLogs([newLog, ...logs]);

    return { success: true, message: 'Status Gupy atualizado com sucesso.' };
  },

  // 5. Editar ou Anular Módulo (Apenas Admin)
  adminEditModule: (
    candidateId: string,
    moduleCode: ModuleCode,
    status: ModuleStatus,
    completionDate: string | undefined,
    schoolId: string | undefined,
    certificateName: string | undefined,
    classSheets: string[] | undefined,
    currentUser: User
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem editar módulos.' };
    }

    const modules = mockDb.getModuleProgress();
    const modIndex = modules.findIndex(m => m.candidateId === candidateId && m.moduleCode === moduleCode);

    if (modIndex === -1) {
      return { success: false, message: 'Registro do módulo não encontrado.' };
    }

    const oldModule = modules[modIndex];

    if (status === 'pending') {
      // Anulação
      modules[modIndex] = {
        id: oldModule.id,
        candidateId,
        moduleCode,
        status: 'pending',
        updatedAt: new Date().toISOString()
      };
    } else {
      // Edição
      modules[modIndex] = {
        ...oldModule,
        status: 'completed',
        completionDate,
        schoolId,
        certificateUrl: certificateName,
        classSheets,
        updatedBy: currentUser.id,
        updatedAt: new Date().toISOString()
      };
    }

    mockDb.setModuleProgress(modules);

    const candidates = mockDb.getCandidates();
    const candidateIndex = candidates.findIndex(c => c.id === candidateId);
    const candidate = candidates[candidateIndex];

    if (candidate) {
      const candidateModules = modules.filter(m => m.candidateId === candidateId);
      const completedAll = candidateModules.length === 3 && candidateModules.every(m => m.status === 'completed');

      const oldStatus = candidate.status;
      let newStatus = candidate.status;
      let newSelectionStatus = candidate.selectionStatus;

      if (completedAll && candidate.status !== 'completed') {
        newStatus = 'completed';
        newSelectionStatus = 'finalized';
      } else if (!completedAll && candidate.status === 'completed') {
        newStatus = 'in_progress';
        newSelectionStatus = 'finalized';
      }

      candidates[candidateIndex] = {
        ...candidate,
        status: newStatus,
        selectionStatus: newSelectionStatus,
        updatedAt: new Date().toISOString()
      };
      mockDb.setCandidates(candidates);

      // Logs de Auditoria
      const logs = mockDb.getAuditLogs();
      const newLog: AuditLog = {
        id: `log-${generateId()}`,
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        candidateId: candidate.id,
        candidateName: candidate.name,
        changedField: `Módulo ${moduleCode.charAt(0) + moduleCode.slice(1).toLowerCase()}`,
        oldValue: oldModule.status === 'completed' ? `Concluído (${oldModule.certificateUrl})` : 'Pendente',
        newValue: status === 'pending' ? 'Pendente (Anulado)' : `Editado (${certificateName})`
      };

      const finalLogs = [newLog];

      if (oldStatus !== newStatus) {
        const statusLog: AuditLog = {
          id: `log-${generateId()}`,
          createdAt: new Date().toISOString(),
          userName: 'Sistema',
          candidateId: candidate.id,
          candidateName: candidate.name,
          changedField: 'Status Geral',
          oldValue: getCandidateStatusLabel(oldStatus),
          newValue: getCandidateStatusLabel(newStatus)
        };
        finalLogs.push(statusLog);
      }

      mockDb.setAuditLogs([...finalLogs, ...logs]);
    }

    return { success: true, message: status === 'pending' ? 'Módulo anulado com sucesso.' : 'Módulo atualizado com sucesso.' };
  },

  // 10. Alterar senha
  changePassword: (
    oldPass: string,
    newPass: string,
    currentUser: User
  ): { success: boolean; message: string } => {
    const users = mockDb.getUsers();
    const user = users.find(u => u.id === currentUser.id);
    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }
    if (user.password !== oldPass) {
      return { success: false, message: 'Senha atual incorreta.' };
    }
    if (newPass === 'crpazul1234*') {
      return { success: false, message: 'Você não pode usar a senha padrão como sua nova senha.' };
    }
    mockDb.updateUserPassword(user.id, newPass);

    // Auditoria
    const logs = mockDb.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${generateId()}`,
      createdAt: new Date().toISOString(),
      userName: user.name,
      userId: user.id,
      candidateId: '-',
      candidateName: 'Sistema (Segurança)',
      changedField: 'Alteração de Senha',
      oldValue: '********',
      newValue: 'Senha alterada com sucesso'
    };
    mockDb.setAuditLogs([newLog, ...logs]);

    return { success: true, message: 'Senha alterada com sucesso!' };
  },

  // 11. Resetar senha por Admin
  resetPassword: (
    schoolUserId: string,
    currentUser: User
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Acesso negado: apenas administradores podem redefinir senhas.' };
    }
    const users = mockDb.getUsers();
    const targetUser = users.find(u => u.id === schoolUserId);
    if (!targetUser) {
      return { success: false, message: 'Usuário escolar não encontrado.' };
    }

    mockDb.updateUserPassword(targetUser.id, 'crpazul1234*');

    // Auditoria
    const logs = mockDb.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${generateId()}`,
      createdAt: new Date().toISOString(),
      userName: currentUser.name,
      userId: currentUser.id,
      candidateId: '-',
      candidateName: targetUser.name,
      changedField: 'Redefinição de Senha',
      oldValue: '********',
      newValue: 'Senha redefinida para crpazul1234* pelo Admin'
    };
    mockDb.setAuditLogs([newLog, ...logs]);

    return { success: true, message: 'Senha redefinida para o padrão crpazul1234*!' };
  }
};
