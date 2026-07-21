import { db } from './firebaseClient';
import {
  collection,
  getDocs,
  doc,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';

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

// Dados mockados iniciais para Seeding
export const INITIAL_USERS: User[] = [
  { id: 'usr-admin', email: 'admin@empresa.com', username: 'admin', name: 'Admin Geral (Minha Empresa)', role: 'admin', password: 'crpazul1234*' }
];

export const INITIAL_SCHOOLS: School[] = [];


// Mappers para converter entre CamelCase e SnakeCase
const mapUserToTS = (row: any): User => ({
  id: row.id,
  email: row.email,
  username: row.username || undefined,
  name: row.name,
  role: row.role as UserRole,
  password: row.password || undefined,
  phone: row.phone || undefined,
  schoolId: row.school_id || undefined
});

const mapUserToDb = (u: User) => ({
  id: u.id,
  email: u.email,
  username: u.username || null,
  name: u.name,
  role: u.role,
  password: (u as any).password || null,
  phone: (u as any).phone || null,
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

// Camada de Banco de Dados Assíncrona com Cloud Firestore
export const mockDb = {
  getUsers: async (): Promise<User[]> => {
    let list: User[] = [];
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        list = snap.docs.map((d) => mapUserToTS({ id: d.id, ...d.data() }));
      } else {
        await mockDb.setUsers(INITIAL_USERS);
        list = [...INITIAL_USERS];
      }
    } catch (err) {
      console.error('Erro ao ler usuários no Firestore:', err);
      list = [...INITIAL_USERS];
    }

    try {
      const stored = localStorage.getItem('escola_registered_users');
      if (stored) {
        const parsed: User[] = JSON.parse(stored);
        parsed.forEach(lu => {
          const idx = list.findIndex(u => u.id === lu.id || u.email === lu.email);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...lu };
          } else {
            list.push(lu);
          }
        });
      }
    } catch (e) {}

    return list;
  },
  setUsers: async (data: User[]): Promise<void> => {
    try {
      localStorage.setItem('escola_registered_users', JSON.stringify(data));
    } catch (e) {}

    try {
      const batch = writeBatch(db);
      data.forEach((u) => {
        batch.set(doc(db, 'users', u.id), mapUserToDb(u), { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Erro ao salvar usuários no Firestore:', err);
    }
  },
  getSchools: async (): Promise<School[]> => {
    let list: School[] = [];
    try {
      const snap = await getDocs(collection(db, 'schools'));
      if (!snap.empty) {
        list = snap.docs.map((d) => mapSchoolToTS({ id: d.id, ...d.data() }));
      } else {
        await mockDb.setSchools(INITIAL_SCHOOLS);
        list = [...INITIAL_SCHOOLS];
      }
    } catch (err) {
      console.error('Erro ao ler escolas no Firestore:', err);
      list = [...INITIAL_SCHOOLS];
    }

    try {
      const stored = localStorage.getItem('escola_registered_schools');
      if (stored) {
        const parsed: School[] = JSON.parse(stored);
        parsed.forEach(ls => {
          if (!list.some(s => s.id === ls.id)) {
            list.push(ls);
          }
        });
      }
    } catch (e) {}

    return list;
  },
  setSchools: async (data: School[]): Promise<void> => {
    try {
      localStorage.setItem('escola_registered_schools', JSON.stringify(data));
    } catch (e) {}

    try {
      const batch = writeBatch(db);
      data.forEach((s) => {
        batch.set(doc(db, 'schools', s.id), mapSchoolToDb(s), { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Erro ao salvar escolas no Firestore:', err);
    }
  },
  getCandidates: async (): Promise<Candidate[]> => {
    try {
      const snap = await getDocs(collection(db, 'candidates'));
      return snap.docs.map((d) => mapCandidateToTS({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Erro ao ler candidatos no Firestore:', err);
      return [];
    }
  },
  setCandidates: async (data: Candidate[]): Promise<void> => {
    const batch = writeBatch(db);
    data.forEach((c) => {
      batch.set(doc(db, 'candidates', c.id), mapCandidateToDb(c), { merge: true });
    });
    await batch.commit();
  },
  getModuleProgress: async (): Promise<CandidateModuleProgress[]> => {
    try {
      const snap = await getDocs(collection(db, 'candidate_module_progress'));
      return snap.docs.map((d) => mapModuleToTS({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Erro ao ler progresso de módulos no Firestore:', err);
      return [];
    }
  },
  setModuleProgress: async (data: CandidateModuleProgress[]): Promise<void> => {
    const batch = writeBatch(db);
    data.forEach((m) => {
      batch.set(doc(db, 'candidate_module_progress', m.id), mapModuleToDb(m), { merge: true });
    });
    await batch.commit();
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    try {
      const q = query(collection(db, 'audit_logs'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => mapLogToTS({ id: d.id, ...d.data() }));
    } catch (err) {
      // Fallback se o índice de ordenação ainda não tiver sido criado no Firestore
      const snap = await getDocs(collection(db, 'audit_logs'));
      return snap.docs
        .map((d) => mapLogToTS({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },
  setAuditLogs: async (data: AuditLog[]): Promise<void> => {
    const batch = writeBatch(db);
    data.forEach((l) => {
      batch.set(doc(db, 'audit_logs', l.id), mapLogToDb(l), { merge: true });
    });
    await batch.commit();
  },
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const q = query(collection(db, 'notifications'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => mapNotificationToTS({ id: d.id, ...d.data() }));
    } catch (err) {
      const snap = await getDocs(collection(db, 'notifications'));
      return snap.docs
        .map((d) => mapNotificationToTS({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },
  setNotifications: async (data: Notification[]): Promise<void> => {
    const batch = writeBatch(db);
    data.forEach((n) => {
      batch.set(doc(db, 'notifications', n.id), mapNotificationToDb(n), { merge: true });
    });
    await batch.commit();
  },
  resetDatabase: async (): Promise<void> => {
    // 1. Limpar localStorage (sempre funciona, independe do Firestore)
    const keysToRemove = [
      'escola_user_session',
      'escola_registered_users',
      'escola_registered_schools',
      'escola_candidates',
      'escola_module_progress',
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 2. Tentar limpar o Firestore (best-effort, falha silenciosamente)
    try {
      const collectionsToClear = [
        'notifications',
        'audit_logs',
        'candidate_module_progress',
        'candidates',
        'users',
        'schools'
      ];

      for (const colName of collectionsToClear) {
        const snap = await getDocs(collection(db, colName));
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }

      // Seed inicial no Firestore
      if (INITIAL_USERS.length > 0 || INITIAL_SCHOOLS.length > 0) {
        const seedBatch = writeBatch(db);
        INITIAL_SCHOOLS.forEach((s) => seedBatch.set(doc(db, 'schools', s.id), mapSchoolToDb(s)));
        INITIAL_USERS.forEach((u) => seedBatch.set(doc(db, 'users', u.id), mapUserToDb(u)));
        await seedBatch.commit();
      }
    } catch (err) {
      // Firestore não disponível — não é erro crítico, localStorage já foi limpo
      console.warn('Firestore não disponível durante reset. Apenas localStorage foi limpo:', err);
    }

    console.log('Sistema resetado com sucesso!');
    window.location.reload();
  }
};
