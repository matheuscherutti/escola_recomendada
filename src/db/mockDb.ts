import { supabase } from './supabaseClient';

export type UserRole = 'admin' | 'school_admin';
export type CandidateStatus = 'pending_validation' | 'rejected' | 'in_progress' | 'completed';
export type SelectionStatus = 'finalized' | 'in_selection' | 'hired' | 'rejected';
export type GupyStatus = 'gupy_min' | 'gupy_no_min' | 'not_gupy' | 'gupy_pending';
export type ModuleCode = 'TEORICO' | 'SIMULADOR' | 'VOO';
export type ModuleStatus = 'pending' | 'waiting_admin' | 'completed';

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: UserRole;
  password?: string;
  phone?: string;
  schoolId?: string;
  primeiroAcesso?: boolean;
  ultimoLogin?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface School {
  id: string;
  name: string;
  cnpj?: string;
  active: boolean;
  contactName: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
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
  rejectedAt?: string;
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
  rejectionReason?: string;
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

// Mappers para converter entre CamelCase (TS) e SnakeCase (DB)
const mapUserToTS = (row: any): User => ({
  id: row.id,
  email: row.email,
  username: row.username || undefined,
  name: row.name,
  role: row.role as UserRole,
  password: row.password || undefined,
  phone: row.phone || undefined,
  schoolId: row.school_id || undefined,
  primeiroAcesso: row.primeiro_acesso !== undefined ? Boolean(row.primeiro_acesso) : undefined,
  ultimoLogin: row.ultimo_login || undefined,
  active: row.active !== undefined ? Boolean(row.active) : undefined,
  createdAt: row.created_at || undefined,
  updatedAt: row.updated_at || undefined
});

const mapUserToDb = (u: User) => ({
  id: u.id,
  email: u.email,
  username: u.username || null,
  name: u.name,
  role: u.role,
  password: (u as any).password || null,
  phone: (u as any).phone || null,
  school_id: u.schoolId || null,
  primeiro_acesso: u.primeiroAcesso !== undefined ? u.primeiroAcesso : null,
  ultimo_login: u.ultimoLogin || null,
  active: u.active !== undefined ? u.active : true,
  created_at: u.createdAt || null,
  updated_at: u.updatedAt || null
});

const mapSchoolToTS = (row: any): School => ({
  id: row.id,
  name: row.name,
  cnpj: row.cnpj || undefined,
  active: row.active !== undefined ? Boolean(row.active) : true,
  contactName: row.contact_name || row.contactName || '',
  email: row.email,
  phone: row.phone,
  createdAt: row.created_at || undefined,
  updatedAt: row.updated_at || undefined
});

const mapSchoolToDb = (s: School) => ({
  id: s.id,
  name: s.name,
  cnpj: s.cnpj || null,
  active: s.active,
  contact_name: s.contactName,
  email: s.email,
  phone: s.phone,
  created_at: s.createdAt || null,
  updated_at: s.updatedAt || null
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
  rejectedAt: row.rejected_at || undefined,
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
  rejected_at: c.rejectedAt || null,
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
  rejectionReason: row.rejection_reason || undefined,
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
  rejection_reason: m.rejectionReason || null,
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
      console.error('Erro ao ler usuários no Supabase:', error);
      throw error;
    }
    return data.map(mapUserToTS);
  },
  setUsers: async (data: User[]): Promise<void> => {
    const { error } = await supabase.from('users').upsert(data.map(mapUserToDb));
    if (error) {
      console.error('Erro ao salvar usuários no Supabase:', error);
      throw error;
    }
  },
  getSchools: async (): Promise<School[]> => {
    const { data, error } = await supabase.from('schools').select('*');
    if (error) {
      console.error('Erro ao ler escolas no Supabase:', error);
      throw error;
    }
    return data.map(mapSchoolToTS);
  },
  setSchools: async (data: School[]): Promise<void> => {
    const { error } = await supabase.from('schools').upsert(data.map(mapSchoolToDb));
    if (error) {
      console.error('Erro ao salvar escolas no Supabase:', error);
      throw error;
    }
  },
  getCandidates: async (): Promise<Candidate[]> => {
    const { data, error } = await supabase.from('candidates').select('*');
    if (error) {
      console.error('Erro ao ler candidatos no Supabase:', error);
      throw error;
    }
    return data.map(mapCandidateToTS);
  },
  setCandidates: async (data: Candidate[]): Promise<void> => {
    const { error } = await supabase.from('candidates').upsert(data.map(mapCandidateToDb));
    if (error) {
      console.error('Erro ao salvar candidatos no Supabase:', error);
      throw error;
    }
  },
  getModuleProgress: async (): Promise<CandidateModuleProgress[]> => {
    const { data, error } = await supabase.from('candidate_module_progress').select('*');
    if (error) {
      console.error('Erro ao ler progresso de módulos no Supabase:', error);
      throw error;
    }
    return data.map(mapModuleToTS);
  },
  setModuleProgress: async (data: CandidateModuleProgress[]): Promise<void> => {
    const { error } = await supabase.from('candidate_module_progress').upsert(data.map(mapModuleToDb));
    if (error) {
      console.error('Erro ao salvar progresso de módulos no Supabase:', error);
      throw error;
    }
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao ler logs de auditoria no Supabase:', error);
      throw error;
    }
    return data.map(mapLogToTS);
  },
  setAuditLogs: async (data: AuditLog[]): Promise<void> => {
    const { error } = await supabase.from('audit_logs').upsert(data.map(mapLogToDb));
    if (error) {
      console.error('Erro ao salvar logs de auditoria no Supabase:', error);
      throw error;
    }
  },
  getNotifications: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao ler notificações no Supabase:', error);
      throw error;
    }
    return data.map(mapNotificationToTS);
  },
  setNotifications: async (data: Notification[]): Promise<void> => {
    const { error } = await supabase.from('notifications').upsert(data.map(mapNotificationToDb));
    if (error) {
      console.error('Erro ao salvar notificações no Supabase:', error);
      throw error;
    }
  },
  resetDatabase: async (): Promise<void> => {
    console.warn('Função de reset do banco desativada por segurança.');
  }
};
