import { supabase } from './supabaseClient';

export type UserRole = 'admin' | 'school_admin';
export type CandidateStatus = 'pending_validation' | 'rejected' | 'in_progress' | 'completed';
export type SelectionStatus = 'finalized' | 'in_selection' | 'hired';
export type GupyStatus = 'gupy_min' | 'gupy_no_min' | 'not_gupy';
export type ModuleCode = 'TEORICO' | 'SIMULADOR' | 'VOO';
export type ModuleStatus = 'pending' | 'waiting_admin' | 'completed';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  schoolId?: string; // Presente se role for 'school_admin'
}

export interface School {
  id: string;
  name: string;
  cnpj?: string;
  active: boolean;
  contactName: string;
  email: string;
  phone: string;
}

export interface Candidate {
  id: string;
  re: string;
  name: string;
  anac: string;
  schoolId: string;
  status: CandidateStatus;
  selectionStatus: SelectionStatus;
  gupyStatus?: GupyStatus;
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateModuleProgress {
  id: string;
  candidateId: string;
  moduleCode: ModuleCode;
  status: ModuleStatus;
  completionDate?: string;
  schoolId?: string;
  certificateUrl?: string;
  classSheets?: string[];
  uploadedAt?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  candidateId: string;
  candidateName: string;
  changedField: string;
  oldValue: string;
  newValue: string;
}

export interface Notification {
  id: string;
  recipientUserId?: string;
  recipientSchoolId?: string;
  recipientRole?: string;
  title: string;
  message: string;
  type: 'pending_validation' | 'validation_result' | 'course_completed' | 'selection_status_update';
  candidateId?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

// Dados mockados iniciais para Seeding
const INITIAL_USERS: User[] = [
  { id: 'usr-admin', email: 'admin@empresa.com', name: 'Admin Geral (Minha Empresa)', role: 'admin', password: 'crpazul1234*' },
  { id: 'usr-alfa', email: 'contato@escolaalfa.com.br', name: 'Renato Silva', role: 'school_admin', schoolId: 'sch-alfa', password: 'crpazul1234*' },
  { id: 'usr-beta', email: 'contato@escolabeta.com.br', name: 'Ana Souza', role: 'school_admin', schoolId: 'sch-beta', password: 'crpazul1234*' }
];

const INITIAL_SCHOOLS: School[] = [
  { id: 'sch-alfa', name: 'Escola Recomendada Alfa', cnpj: '12345678000199', active: true, contactName: 'Renato Silva', email: 'contato@escolaalfa.com.br', phone: '11999998888' },
  { id: 'sch-beta', name: 'Escola Recomendada Beta', cnpj: '98765432000188', active: true, contactName: 'Ana Souza', email: 'contato@escolabeta.com.br', phone: '11988887777' }
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    re: 'RE-1092',
    name: 'Roberto Alencar',
    anac: 'ANAC-99281',
    schoolId: 'sch-alfa',
    status: 'completed',
    selectionStatus: 'finalized',
    gupyStatus: 'gupy_min',
    validatedBy: 'usr-admin',
    validatedAt: '2026-07-10T10:00:00Z',
    createdAt: '2026-07-09T14:32:00Z',
    updatedAt: '2026-07-12T16:45:00Z'
  },
  {
    id: 'cand-2',
    re: 'RE-8823',
    name: 'Mariana Costa',
    anac: 'ANAC-44123',
    schoolId: 'sch-beta',
    status: 'in_progress',
    selectionStatus: 'finalized',
    validatedBy: 'usr-admin',
    validatedAt: '2026-07-12T09:15:00Z',
    createdAt: '2026-07-11T16:20:00Z',
    updatedAt: '2026-07-12T11:00:00Z'
  },
  {
    id: 'cand-3',
    re: 'RE-5561',
    name: 'Vitor Fernandes',
    anac: 'ANAC-88772',
    schoolId: 'sch-alfa',
    status: 'pending_validation',
    selectionStatus: 'finalized',
    createdAt: '2026-07-14T11:00:00Z',
    updatedAt: '2026-07-14T11:00:00Z'
  }
];

const INITIAL_MODULE_PROGRESS: CandidateModuleProgress[] = [
  {
    id: 'mod-1',
    candidateId: 'cand-1',
    moduleCode: 'TEORICO',
    status: 'completed',
    completionDate: '2026-07-11',
    schoolId: 'sch-alfa',
    certificateUrl: 'certificado_teorico_roberto.pdf',
    uploadedAt: '2026-07-11T15:00:00Z',
    updatedBy: 'usr-alfa',
    updatedAt: '2026-07-11T15:00:00Z'
  },
  {
    id: 'mod-2',
    candidateId: 'cand-1',
    moduleCode: 'SIMULADOR',
    status: 'completed',
    completionDate: '2026-07-12',
    schoolId: 'sch-alfa',
    certificateUrl: 'certificado_simulador_roberto.pdf',
    uploadedAt: '2026-07-12T11:20:00Z',
    updatedBy: 'usr-alfa',
    updatedAt: '2026-07-12T11:20:00Z'
  },
  {
    id: 'mod-3',
    candidateId: 'cand-1',
    moduleCode: 'VOO',
    status: 'completed',
    completionDate: '2026-07-12',
    schoolId: 'sch-alfa',
    certificateUrl: 'certificado_voo_roberto.pdf',
    uploadedAt: '2026-07-12T16:45:00Z',
    updatedBy: 'usr-alfa',
    updatedAt: '2026-07-12T16:45:00Z'
  },
  {
    id: 'mod-4',
    candidateId: 'cand-2',
    moduleCode: 'TEORICO',
    status: 'completed',
    completionDate: '2026-07-12',
    schoolId: 'sch-beta',
    certificateUrl: 'certificado_teorico_mariana.pdf',
    uploadedAt: '2026-07-12T11:00:00Z',
    updatedBy: 'usr-beta',
    updatedAt: '2026-07-12T11:00:00Z'
  },
  {
    id: 'mod-5',
    candidateId: 'cand-2',
    moduleCode: 'SIMULADOR',
    status: 'waiting_admin',
    completionDate: '2026-07-14',
    schoolId: 'sch-beta',
    certificateUrl: 'certificado_simulador_mariana.pdf',
    uploadedAt: '2026-07-14T14:20:00Z',
    updatedBy: 'usr-beta',
    updatedAt: '2026-07-14T14:20:00Z'
  },
  {
    id: 'mod-6',
    candidateId: 'cand-2',
    moduleCode: 'VOO',
    status: 'pending',
    updatedAt: '2026-07-12T09:15:00Z'
  }
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    createdAt: '2026-07-09T14:32:00Z',
    userName: 'Renato Silva (Alfa)',
    userId: 'usr-alfa',
    candidateId: 'cand-1',
    candidateName: 'Roberto Alencar',
    changedField: 'Cadastro',
    oldValue: '-',
    newValue: 'Criado no sistema pela Escola Alfa'
  },
  {
    id: 'log-2',
    createdAt: '2026-07-10T10:00:00Z',
    userName: 'Admin Geral (Minha Empresa)',
    userId: 'usr-admin',
    candidateId: 'cand-1',
    candidateName: 'Roberto Alencar',
    changedField: 'Validação',
    oldValue: 'Pendente de Validação',
    newValue: 'Aprovado (Validação Concluída)'
  },
  {
    id: 'log-3',
    createdAt: '2026-07-11T15:00:00Z',
    userName: 'Renato Silva (Alfa)',
    userId: 'usr-alfa',
    candidateId: 'cand-1',
    candidateName: 'Roberto Alencar',
    changedField: 'Módulo Teórico',
    oldValue: 'Pendente',
    newValue: 'Concluído (Certificado Anexado)'
  },
  {
    id: 'log-4',
    createdAt: '2026-07-12T11:20:00Z',
    userName: 'Renato Silva (Alfa)',
    userId: 'usr-alfa',
    candidateId: 'cand-1',
    candidateName: 'Roberto Alencar',
    changedField: 'Módulo Simulador',
    oldValue: 'Pendente',
    newValue: 'Concluído (Certificado Anexado)'
  },
  {
    id: 'log-5',
    createdAt: '2026-07-12T16:45:00Z',
    userName: 'Renato Silva (Alfa)',
    userId: 'usr-alfa',
    candidateId: 'cand-1',
    candidateName: 'Roberto Alencar',
    changedField: 'Módulo Voo',
    oldValue: 'Pendente',
    newValue: 'Concluído (Certificado Anexado)'
  },
  {
    id: 'log-6',
    createdAt: '2026-07-12T16:45:00Z',
    userName: 'System',
    candidateId: 'cand-1',
    candidateName: 'Roberto Alencar',
    changedField: 'Status Geral',
    oldValue: 'Em Andamento',
    newValue: 'Curso Concluído (Gatilho Automático)'
  },
  {
    id: 'log-7',
    createdAt: '2026-07-14T14:20:00Z',
    userName: 'Ana Souza (Beta)',
    userId: 'usr-beta',
    candidateId: 'cand-2',
    candidateName: 'Mariana Costa',
    changedField: 'Módulo Simulador',
    oldValue: 'Pendente',
    newValue: 'Enviado para aprovação do Admin (Certificado Anexado)'
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    recipientRole: 'admin',
    title: 'Novo candidato pendente de validação',
    message: 'A escola Escola Recomendada Alfa enviou o candidato Vitor Fernandes para validação.',
    type: 'pending_validation',
    candidateId: 'cand-3',
    isRead: false,
    createdAt: '2026-07-14T11:00:00Z'
  },
  {
    id: 'not-2',
    recipientRole: 'admin',
    title: 'Módulo Simulador anexado',
    message: 'A escola Escola Recomendada Beta anexou o certificado de Simulador para Mariana Costa.',
    type: 'pending_validation',
    candidateId: 'cand-2',
    isRead: false,
    createdAt: '2026-07-14T14:20:00Z'
  }
];

