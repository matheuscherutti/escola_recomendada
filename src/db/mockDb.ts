// Banco de dados simulado usando LocalStorage

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

// Dados mockados iniciais
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
  // Módulos do Roberto (Concluído)
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
  // Módulos da Mariana (Em andamento: Teórico Concluído, Simulador aguardando Admin, Voo Pendente)
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

// Helper para ler/gravar do LocalStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data) as T;
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const mockDb = {
  getUsers: (): User[] => {
    const list = getStorageItem<User[]>('db_users', INITIAL_USERS);
    let changed = false;
    const migrated = list.map((u) => {
      if (!u.password || u.password === 'Azul1234*') {
        u.password = 'crpazul1234*';
        changed = true;
      }
      return u;
    });
    if (changed) {
      setStorageItem('db_users', migrated);
    }
    return migrated;
  },
  setUsers: (data: User[]): void => setStorageItem('db_users', data),
  updateUserPassword: (userId: string, newPass: string): void => {
    const list = mockDb.getUsers();
    const updated = list.map((u) => u.id === userId ? { ...u, password: newPass } : u);
    mockDb.setUsers(updated);
  },
  getSchools: (): School[] => getStorageItem('db_schools', INITIAL_SCHOOLS),
  setSchools: (data: School[]): void => setStorageItem('db_schools', data),
  getCandidates: (): Candidate[] => {
    const list = getStorageItem<any[]>('db_candidates', INITIAL_CANDIDATES);
    let changed = false;
    const migrated = list.map((c) => {
      if (c.selectionStatus === 'not_called' || !c.selectionStatus) {
        c.selectionStatus = 'finalized';
        changed = true;
      }
      return c;
    });
    if (changed) {
      setStorageItem('db_candidates', migrated);
    }
    return migrated as Candidate[];
  },
  setCandidates: (data: Candidate[]): void => setStorageItem('db_candidates', data),
  getModuleProgress: (): CandidateModuleProgress[] => getStorageItem('db_modules', INITIAL_MODULE_PROGRESS),
  setModuleProgress: (data: CandidateModuleProgress[]): void => setStorageItem('db_modules', data),
  getAuditLogs: (): AuditLog[] => getStorageItem('db_logs', INITIAL_LOGS),
  setAuditLogs: (data: AuditLog[]): void => setStorageItem('db_logs', data),
  getNotifications: (): Notification[] => getStorageItem('db_notifications', INITIAL_NOTIFICATIONS),
  setNotifications: (data: Notification[]): void => setStorageItem('db_notifications', data),
  
  resetDatabase: (): void => {
    localStorage.removeItem('db_users');
    localStorage.removeItem('db_schools');
    localStorage.removeItem('db_candidates');
    localStorage.removeItem('db_modules');
    localStorage.removeItem('db_logs');
    localStorage.removeItem('db_notifications');
    window.location.reload();
  }
};
