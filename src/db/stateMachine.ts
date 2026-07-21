import { db, auth } from './firebaseClient';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import type {
  Notification,
  CandidateStatus,
  SelectionStatus,
  ModuleCode,
  User,
  ModuleStatus,
  GupyStatus
} from './mockDb';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const getSelectionStatusLabel = (status: SelectionStatus): string => {
  switch (status) {
    case 'finalized': return 'Finalizou';
    case 'in_selection': return 'Processo Seletivo';
    case 'hired': return 'Contratado';
    case 'rejected': return 'Reprovado';
    default: return status;
  }
};

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
  // 1. Cadastrar candidato
  createCandidate: async (
    re: string,
    name: string,
    anac: string,
    schoolId: string,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Validações de Unicidade no Firestore
      const reQuery = query(collection(db, 'candidates'), where('re', '==', re));
      const reSnap = await getDocs(reQuery);
      if (!reSnap.empty) {
        return { success: false, message: `Já existe um candidato cadastrado com o RE: ${re}` };
      }

      const anacQuery = query(collection(db, 'candidates'), where('anac', '==', anac));
      const anacSnap = await getDocs(anacQuery);
      if (!anacSnap.empty) {
        return { success: false, message: `Já existe um candidato cadastrado com a licença ANAC: ${anac}` };
      }

      const candId = `cand-${generateId()}`;
      const timestamp = new Date().toISOString();

      // Grava Candidato
      await setDoc(doc(db, 'candidates', candId), {
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

      // Grava Log de Auditoria
      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candId,
        candidate_name: name,
        changed_field: 'Cadastro',
        old_value: '-',
        new_value: `Criado no sistema por ${currentUser.name}`
      });

      // Buscar nome da Escola
      let schoolName = 'Escola Parceira';
      const schoolSnap = await getDoc(doc(db, 'schools', schoolId));
      if (schoolSnap.exists()) {
        schoolName = schoolSnap.data().name || schoolName;
      }

      // Notificação
      const notifId = `not-${generateId()}`;
      const newNotification: Notification = {
        id: notifId,
        recipientRole: 'admin',
        title: 'Novo candidato pendente de validação',
        message: `A escola ${schoolName} cadastrou o candidato ${name} (RE: ${re}, ANAC: ${anac}).`,
        type: 'pending_validation',
        candidateId: candId,
        isRead: false,
        createdAt: timestamp
      };

      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        recipient_role: newNotification.recipientRole,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        candidate_id: newNotification.candidateId,
        is_read: newNotification.isRead,
        created_at: newNotification.createdAt
      });

      window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

      return { success: true, message: 'Candidato enviado com sucesso! Aguardando validação.' };
    } catch (err: any) {
      console.error('Erro no createCandidate:', err);
      return { success: false, message: `Erro ao cadastrar candidato: ${err.message}` };
    }
  },

  // 2. Validação do Funcionário
  validateCandidate: async (
    candidateId: string,
    approve: boolean,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem validar candidatos.' };
    }

    try {
      const candRef = doc(db, 'candidates', candidateId);
      const candSnap = await getDoc(candRef);
      if (!candSnap.exists()) {
        return { success: false, message: 'Candidato não encontrado.' };
      }

      const candidate = candSnap.data();
      const oldStatus = candidate.status;
      const newStatus: CandidateStatus = approve ? 'in_progress' : 'rejected';
      const timestamp = new Date().toISOString();

      await updateDoc(candRef, {
        status: newStatus,
        validated_by: currentUser.id,
        validated_at: timestamp,
        updated_at: timestamp
      });

      // Log
      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        changed_field: 'Validação',
        old_value: getCandidateStatusLabel(oldStatus as CandidateStatus),
        new_value: getCandidateStatusLabel(newStatus)
      });

      // Instancia os 3 módulos pendentes se aprovado
      if (approve) {
        const batch = writeBatch(db);
        const modules: ModuleCode[] = ['TEORICO', 'SIMULADOR', 'VOO'];
        modules.forEach((mCode) => {
          const modId = `mod-${candidateId}-${mCode}`;
          batch.set(doc(db, 'candidate_module_progress', modId), {
            id: modId,
            candidate_id: candidate.id,
            module_code: mCode,
            status: 'pending',
            updated_at: timestamp
          }, { merge: true });
        });
        await batch.commit();
      }

      // Notificação para a escola
      const resultText = approve ? 'aprovado' : 'recusado';
      const notifId = `not-${generateId()}`;
      const newNotification: Notification = {
        id: notifId,
        recipientSchoolId: candidate.school_id,
        title: `Candidato ${resultText}`,
        message: `O candidato ${candidate.name} (RE: ${candidate.re}) foi ${resultText} pelo Administrador.`,
        type: 'validation_result',
        candidateId: candidate.id,
        isRead: false,
        createdAt: timestamp
      };

      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        recipient_school_id: newNotification.recipientSchoolId,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        candidate_id: newNotification.candidateId,
        is_read: newNotification.isRead,
        created_at: newNotification.createdAt
      });

      window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

      return { success: true, message: `Candidato ${approve ? 'aprovado' : 'recusado'} com sucesso.` };
    } catch (err: any) {
      console.error('Erro no validateCandidate:', err);
      return { success: false, message: `Erro ao validar candidato: ${err.message}` };
    }
  },

  // 3. Atualizar Módulo de Treinamento
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
      const modId = `mod-${candidateId}-${moduleCode}`;

      await setDoc(doc(db, 'candidate_module_progress', modId), {
        id: modId,
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
      }, { merge: true });

      const candRef = doc(db, 'candidates', candidateId);
      const candSnap = await getDoc(candRef);
      if (!candSnap.exists()) {
        return { success: false, message: 'Candidato não encontrado.' };
      }
      const candidate = candSnap.data();

      // Log
      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidateId,
        candidate_name: candidate.name,
        changed_field: `Módulo ${moduleCode.charAt(0) + moduleCode.slice(1).toLowerCase()}`,
        old_value: 'Pendente',
        new_value: targetStatus === 'completed' ? `Concluído (${certificateName})` : `Aguardando Validação (${certificateName})`
      });

      // Valida se todos os 3 módulos estão concluídos
      const modQuery = query(collection(db, 'candidate_module_progress'), where('candidate_id', '==', candidateId));
      const modSnap = await getDocs(modQuery);
      const modules = modSnap.docs.map(d => d.data());
      const completedAll = modules.length === 3 && modules.every(m => m.status === 'completed');

      if (completedAll && candidate.status !== 'completed') {
        await updateDoc(candRef, {
          status: 'completed',
          selection_status: 'finalized',
          updated_at: timestamp
        });

        // Log de conclusão
        const autoLogId = `log-${generateId()}`;
        await setDoc(doc(db, 'audit_logs', autoLogId), {
          id: autoLogId,
          created_at: timestamp,
          user_name: 'Sistema',
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          changed_field: 'Status Geral',
          old_value: 'Em Andamento',
          new_value: 'Curso Concluído (Gatilho Automático)'
        });

        // Notificação Admin
        const notifId = `not-${generateId()}`;
        const newNotification: Notification = {
          id: notifId,
          recipientRole: 'admin',
          title: 'Treinamento Concluído',
          message: `O candidato ${candidate.name} concluiu todos os 3 módulos obrigatórios de treinamento.`,
          type: 'course_completed',
          candidateId: candidate.id,
          isRead: false,
          createdAt: timestamp
        };

        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          recipient_role: newNotification.recipientRole,
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          candidate_id: newNotification.candidateId,
          is_read: newNotification.isRead,
          created_at: newNotification.createdAt
        });

        window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));
      }

      if (currentUser.role === 'school_admin') {
        const notifId = `not-${generateId()}`;
        const newNotification: Notification = {
          id: notifId,
          recipientRole: 'admin',
          title: 'Novo Certificado Anexado',
          message: `A escola enviou o certificado do módulo ${moduleCode === 'TEORICO' ? 'Teórico' : moduleCode === 'SIMULADOR' ? 'Simulador' : 'Voo'} para o candidato ${candidate.name} (RE: ${candidate.re}).`,
          type: 'pending_validation',
          candidateId: candidate.id,
          isRead: false,
          createdAt: timestamp
        };

        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          recipient_role: newNotification.recipientRole,
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          candidate_id: newNotification.candidateId,
          is_read: newNotification.isRead,
          created_at: newNotification.createdAt
        });

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
      const candSnap = await getDoc(doc(db, 'candidates', candidateId));
      if (!candSnap.exists()) return { success: false, message: 'Candidato não encontrado.' };
      const candidate = candSnap.data();

      const modId = `mod-${candidateId}-${moduleCode}`;
      await updateDoc(doc(db, 'candidate_module_progress', modId), {
        status: 'pending',
        certificate_url: null,
        class_sheets: null,
        rejection_reason: reason,
        uploaded_at: null,
        updated_by: currentUser.id,
        updated_at: timestamp
      });

      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidateId,
        candidate_name: candidate.name,
        changed_field: `Módulo ${moduleCode.charAt(0) + moduleCode.slice(1).toLowerCase()}`,
        old_value: 'Aguardando Validação',
        new_value: `Recusado (Justificativa: ${reason})`
      });

      const modLabel = moduleCode === 'TEORICO' ? 'Teórico' : moduleCode === 'SIMULADOR' ? 'Simulador' : 'Voo';
      const notifId = `not-${generateId()}`;
      const newNotification: Notification = {
        id: notifId,
        recipientSchoolId: candidate.school_id,
        title: 'Certificado Recusado',
        message: `O certificado do módulo ${modLabel} do candidato ${candidate.name} (RE: ${candidate.re}) foi recusado pelo Administrador. Motivo: ${reason}.`,
        type: 'validation_result',
        candidateId: candidateId,
        isRead: false,
        createdAt: timestamp
      };

      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        recipient_school_id: newNotification.recipientSchoolId,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        candidate_id: newNotification.candidateId,
        is_read: newNotification.isRead,
        created_at: newNotification.createdAt
      });

      window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

      return { success: true, message: 'Certificado rejeitado com sucesso.' };
    } catch (err: any) {
      console.error('Erro no rejectModule:', err);
      return { success: false, message: `Erro ao rejeitar certificado: ${err.message}` };
    }
  },

  updateSelectionStatus: async (
    candidateId: string,
    newStatus: SelectionStatus,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem atualizar o processo seletivo.' };
    }

    try {
      const candRef = doc(db, 'candidates', candidateId);
      const candSnap = await getDoc(candRef);
      if (!candSnap.exists()) return { success: false, message: 'Candidato não encontrado.' };
      const candidate = candSnap.data();

      if (candidate.status !== 'completed') {
        return { success: false, message: 'Apenas candidatos com o treinamento concluído podem entrar no processo seletivo.' };
      }

      const oldStatus = candidate.selection_status;
      const timestamp = new Date().toISOString();

      const updateData: any = {
        selection_status: newStatus,
        updated_at: timestamp,
        rejected_at: newStatus === 'rejected' ? timestamp : null
      };

      await updateDoc(candRef, updateData);

      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        changed_field: 'Status Seleção',
        old_value: getSelectionStatusLabel(oldStatus as SelectionStatus),
        new_value: getSelectionStatusLabel(newStatus)
      });

      const notifId = `not-${generateId()}`;
      const newNotification: Notification = {
        id: notifId,
        recipientSchoolId: candidate.school_id,
        title: 'Status Processo Seletivo',
        message: `O status do processo seletivo do candidato ${candidate.name} foi atualizado para: "${getSelectionStatusLabel(newStatus)}".`,
        type: 'selection_status_update',
        candidateId: candidate.id,
        isRead: false,
        createdAt: timestamp
      };

      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        recipient_school_id: newNotification.recipientSchoolId,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        candidate_id: newNotification.candidateId,
        is_read: newNotification.isRead,
        created_at: newNotification.createdAt
      });

      window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));

      return { success: true, message: 'Status do processo seletivo atualizado com sucesso.' };
    } catch (err: any) {
      console.error('Erro no updateSelectionStatus:', err);
      return { success: false, message: `Erro ao atualizar processo seletivo: ${err.message}` };
    }
  },

  updateGupyStatus: async (
    candidateId: string,
    gupyStatus: GupyStatus,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const candRef = doc(db, 'candidates', candidateId);
      const candSnap = await getDoc(candRef);
      if (!candSnap.exists()) return { success: false, message: 'Candidato não encontrado.' };
      const candidate = candSnap.data();

      const oldGupy = candidate.gupy_status;
      const timestamp = new Date().toISOString();

      await updateDoc(candRef, {
        gupy_status: gupyStatus,
        updated_at: timestamp
      });

      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        changed_field: 'Status Gupy',
        old_value: oldGupy === 'gupy_min' ? 'Na Gupy (com mínimos)' : oldGupy === 'gupy_no_min' ? 'Na Gupy (sem mínimos)' : oldGupy === 'not_gupy' ? 'Não está na Gupy' : 'Não Informado',
        new_value: gupyStatus === 'gupy_min' ? 'Na Gupy (com mínimos)' : gupyStatus === 'gupy_no_min' ? 'Na Gupy (sem mínimos)' : 'Não está na Gupy'
      });

      return { success: true, message: 'Status Gupy atualizado com sucesso.' };
    } catch (err: any) {
      console.error('Erro no updateGupyStatus:', err);
      return { success: false, message: `Erro ao atualizar status Gupy: ${err.message}` };
    }
  },

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
      const modId = `mod-${candidateId}-${moduleCode}`;
      const modRef = doc(db, 'candidate_module_progress', modId);

      if (status === 'pending') {
        await updateDoc(modRef, {
          status: 'pending',
          completion_date: null,
          school_id: null,
          certificate_url: null,
          class_sheets: null,
          uploaded_at: null,
          updated_by: null,
          updated_at: timestamp
        });
      } else {
        await updateDoc(modRef, {
          status: 'completed',
          completion_date: completionDate || null,
          school_id: schoolId || null,
          certificate_url: certificateName || null,
          class_sheets: classSheets || null,
          updated_by: currentUser.id,
          updated_at: timestamp
        });
      }

      const candRef = doc(db, 'candidates', candidateId);
      const candSnap = await getDoc(candRef);
      if (candSnap.exists()) {
        const candidate = candSnap.data();
        const modQuery = query(collection(db, 'candidate_module_progress'), where('candidate_id', '==', candidateId));
        const modSnap = await getDocs(modQuery);
        const modules = modSnap.docs.map(d => d.data());
        const completedAll = modules.length === 3 && modules.every(m => m.status === 'completed');

        let newStatus = candidate.status;
        let newSelectionStatus = candidate.selection_status;

        if (completedAll && candidate.status !== 'completed') {
          newStatus = 'completed';
          newSelectionStatus = 'finalized';
        } else if (!completedAll && candidate.status === 'completed') {
          newStatus = 'in_progress';
          newSelectionStatus = 'finalized';
        }

        await updateDoc(candRef, {
          status: newStatus,
          selection_status: newSelectionStatus,
          updated_at: timestamp
        });
      }

      return { success: true, message: status === 'pending' ? 'Módulo anulado com sucesso.' : 'Módulo atualizado com sucesso.' };
    } catch (err: any) {
      console.error('Erro no adminEditModule:', err);
      return { success: false, message: `Erro ao editar módulo: ${err.message}` };
    }
  },

  // 10. Alterar senha via Firebase Auth
  changePassword: async (
    _oldPass: string,
    newPass: string,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (newPass === 'crpazul1234*') {
        return { success: false, message: 'Você não pode usar a senha padrão como sua nova senha.' };
      }

      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPass);
      }

      const timestamp = new Date().toISOString();
      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_name: currentUser.name,
        user_id: currentUser.id,
        candidate_id: '-',
        candidate_name: 'Sistema (Segurança)',
        changed_field: 'Alteração de Senha',
        old_value: '********',
        new_value: 'Senha alterada com sucesso'
      });

      return { success: true, message: 'Senha alterada com sucesso!' };
    } catch (err: any) {
      console.error('Erro no changePassword:', err);
      return { success: false, message: `Erro ao alterar senha: ${err.message}` };
    }
  },

  // 11. Resetar senha por Admin
  resetPassword: async (
    schoolUserId: string,
    newPassword: string,
    currentUser: User
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Acesso negado: apenas administradores podem redefinir senhas.' };
    }

    try {
      const userRef = doc(db, 'users', schoolUserId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return { success: false, message: 'Usuário não encontrado.' };

      const targetUser = userSnap.data();
      await updateDoc(userRef, {
        password: newPassword,
        updated_at: new Date().toISOString()
      });

      const timestamp = new Date().toISOString();
      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_name: currentUser.name,
        user_id: currentUser.id,
        candidate_id: '-',
        candidate_name: targetUser.name,
        changed_field: 'Redefinição Direta de Senha',
        old_value: '********',
        new_value: 'Nova senha definida pelo Admin'
      });

      return { success: true, message: 'Senha redefinida com sucesso!' };
    } catch (err: any) {
      console.error('Erro no resetPassword:', err);
      return { success: false, message: `Erro ao redefinir senha: ${err.message}` };
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
      const candRef = doc(db, 'candidates', candidateId);
      const candSnap = await getDoc(candRef);
      if (!candSnap.exists()) return { success: false, message: 'Candidato não encontrado.' };
      const candidate = candSnap.data();

      await updateDoc(candRef, {
        status: 'in_progress',
        selection_status: 'finalized',
        rejected_at: null,
        updated_at: timestamp
      });

      const modQuery = query(collection(db, 'candidate_module_progress'), where('candidate_id', '==', candidateId));
      const modSnap = await getDocs(modQuery);
      const batch = writeBatch(db);
      modSnap.docs.forEach((mDoc) => {
        batch.update(mDoc.ref, {
          status: 'pending',
          completion_date: null,
          school_id: null,
          certificate_url: null,
          class_sheets: null,
          uploaded_at: null,
          updated_by: null,
          updated_at: timestamp
        });
      });
      await batch.commit();

      const logId = `log-${generateId()}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        created_at: timestamp,
        user_id: currentUser.id,
        user_name: currentUser.name,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        changed_field: 'Fluxo Geral',
        old_value: 'Reprovado (Quarentena Finalizada)',
        new_value: 'Treinamento Reiniciado'
      });

      return { success: true, message: 'Processo do candidato reiniciado com sucesso!' };
    } catch (err: any) {
      console.error('Erro no resetCandidateWorkflow:', err);
      return { success: false, message: `Erro ao reiniciar processo: ${err.message}` };
    }
  }
};