// Mappers para converter entre CamelCase e SnakeCase
const mapUserToTS = (row: any): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role as UserRole,
  schoolId: row.school_id || undefined
});

const mapUserToDb = (u: User) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  school_id: u.schoolId || null
});

const mapSchoolToTS = (row: any): School => ({
  id: row.id,
  name: row.name,
  cnpj: row.cnpj || undefined,
  active: row.active,
  contactName: row.contact_name,
  email: row.email,
  phone: row.phone
});

const mapSchoolToDb = (s: School) => ({
  id: s.id,
  name: s.name,
  cnpj: s.cnpj || null,
  active: s.active,
  contact_name: s.contactName,
  email: s.email,
  phone: s.phone
});

const mapCandidateToTS = (row: any): Candidate => ({
  id: row.id,
  re: row.re,
  name: row.name,
  anac: row.anac,
  schoolId: row.school_id,
  status: row.status as CandidateStatus,
  selectionStatus: row.selection_status as SelectionStatus,
  gupyStatus: row.gupy_status as GupyStatus || undefined,
  validatedBy: row.validated_by || undefined,
  validatedAt: row.validated_at || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapCandidateToDb = (c: Candidate) => ({
  id: c.id,
  re: c.re,
  name: c.name,
  anac: c.anac,
  school_id: c.schoolId,
  status: c.status,
  selection_status: c.selectionStatus,
  gupy_status: c.gupyStatus || null,
  validated_by: c.validatedBy || null,
  validated_at: c.validatedAt || null,
  created_at: c.createdAt,
  updated_at: c.updatedAt
});

const mapModuleToTS = (row: any): CandidateModuleProgress => ({
  id: row.id,
  candidateId: row.candidate_id,
  moduleCode: row.module_code as ModuleCode,
  status: row.status as ModuleStatus,
  completionDate: row.completion_date || undefined,
  schoolId: row.school_id || undefined,
  certificateUrl: row.certificate_url || undefined,
  classSheets: row.class_sheets || undefined,
  uploadedAt: row.uploaded_at || undefined,
  updatedBy: row.updated_by || undefined,
  updatedAt: row.updated_at
});

const mapModuleToDb = (m: CandidateModuleProgress) => ({
  id: m.id,
  candidate_id: m.candidateId,
  module_code: m.moduleCode,
  status: m.status,
  completion_date: m.completionDate || null,
  school_id: m.schoolId || null,
  certificate_url: m.certificateUrl || null,
  class_sheets: m.classSheets || null,
  uploaded_at: m.uploadedAt || null,
  updated_by: m.updatedBy || null,
  updated_at: m.updatedAt
});

const mapLogToTS = (row: any): AuditLog => ({
  id: row.id,
  createdAt: row.created_at,
  userId: row.user_id || undefined,
  userName: row.user_name || undefined,
  candidateId: row.candidate_id,
  candidateName: row.candidate_name,
  changedField: row.changed_field,
  oldValue: row.old_value,
  newValue: row.new_value
});

const mapLogToDb = (l: AuditLog) => ({
  id: l.id,
  created_at: l.createdAt,
  user_id: l.userId || null,
  user_name: l.userName || null,
  candidate_id: l.candidateId,
  candidate_name: l.candidateName,
  changed_field: l.changedField,
  old_value: l.oldValue,
  new_value: l.newValue
});

const mapNotificationToTS = (row: any): Notification => ({
  id: row.id,
  recipientUserId: row.recipient_user_id || undefined,
  recipientSchoolId: row.recipient_school_id || undefined,
  recipientRole: row.recipient_role || undefined,
  title: row.title,
  message: row.message,
  type: row.type as any,
  candidateId: row.candidate_id || undefined,
  isRead: row.is_read,
  createdAt: row.created_at,
  readAt: row.read_at || undefined
});

const mapNotificationToDb = (n: Notification) => ({
  id: n.id,
  recipient_user_id: n.recipientUserId || null,
  recipient_school_id: n.recipientSchoolId || null,
  recipient_role: n.recipientRole || null,
  title: n.title,
  message: n.message,
  type: n.type,
  candidate_id: n.candidateId || null,
  is_read: n.isRead,
  created_at: n.createdAt,
  read_at: n.readAt || null
});

// Camada de Banco de Dados Assíncrona com Supabase
export const mockDb = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Erro ao ler usuários:', error);
      throw error;
    }
    return data.map(mapUserToTS);
  },
  setUsers: async (data: User[]): Promise<void> => {
    const { error } = await supabase.from('users').upsert(data.map(mapUserToDb));
    if (error) {
      console.error('Erro ao salvar usuários:', error);
      throw error;
    }
  },
  getSchools: async (): Promise<School[]> => {
    const { data, error } = await supabase.from('schools').select('*');
    if (error) {
      console.error('Erro ao ler escolas:', error);
      throw error;
    }
    return data.map(mapSchoolToTS);
  },
  setSchools: async (data: School[]): Promise<void> => {
    const { error } = await supabase.from('schools').upsert(data.map(mapSchoolToDb));
    if (error) {
      console.error('Erro ao salvar escolas:', error);
      throw error;
    }
  },
  getCandidates: async (): Promise<Candidate[]> => {
    const { data, error } = await supabase.from('candidates').select('*');
    if (error) {
      console.error('Erro ao ler candidatos:', error);
      throw error;
    }
    return data.map(mapCandidateToTS);
  },
  setCandidates: async (data: Candidate[]): Promise<void> => {
    const { error } = await supabase.from('candidates').upsert(data.map(mapCandidateToDb));
    if (error) {
      console.error('Erro ao salvar candidatos:', error);
      throw error;
    }
  },
  getModuleProgress: async (): Promise<CandidateModuleProgress[]> => {
    const { data, error } = await supabase.from('candidate_module_progress').select('*');
    if (error) {
      console.error('Erro ao ler progresso de módulos:', error);
      throw error;
    }
    return data.map(mapModuleToTS);
  },
  setModuleProgress: async (data: CandidateModuleProgress[]): Promise<void> => {
    const { error } = await supabase.from('candidate_module_progress').upsert(data.map(mapModuleToDb));
    if (error) {
      console.error('Erro ao salvar progresso de módulos:', error);
      throw error;
    }
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao ler logs de auditoria:', error);
      throw error;
    }
    return data.map(mapLogToTS);
  },
  setAuditLogs: async (data: AuditLog[]): Promise<void> => {
    const { error } = await supabase.from('audit_logs').upsert(data.map(mapLogToDb));
    if (error) {
      console.error('Erro ao salvar logs de auditoria:', error);
      throw error;
    }
  },
  getNotifications: async (): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao ler notificações:', error);
      throw error;
    }
    return data.map(mapNotificationToTS);
  },
  setNotifications: async (data: Notification[]): Promise<void> => {
    const { error } = await supabase.from('notifications').upsert(data.map(mapNotificationToDb));
    if (error) {
      console.error('Erro ao salvar notificações:', error);
      throw error;
    }
  },
  resetDatabase: async (): Promise<void> => {
    try {
      // Deletar na ordem correta das chaves estrangeiras
      await supabase.from('notifications').delete().neq('id', '');
      await supabase.from('audit_logs').delete().neq('id', '');
      await supabase.from('candidate_module_progress').delete().neq('id', '');
      await supabase.from('candidates').delete().neq('id', '');
      await supabase.from('users').delete().neq('id', '');
      await supabase.from('schools').delete().neq('id', '');

      // Seed de dados iniciais
      const { error: errorSchools } = await supabase.from('schools').insert(INITIAL_SCHOOLS.map(mapSchoolToDb));
      if (errorSchools) throw errorSchools;

      const { error: errorUsers } = await supabase.from('users').insert(INITIAL_USERS.map(mapUserToDb));
      if (errorUsers) throw errorUsers;

      const { error: errorCandidates } = await supabase.from('candidates').insert(INITIAL_CANDIDATES.map(mapCandidateToDb));
      if (errorCandidates) throw errorCandidates;

      const { error: errorModules } = await supabase.from('candidate_module_progress').insert(INITIAL_MODULE_PROGRESS.map(mapModuleToDb));
      if (errorModules) throw errorModules;

      const { error: errorLogs } = await supabase.from('audit_logs').insert(INITIAL_LOGS.map(mapLogToDb));
      if (errorLogs) throw errorLogs;

      const { error: errorNotifications } = await supabase.from('notifications').insert(INITIAL_NOTIFICATIONS.map(mapNotificationToDb));
      if (errorNotifications) throw errorNotifications;

      console.log('Banco de dados Supabase resetado e semeado com sucesso!');
      window.location.reload();
    } catch (err) {
      console.error('Erro ao resetar o banco de dados:', err);
      alert('Erro ao resetar o banco de dados. Verifique o console.');
    }
  }
};
