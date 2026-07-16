import { supabase } from './supabaseClient';
import type { Notification, CandidateStatus, SelectionStatus, ModuleCode, User, ModuleStatus, GupyStatus } from './mockDb';

// Função auxiliar para gerar IDs aleatórios
const generateId = () => Math.random().toString(36).substring(2, 9);

// Mapeador de textos legíveis de status do processo seletivo
export const getSelectionStatusLabel = (status: SelectionStatus): string => {
  switch (status) {
    case 'finalized': return 'Finalizou';
    case 'in_selection': return 'Processo Seletivo';
    case 'hired': return 'Contratado';
    case 'rejected': return 'Reprovado';
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
  createCandidate: async (
    re: string,
    name: string,
    anac: string,
    schoolId: string,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Validações de Unicidade
      const { data: reCheck, error: reCheckErr } = await supabase.from('candidates').select('id').eq('re', re).limit(1);
      if (reCheckErr) throw reCheckErr;
      if (reCheck && reCheck.length > 0) {
        return { success: false, message: `Já existe um candidato cadastrado com o RE: ${re}` };
      }

      const { data: anacCheck, error: anacCheckErr } = await supabase.from('candidates').select('id').eq('anac', anac).limit(1);
      if (anacCheckErr) throw anacCheckErr;
      if (anacCheck && anacCheck.length > 0) {
        return { success: false, message: `Já existe um candidato cadastrado com a licença ANAC: ${anac}` };
      }

      const candId = `cand-${generateId()}`;
      const timestamp = new Date().toISOString();

      // Grava Candidato
      const { error: candErr } = await supabase.from('candidates').insert({
        id: candId,
        re,
        name,
        anac,
        school_id: schoolId,
        status: 'pending_validation',
        selection_status: 'finalized',
        gupy_status: 'gupy_pending',
        created_at: timestamp,
        updated_at: timestamp
      });
      if (candErr) throw candErr;

      // Grava Log de Auditoria
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candId,
        candidate_name: name,
        changed_field: 'Cadastro',
        old_value: '-',
        new_value: `Criado no sistema por ${currentUser.name}`
      });
      if (logErr) throw logErr;

      // Buscar nome da Escola
      const { data: school, error: schoolErr } = await supabase.from('schools').select('name').eq('id', schoolId).single();
      if (schoolErr) console.warn('Erro ao ler nome da escola para notificação:', schoolErr);
      const schoolName = school?.name || 'Escola Parceira';

      // Grava Notificação para o Admin
      const newNotification: Notification = {
        id: `not-${generateId()}`,
        recipientRole: 'admin',
        title: 'Novo candidato pendente de validação',
        message: `A escola ${schoolName} cadastrou o candidato ${name} (RE: ${re}, ANAC: ${anac}).`,
        type: 'pending_validation',
        candidateId: candId,
        isRead: false,
        createdAt: timestamp
      };

      const { error: notifErr } = await supabase.from('notifications').insert({
        id: newNotification.id,
        recipient_role: newNotification.recipientRole,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        candidate_id: newNotification.candidateId,
        is_read: newNotification.isRead,
        created_at: newNotification.createdAt
      });
      if (notifErr) throw notifErr;

      // Disparar evento nativo do browser para alertar a UI em tempo real
      window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

      return { success: true, message: 'Candidato enviado com sucesso! Aguardando validação.' };
    } catch (err: any) {
      console.error('Erro no createCandidate:', err);
      return { success: false, message: `Erro ao cadastrar candidato: ${err.message}` };
    }
  },

  // 2. Validação do Funcionário (Aprovar / Recusar - Apenas Admin)
  validateCandidate: async (
    candidateId: string,
    approve: boolean,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem validar candidatos.' };
    }

    try {
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candErr || !candidate) {
        return { success: false, message: 'Candidato não encontrado.' };
      }

      const oldStatus = candidate.status;
      const newStatus: CandidateStatus = approve ? 'in_progress' : 'rejected';
      const timestamp = new Date().toISOString();

      // Atualiza Candidato
      const { error: updateErr } = await supabase
        .from('candidates')
        .update({
          status: newStatus,
          validated_by: currentUser.id,
          validated_at: timestamp,
          updated_at: timestamp
        })
        .eq('id', candidateId);

      if (updateErr) throw updateErr;

      // Grava Log de Auditoria
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        changed_field: 'Validação',
        old_value: getCandidateStatusLabel(oldStatus as CandidateStatus),
        new_value: getCandidateStatusLabel(newStatus)
      });
      if (logErr) throw logErr;

      // Se aprovado, instancia os 3 módulos pendentes
      if (approve) {
        const newModules = [
          {
            id: `mod-${generateId()}`,
            candidate_id: candidate.id,
            module_code: 'TEORICO',
            status: 'pending',
            updated_at: timestamp
          },
          {
            id: `mod-${generateId()}`,
            candidate_id: candidate.id,
            module_code: 'SIMULADOR',
            status: 'pending',
            updated_at: timestamp
          },
          {
            id: `mod-${generateId()}`,
            candidate_id: candidate.id,
            module_code: 'VOO',
            status: 'pending',
            updated_at: timestamp
          }
        ];
        const { error: modulesErr } = await supabase.from('candidate_module_progress').insert(newModules);
        if (modulesErr) throw modulesErr;
      }

      // Envia Notificação para a Escola de origem
      const resultText = approve ? 'aprovado' : 'recusado';
      const newNotification: Notification = {
        id: `not-${generateId()}`,
        recipientSchoolId: candidate.school_id,
        title: `Candidato ${resultText}`,
        message: `O candidato ${candidate.name} (RE: ${candidate.re}) foi ${resultText} pelo Administrador da Empresa.`,
        type: 'validation_result',
        candidateId: candidate.id,
        isRead: false,
        createdAt: timestamp
      };

      const { error: notifErr } = await supabase.from('notifications').insert({
        id: newNotification.id,
        recipient_school_id: newNotification.recipientSchoolId,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        candidate_id: newNotification.candidateId,
        is_read: newNotification.isRead,
        created_at: newNotification.createdAt
      });
      if (notifErr) throw notifErr;

      window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

      return { success: true, message: `Candidato ${approve ? 'aprovado' : 'recusado'} com sucesso.` };
    } catch (err: any) {
      console.error('Erro no validateCandidate:', err);
      return { success: false, message: `Erro ao validar candidato: ${err.message}` };
    }
  },

  // 3. Atualizar Módulo de Treinamento (Anexar Certificado - Escola)
  completeModule: async (
    candidateId: string,
    moduleCode: ModuleCode,
    completionDate: string,
    schoolId: string,
    certificateName: string,
    classSheets: string[],
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const timestamp = new Date().toISOString();
      const targetStatus = currentUser.role === 'admin' ? 'completed' : 'waiting_admin';

      // Atualiza ou insere o progresso do módulo (upsert autocurativo)
      const { error: updateModErr } = await supabase
        .from('candidate_module_progress')
        .upsert({
          id: `mod-${generateId()}`,
          candidate_id: candidateId,
          module_code: moduleCode,
          status: targetStatus,
          completion_date: completionDate,
          school_id: schoolId,
          certificate_url: certificateName,
          class_sheets: classSheets,
          uploaded_at: timestamp,
          rejection_reason: null,
          updated_by: currentUser.id,
          updated_at: timestamp
        }, {
          onConflict: 'candidate_id,module_code'
        });

      if (updateModErr) {
        console.error('Erro ao salvar módulo:', updateModErr);
        return { success: false, message: 'Erro ao registrar progresso do módulo.' };
      }

      // Buscar dados do candidato
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candErr || !candidate) {
        return { success: false, message: 'Candidato não encontrado.' };
      }

      // Grava Log de Auditoria
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidateId,
        candidate_name: candidate.name,
        changed_field: `Módulo ${moduleCode.charAt(0) + moduleCode.slice(1).toLowerCase()}`,
        old_value: 'Pendente',
        new_value: targetStatus === 'completed' ? `Concluído (${certificateName})` : `Aguardando Validação (${certificateName})`
      });
      if (logErr) throw logErr;

      // Valida se todos os 3 módulos do candidato estão concluídos
      const { data: candidateModules, error: countErr } = await supabase
        .from('candidate_module_progress')
        .select('status')
        .eq('candidate_id', candidateId);

      if (countErr) throw countErr;

      const completedAll = candidateModules && candidateModules.length === 3 && candidateModules.every(m => m.status === 'completed');

      if (completedAll && candidate.status !== 'completed') {
        // Transição automática para concluído
        const { error: updateCandErr } = await supabase
          .from('candidates')
          .update({
            status: 'completed',
            selection_status: 'finalized', // Padrão automático inicial
            updated_at: timestamp
          })
          .eq('id', candidateId);
        if (updateCandErr) throw updateCandErr;

        // Log automático do sistema
        const { error: autoLogErr } = await supabase.from('audit_logs').insert({
          id: `log-${generateId()}`,
          created_at: timestamp,
          user_name: 'Sistema',
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          changed_field: 'Status Geral',
          old_value: 'Em Andamento',
          new_value: 'Curso Concluído (Gatilho Automático)'
        });
        if (autoLogErr) throw autoLogErr;

        // Notificação para o Admin (Conclusão total)
        const newNotification: Notification = {
          id: `not-${generateId()}`,
          recipientRole: 'admin',
          title: 'Treinamento Concluído',
          message: `O candidato ${candidate.name} concluiu todos os 3 módulos obrigatórios de treinamento.`,
          type: 'course_completed',
          candidateId: candidate.id,
          isRead: false,
          createdAt: timestamp
        };

        const { error: notifErr } = await supabase.from('notifications').insert({
          id: newNotification.id,
          recipient_role: newNotification.recipientRole,
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          candidate_id: newNotification.candidateId,
          is_read: newNotification.isRead,
          created_at: newNotification.createdAt
        });
        if (notifErr) throw notifErr;

        window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));
      }

      if (currentUser.role === 'school_admin') {
        const newNotification: Notification = {
          id: `not-${generateId()}`,
          recipientRole: 'admin',
          title: 'Novo Certificado Anexado',
          message: `A escola enviou o certificado do módulo ${moduleCode === 'TEORICO' ? 'Teórico' : moduleCode === 'SIMULADOR' ? 'Simulador' : 'Voo'} para o candidato ${candidate.name} (RE: ${candidate.re}).`,
          type: 'pending_validation',
          candidateId: candidate.id,
          isRead: false,
          createdAt: timestamp
        };

        const { error: notifErr } = await supabase.from('notifications').insert({
          id: newNotification.id,
          recipient_role: newNotification.recipientRole,
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          candidate_id: newNotification.candidateId,
          is_read: newNotification.isRead,
          created_at: newNotification.createdAt
        });
        if (notifErr) console.error('Erro ao enviar notificação de upload:', notifErr);
        window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));
      }

      return { success: true, message: `Módulo ${moduleCode} atualizado com sucesso.` };
    } catch (err: any) {
      console.error('Erro no completeModule:', err);
      return { success: false, message: `Erro ao atualizar módulo: ${err.message}` };
    }
  },

  rejectModule: async (
    candidateId: string,
    moduleCode: ModuleCode,
    reason: string,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem rejeitar certificados.' };
    }

    try {
      const timestamp = new Date().toISOString();

      // Buscar candidato
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candErr || !candidate) {
        return { success: false, message: 'Candidato não encontrado.' };
      }

      // Buscar o registro do progresso
      const { data: prog, error: progErr } = await supabase
        .from('candidate_module_progress')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('module_code', moduleCode)
        .single();

      if (progErr || !prog) {
        return { success: false, message: 'Registro de progresso não encontrado.' };
      }

      // Atualiza o progresso para 'pending', limpa certificado e salva a justificativa
      const { error: updateErr } = await supabase
        .from('candidate_module_progress')
        .update({
          status: 'pending',
          certificate_url: null,
          class_sheets: null,
          rejection_reason: reason,
          uploaded_at: null,
          updated_by: currentUser.id,
          updated_at: timestamp
        })
        .eq('id', prog.id);

      if (updateErr) throw updateErr;

      // Grava Log de Auditoria
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidateId,
        candidate_name: candidate.name,
        changed_field: `Módulo ${moduleCode.charAt(0) + moduleCode.slice(1).toLowerCase()}`,
        old_value: 'Aguardando Validação',
        new_value: `Recusado (Justificativa: ${reason})`
      });
      if (logErr) throw logErr;

      // Cria notificação para a escola
      const modLabel = moduleCode === 'TEORICO' ? 'Teórico' : moduleCode === 'SIMULADOR' ? 'Simulador' : 'Voo';
      const newNotification: Notification = {
        id: `not-${generateId()}`,
        recipientSchoolId: candidate.schoolId,
        title: 'Certificado Recusado',
        message: `O certificado do módulo ${modLabel} do candidato ${candidate.name} (RE: ${candidate.re}) foi recusado pelo Administrador. Motivo: ${reason}.`,
        type: 'validation_result',
        candidateId: candidateId,
        isRead: false,
        createdAt: timestamp
      };

      const { error: notifErr } = await supabase.from('notifications').insert({
        id: newNotification.id,
        recipient_school_id: newNotification.recipientSchoolId,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        candidate_id: newNotification.candidateId,
        is_read: newNotification.isRead,
        created_at: newNotification.createdAt
      });
      if (notifErr) console.error('Erro ao enviar notificação de recusa:', notifErr);
      window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

      return { success: true, message: 'Certificado rejeitado com sucesso.' };
    } catch (err: any) {
      console.error('Erro no rejectModule:', err);
      return { success: false, message: `Erro ao rejeitar certificado: ${err.message}` };
    }
  },

  // 4. Alterar Status do Processo Seletivo (Apenas Admin)
  updateSelectionStatus: async (
    candidateId: string,
    newStatus: SelectionStatus,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem atualizar o processo seletivo.' };
    }

    try {
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candErr || !candidate) {
        return { success: false, message: 'Candidato não encontrado.' };
      }

      if (candidate.status !== 'completed') {
        return { success: false, message: 'Apenas candidatos com o treinamento concluído podem entrar no processo seletivo.' };
      }

      const oldStatus = candidate.selection_status;
      const timestamp = new Date().toISOString();

      // Atualiza Status do Processo Seletivo
      const updateData: any = {
        selection_status: newStatus,
        updated_at: timestamp
      };
      if (newStatus === 'rejected') {
        updateData.rejected_at = timestamp;
      } else {
        updateData.rejected_at = null;
      }

      const { error: updateErr } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('id', candidateId);

      if (updateErr) throw updateErr;

      // Grava Log de Auditoria
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        changed_field: 'Status Seleção',
        old_value: getSelectionStatusLabel(oldStatus as SelectionStatus),
        new_value: getSelectionStatusLabel(newStatus)
      });
      if (logErr) throw logErr;

      // Envia Notificação para a Escola em tempo real
      const newNotification: Notification = {
        id: `not-${generateId()}`,
        recipientSchoolId: candidate.school_id,
        title: 'Status Processo Seletivo',
        message: `O status do processo seletivo do candidato ${candidate.name} foi atualizado para: "${getSelectionStatusLabel(newStatus)}".`,
        type: 'selection_status_update',
        candidateId: candidate.id,
        isRead: false,
        createdAt: timestamp
      };

      const { error: notifErr } = await supabase.from('notifications').insert({
        id: newNotification.id,
        recipient_school_id: newNotification.recipientSchoolId,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        candidate_id: newNotification.candidateId,
        is_read: newNotification.isRead,
        created_at: newNotification.createdAt
      });
      if (notifErr) throw notifErr;

      window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

      return { success: true, message: 'Status do processo seletivo atualizado com sucesso.' };
    } catch (err: any) {
      console.error('Erro no updateSelectionStatus:', err);
      return { success: false, message: `Erro ao atualizar processo seletivo: ${err.message}` };
    }
  },

  // 4.1 Atualizar Status Gupy
  updateGupyStatus: async (
    candidateId: string,
    gupyStatus: GupyStatus,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candErr || !candidate) {
        return { success: false, message: 'Candidato não encontrado.' };
      }

      const oldGupy = candidate.gupy_status;
      const timestamp = new Date().toISOString();

      const { error: updateErr } = await supabase
        .from('candidates')
        .update({
          gupy_status: gupyStatus,
          updated_at: timestamp
        })
        .eq('id', candidateId);

      if (updateErr) throw updateErr;

      // Grava Log de Auditoria
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        changed_field: 'Status Gupy',
        old_value: oldGupy === 'gupy_min' ? 'Na Gupy (com mínimos)' : oldGupy === 'gupy_no_min' ? 'Na Gupy (sem mínimos)' : oldGupy === 'not_gupy' ? 'Não está na Gupy' : 'Não Informado',
        new_value: gupyStatus === 'gupy_min' ? 'Na Gupy (com mínimos)' : gupyStatus === 'gupy_no_min' ? 'Na Gupy (sem mínimos)' : 'Não está na Gupy'
      });
      if (logErr) throw logErr;

      return { success: true, message: 'Status Gupy atualizado com sucesso.' };
    } catch (err: any) {
      console.error('Erro no updateGupyStatus:', err);
      return { success: false, message: `Erro ao atualizar status Gupy: ${err.message}` };
    }
  },

  // 5. Editar ou Anular Módulo (Apenas Admin)
  adminEditModule: async (
    candidateId: string,
    moduleCode: ModuleCode,
    status: ModuleStatus,
    completionDate: string | undefined,
    schoolId: string | undefined,
    certificateName: string | undefined,
    classSheets: string[] | undefined,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem editar módulos.' };
    }

    try {
      const timestamp = new Date().toISOString();

      // Buscar módulo atual
      const { data: oldModule, error: oldModErr } = await supabase
        .from('candidate_module_progress')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('module_code', moduleCode)
        .single();

      if (oldModErr || !oldModule) {
        return { success: false, message: 'Registro do módulo não encontrado.' };
      }

      if (status === 'pending') {
        // Anulação
        const { error: updateErr } = await supabase
          .from('candidate_module_progress')
          .update({
            status: 'pending',
            completion_date: null,
            school_id: null,
            certificate_url: null,
            class_sheets: null,
            uploaded_at: null,
            updated_by: null,
            updated_at: timestamp
          })
          .eq('candidate_id', candidateId)
          .eq('module_code', moduleCode);
        if (updateErr) throw updateErr;
      } else {
        // Edição
        const { error: updateErr } = await supabase
          .from('candidate_module_progress')
          .update({
            status: 'completed',
            completion_date: completionDate || null,
            school_id: schoolId || null,
            certificate_url: certificateName || null,
            class_sheets: classSheets || null,
            updated_by: currentUser.id,
            updated_at: timestamp
          })
          .eq('candidate_id', candidateId)
          .eq('module_code', moduleCode);
        if (updateErr) throw updateErr;
      }

      // Buscar dados do candidato
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candErr) throw candErr;

      if (candidate) {
        // Obter módulos atualizados
        const { data: candidateModules, error: countErr } = await supabase
          .from('candidate_module_progress')
          .select('status')
          .eq('candidate_id', candidateId);

        if (countErr) throw countErr;

        const completedAll = candidateModules && candidateModules.length === 3 && candidateModules.every(m => m.status === 'completed');

        const oldStatus = candidate.status;
        let newStatus = candidate.status;
        let newSelectionStatus = candidate.selection_status;

        if (completedAll && candidate.status !== 'completed') {
          newStatus = 'completed';
          newSelectionStatus = 'finalized';
        } else if (!completedAll && candidate.status === 'completed') {
          newStatus = 'in_progress';
          newSelectionStatus = 'finalized';
        }

        const { error: updateCandErr } = await supabase
          .from('candidates')
          .update({
            status: newStatus,
            selection_status: newSelectionStatus,
            updated_at: timestamp
          })
          .eq('id', candidateId);
        if (updateCandErr) throw updateCandErr;

        // Grava Logs de Auditoria
        const logsToInsert = [];

        logsToInsert.push({
          id: `log-${generateId()}`,
          created_at: timestamp,
          user_id: currentUser.id,
          user_name: currentUser.name,
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          changed_field: `Módulo ${moduleCode.charAt(0) + moduleCode.slice(1).toLowerCase()}`,
          old_value: oldModule.status === 'completed' ? `Concluído (${oldModule.certificate_url})` : 'Pendente',
          new_value: status === 'pending' ? 'Pendente (Anulado)' : `Editado (${certificateName})`
        });

        if (oldStatus !== newStatus) {
          logsToInsert.push({
            id: `log-${generateId()}`,
            created_at: timestamp,
            user_name: 'Sistema',
            candidate_id: candidate.id,
            candidate_name: candidate.name,
            changed_field: 'Status Geral',
            old_value: getCandidateStatusLabel(oldStatus as CandidateStatus),
            new_value: getCandidateStatusLabel(newStatus as CandidateStatus)
          });
        }

        const { error: logsErr } = await supabase.from('audit_logs').insert(logsToInsert);
        if (logsErr) throw logsErr;
      }

      return { success: true, message: status === 'pending' ? 'Módulo anulado com sucesso.' : 'Módulo atualizado com sucesso.' };
    } catch (err: any) {
      console.error('Erro no adminEditModule:', err);
      return { success: false, message: `Erro ao editar módulo: ${err.message}` };
    }
  },

  // 10. Alterar senha
  changePassword: async (
    _oldPass: string,
    newPass: string,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (newPass === 'crpazul1234*') {
        return { success: false, message: 'Você não pode usar a senha padrão como sua nova senha.' };
      }

      // Atualiza Senha no Supabase Auth
      const { error: authErr } = await supabase.auth.updateUser({ password: newPass });
      if (authErr) throw authErr;

      // Auditoria
      const timestamp = new Date().toISOString();
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_name: currentUser.name,
        user_id: currentUser.id,
        candidate_id: '-',
        candidate_name: 'Sistema (Segurança)',
        changed_field: 'Alteração de Senha',
        old_value: '********',
        new_value: 'Senha alterada com sucesso'
      });
      if (logErr) throw logErr;

      return { success: true, message: 'Senha alterada com sucesso!' };
    } catch (err: any) {
      console.error('Erro no changePassword:', err);
      return { success: false, message: `Erro ao alterar senha: ${err.message}` };
    }
  },

  // 11. Resetar senha por Admin
  resetPassword: async (
    schoolUserId: string,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Acesso negado: apenas administradores podem redefinir senhas.' };
    }

    try {
      const { data: targetUser, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', schoolUserId)
        .single();

      if (userErr || !targetUser) {
        return { success: false, message: 'Usuário escolar não encontrado.' };
      }

      // Disparar e-mail de redefinição de senha do Supabase
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetUser.email, {
        redirectTo: window.location.origin
      });

      if (resetErr) throw resetErr;

      // Auditoria
      const timestamp = new Date().toISOString();
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_name: currentUser.name,
        user_id: currentUser.id,
        candidate_id: '-',
        candidate_name: targetUser.name,
        changed_field: 'Solicitação de Redefinição de Senha',
        old_value: '********',
        new_value: 'E-mail de recuperação enviado pelo Admin'
      });
      if (logErr) throw logErr;

      return { success: true, message: 'E-mail de redefinição de senha enviado com sucesso!' };
    } catch (err: any) {
      console.error('Erro no resetPassword:', err);
      return { success: false, message: `Erro ao solicitar redefinição de senha: ${err.message}` };
    }
  },

  resetCandidateWorkflow: async (
    candidateId: string,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem reiniciar o processo.' };
    }

    try {
      const timestamp = new Date().toISOString();

      // Buscar dados do candidato
      const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candErr || !candidate) {
        return { success: false, message: 'Candidato não encontrado.' };
      }

      // Reiniciar status do candidato no banco de dados
      const { error: updateErr } = await supabase
        .from('candidates')
        .update({
          status: 'in_progress',
          selection_status: 'finalized',
          rejected_at: null,
          updated_at: timestamp
        })
        .eq('id', candidateId);

      if (updateErr) throw updateErr;

      // Limpar todos os registros de progresso de módulo
      const { error: resetModsErr } = await supabase
        .from('candidate_module_progress')
        .update({
          status: 'pending',
          completion_date: null,
          school_id: null,
          certificate_url: null,
          class_sheets: null,
          uploaded_at: null,
          updated_by: null,
          updated_at: timestamp
        })
        .eq('candidate_id', candidateId);

      if (resetModsErr) throw resetModsErr;

      // Registrar Log de Auditoria
      const { error: logErr } = await supabase.from('audit_logs').insert({
        id: `log-${generateId()}`,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        changed_field: 'Fluxo Geral',
        old_value: 'Reprovado (Quarentena Finalizada)',
        new_value: 'Treinamento Reiniciado'
      });
      if (logErr) throw logErr;

      return { success: true, message: 'Processo do candidato reiniciado com sucesso!' };
    } catch (err: any) {
      console.error('Erro no resetCandidateWorkflow:', err);
      return { success: false, message: `Erro ao reiniciar processo: ${err.message}` };
    }
  }
};
