import React, { useState, useEffect, useRef } from 'react';
import { mockDb } from './db/mockDb';
import type {
  User,
  UserRole,
  School,
  Candidate,
  CandidateModuleProgress,
  Notification,
  ModuleCode,
  ModuleStatus,
  SelectionStatus,
  GupyStatus,
} from './db/mockDb';
import {
  stateMachine,
} from './db/stateMachine';
import { auth, db, storage } from './db/firebaseClient';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  FileText,
  RotateCcw,
  Search,
  Check,
  Building,
  TrendingUp,
  Award,
  ShieldCheck,
  GraduationCap,
  Trophy,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  BookOpen,
  Plane,
  Monitor,
  Users,
  Settings,
  LogOut,
  Key,
  Edit2,
  Download,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type WorkspaceId = 'validation' | 'training' | 'selection' | 'config' | 'dashboard';
type ValidationFilter = 'pending' | 'approved' | 'rejected';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const moduleLabel = (code: ModuleCode) =>
  code === 'TEORICO' ? 'Teórico' : code === 'SIMULADOR' ? 'Simulador' : 'Voo';

const moduleIcon = (code: ModuleCode) => {
  if (code === 'TEORICO') return <BookOpen className="w-4 h-4" />;
  if (code === 'SIMULADOR') return <Monitor className="w-4 h-4" />;
  return <Plane className="w-4 h-4" />;
};

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_validation: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    rejected:           'bg-red-500/15 text-red-400 border border-red-500/25',
    in_progress:        'bg-sky-500/15 text-sky-400 border border-sky-500/25',
    completed:          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    not_called:         'bg-brand-medium/60 text-slate-400 border border-brand-medium/40',
    completed_not_registered: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    called_for_process: 'bg-sky-500/15 text-sky-400 border border-sky-500/25',
  };
  const labelMap: Record<string, string> = {
    pending_validation: 'Pendente',
    rejected: 'Recusado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    not_called: 'Não Chamado',
    completed_not_registered: 'Não Cadastrado',
    called_for_process: 'Chamado P.S.',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${map[status] ?? 'bg-brand-medium text-slate-300'}`}>
      {labelMap[status] ?? status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ToastStack({ toasts, onDismiss }: { toasts: Notification[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-brand-dark border-l-4 border-brand-accent rounded-xl p-4 shadow-2xl shadow-black/60 flex items-start gap-3 animate-slide-in"
        >
          <Bell className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{t.title}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{t.message}</p>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-500 hover:text-slate-300 transition shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
function NotificationDropdown({
  notifications,
  onMarkAllRead,
  onClose,
}: {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const unread = notifications.filter((n) => !n.isRead).length;

  const notifIcon = (type: Notification['type']) => {
    if (type === 'pending_validation') return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    if (type === 'validation_result')  return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (type === 'course_completed')   return <Award className="w-4 h-4 text-brand-gold" />;
    return <TrendingUp className="w-4 h-4 text-sky-400" />;
  };

  return (
    <div ref={ref} className="absolute left-0 bottom-full mb-2 w-80 bg-brand-dark border border-brand-medium/40 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-brand-medium/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-sm text-slate-200">Alertas Recentes</h3>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={onMarkAllRead} className="text-xs text-sky-400 hover:text-sky-300 font-medium transition">
            Marcar lidas
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-slate-500">
            <Bell className="w-8 h-8 opacity-30" />
            <p className="text-xs">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`px-4 py-3 border-b border-brand-medium/20 flex gap-3 hover:bg-brand-medium/20 transition cursor-pointer ${!n.isRead ? 'bg-sky-950/20' : ''}`}>
              <div className="mt-0.5 shrink-0">{notifIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-300 leading-tight">{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                <span className="text-[9px] text-slate-600 mt-1 block">{fmtTime(n.createdAt)} · {fmt(n.createdAt)}</span>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1.5" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
interface SidebarProps {
  active: WorkspaceId;
  onNavigate: (ws: WorkspaceId) => void;
  currentUser: User;
  notifications: Notification[];
  onMarkAllRead: () => void;
  pendingCount: number;
  completedCount: number;
  onLogout: () => void;
}

function NavigationSidebar({
  active, onNavigate, currentUser,
  notifications, onMarkAllRead, pendingCount, completedCount, onLogout,
}: SidebarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter((n) => !n.isRead).length;

  const navItems: { id: WorkspaceId; label: string; icon: React.ReactNode; badge?: number }[] = [
    ...(currentUser.role === 'admin' ? [
      { id: 'dashboard' as WorkspaceId, label: 'Dashboard', icon: <TrendingUp className="w-5 h-5" /> }
    ] : []),
    { id: 'validation', label: 'Validação', icon: <ShieldCheck className="w-5 h-5" />, badge: pendingCount },
    { id: 'training',   label: 'Treinamento', icon: <GraduationCap className="w-5 h-5" /> },
    ...(currentUser.role === 'admin' ? [
      { id: 'selection' as WorkspaceId, label: 'Processo Seletivo', icon: <Trophy className="w-5 h-5" />, badge: completedCount },
      { id: 'config' as WorkspaceId, label: 'Escolas Parceiras', icon: <Building className="w-5 h-5" /> }
    ] : [
      { id: 'config' as WorkspaceId, label: 'Configurações', icon: <Settings className="w-5 h-5" /> }
    ]),
  ];

  return (
    <aside className="w-64 min-h-screen bg-brand-dark border-r border-brand-medium/40 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-brand-medium/40 flex flex-col items-center justify-center bg-brand-darkest/40 gap-3">
        <img
          src="/azul_logo_2.png"
          alt="Azul Linhas Aéreas"
          className="h-14 w-auto object-contain"
        />
        <div className="text-center">
          <h1 className="text-xs font-black text-slate-100 tracking-widest uppercase leading-none">Escola Recomendada</h1>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gestão de Treinamento</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Workspaces</p>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-brand-accent/15 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:bg-brand-medium/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  item.id === 'validation' ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-accent/20 text-sky-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer — User + Notifs */}
      <div className="px-3 py-4 border-t border-brand-medium/40 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-accent/20 text-sky-400'
          }`}>
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{currentUser.name.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-500">
              {currentUser.role === 'admin' ? '🏢 Admin Empresa' : '🏫 Escola'}
            </p>
          </div>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-brand-medium/80 hover:bg-brand-medium border border-brand-medium/40 transition text-slate-400 hover:text-slate-200"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="text-xs font-medium">Notificações</span>
            </div>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {unread}
              </span>
            )}
          </button>
          {showNotifs && (
            <NotificationDropdown
              notifications={notifications}
              onMarkAllRead={() => { onMarkAllRead(); setShowNotifs(false); }}
              onClose={() => setShowNotifs(false)}
            />
          )}
        </div>

        {/* Logout Button */}
        <div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 border border-red-500/20 hover:border-transparent transition font-bold text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 1 — VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
interface ValidationWorkspaceProps {
  candidates: Candidate[];
  currentUser: User;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  schools: School[];
}

function ValidationWorkspace({ candidates, currentUser, onApprove, onReject, schools }: ValidationWorkspaceProps) {
  const [filter, setFilter] = useState<ValidationFilter>('pending');
  const [search, setSearch] = useState('');
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);

  const filtered = candidates.filter((c) => {
    const matchesRole = currentUser.role === 'admin' || c.schoolId === currentUser.schoolId;
    const matchesFilter =
      filter === 'pending'   ? c.status === 'pending_validation' :
      filter === 'approved'  ? (c.status === 'in_progress' || c.status === 'completed') :
      c.status === 'rejected';
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.re.toLowerCase().includes(search.toLowerCase()) ||
      c.anac.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesFilter && matchesSearch;
  });

  const counts = {
    pending:  candidates.filter((c) => c.status === 'pending_validation').length,
    approved: candidates.filter((c) => c.status === 'in_progress' || c.status === 'completed').length,
    rejected: candidates.filter((c) => c.status === 'rejected').length,
  };

  const tabs: { id: ValidationFilter; label: string; color: string }[] = [
    { id: 'pending',  label: `Pendentes (${counts.pending})`,  color: 'amber' },
    { id: 'approved', label: `Aprovados (${counts.approved})`, color: 'emerald' },
    { id: 'rejected', label: `Recusados (${counts.rejected})`, color: 'red' },
  ];

  const tabClass = (t: typeof tabs[0]) => {
    const active = filter === t.id;
    const colors: Record<string, string> = {
      amber:   active ? 'border-amber-500 text-amber-400 bg-amber-500/5'   : 'border-transparent text-slate-500 hover:text-slate-300',
      emerald: active ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-500 hover:text-slate-300',
      red:     active ? 'border-red-500 text-red-400 bg-red-500/5'         : 'border-transparent text-slate-500 hover:text-slate-300',
    };
    return `px-5 py-3 text-sm font-semibold border-b-2 transition-all ${colors[t.color]}`;
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          Validação de Funcionários
        </h2>
        <p className="text-sm text-slate-500 mt-1">Triagem e admissão de novos candidatos submetidos pelas Escolas Parceiras</p>
      </div>

      {/* Card principal */}
      <div className="bg-brand-dark rounded-2xl border border-brand-medium/40 shadow-xl overflow-hidden">
        {/* Tabs + Search */}
        <div className="flex items-center justify-between border-b border-brand-medium/30">
          <div className="flex">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setFilter(t.id)} className={tabClass(t)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="px-4 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-7 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nome, RE ou ANAC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-brand-medium/60 border border-brand-medium/40 text-slate-300 placeholder-slate-600 text-xs rounded-lg pl-8 pr-3 py-2 w-48 outline-none focus:border-brand-accent transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-medium/30 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-5">Candidato</th>
                <th className="py-3 px-5">RE</th>
                <th className="py-3 px-5">ANAC</th>
                {currentUser.role === 'admin' && <th className="py-3 px-5">Escola</th>}
                <th className="py-3 px-5">Enviado em</th>
                <th className="py-3 px-5">Status</th>
                {currentUser.role === 'admin' && filter === 'pending' && (
                  <th className="py-3 px-5 text-right">Decisão</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                      <ShieldCheck className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-medium">Nenhum candidato neste filtro</p>
                      <p className="text-xs opacity-70">
                        {filter === 'pending' ? 'Todos os candidatos foram processados ✨' : 'Ainda sem registros aqui.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const schoolName = schools.find((s) => s.id === c.schoolId)?.name ?? '—';
                  return (
                    <tr key={c.id} className="border-b border-brand-medium/20 hover:bg-brand-medium/10 transition">
                      <td className="py-3.5 px-5 font-semibold text-slate-200">{c.name}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-400">{c.re}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-400">{c.anac}</td>
                      {currentUser.role === 'admin' && (
                        <td className="py-3.5 px-5 text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-600" />
                            {schoolName}
                          </span>
                        </td>
                      )}
                      <td className="py-3.5 px-5 text-slate-500">{fmt(c.createdAt)}</td>
                      <td className="py-3.5 px-5"><StatusBadge status={c.status} /></td>
                      {currentUser.role === 'admin' && filter === 'pending' && (
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setConfirmApprove(c.id)}
                              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/25 px-3 py-1.5 rounded-lg font-bold transition-all duration-150 text-[11px]"
                            >
                              <Check className="w-3.5 h-3.5" /> Aprovar
                            </button>
                            <button
                              onClick={() => setConfirmReject(c.id)}
                              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 border border-red-500/25 px-3 py-1.5 rounded-lg font-bold transition-all duration-150 text-[11px]"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Recusar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Reject Dialog */}
      {confirmReject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-dark border border-red-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-bold text-slate-100">Confirmar Recusa</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Esta ação encerrará o processo para este candidato. Ele não poderá ser aprovado novamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReject(null)}
                className="flex-1 py-2.5 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-300 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onReject(confirmReject); setConfirmReject(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition"
              >
                Recusar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Approve Dialog */}
      {confirmApprove && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-dark border border-emerald-500/25 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-100">Confirmar Aprovação</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Deseja aprovar o cadastro deste candidato? Ele será movido para a etapa de treinamento.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmApprove(null)}
                className="flex-1 py-2.5 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-300 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onApprove(confirmApprove); setConfirmApprove(null); }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold transition"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE BLOCK COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface ModuleBlockProps {
  code: ModuleCode;
  prog?: CandidateModuleProgress;
  isSchoolOwner: boolean;
  isAdmin: boolean;
  onAttach: (code: ModuleCode) => void;
  onOpenValidation: (prog: CandidateModuleProgress) => void;
}

function ModuleBlock({ code, prog, isSchoolOwner, isAdmin, onAttach, onOpenValidation }: ModuleBlockProps) {
  const status = prog?.status ?? 'not_started';

  const containerClass = () => {
    if (status === 'completed') return 'bg-emerald-500/8 border-emerald-500/25 text-emerald-400';
    if (status === 'waiting_admin') return 'bg-amber-500/8 border-amber-500/25 text-amber-400';
    return 'bg-brand-medium/30 border-brand-medium/30 text-slate-500';
  };

  const iconEl = () => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === 'waiting_admin') return <Clock className="w-4 h-4 text-amber-400 animate-pulse" />;
    return <div className="w-4 h-4 rounded-full border-2 border-brand-medium/80" />;
  };

  const handleClick = () => {
    if (status === 'completed' && isAdmin && prog) onOpenValidation(prog);
    if (status === 'waiting_admin' && isAdmin && prog) onOpenValidation(prog);
    if (status === 'not_started' || status === 'pending') {
      if (isSchoolOwner || isAdmin) onAttach(code);
    }
  };

  const isClickable = (status === 'completed' && isAdmin) || (status === 'waiting_admin' && isAdmin) || ((status === 'pending' || status === 'not_started') && (isSchoolOwner || isAdmin));

  const fmtDate = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR');
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 min-w-[90px] ${containerClass()} ${
        isClickable ? 'hover:brightness-110 cursor-pointer hover:scale-[1.02]' : 'cursor-default'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {moduleIcon(code)}
        <span className="text-xs font-bold">{moduleLabel(code)}</span>
      </div>
      {iconEl()}
      <span className="text-[10px] font-medium leading-tight text-center">
        {status === 'completed' ? `${fmtDate(prog?.completionDate)}` :
         status === 'waiting_admin' ? (isAdmin ? 'Clique p/ validar' : 'Aguard. Admin') :
         (isSchoolOwner || isAdmin) ? 'Anexar cert.' : 'Pendente'}
      </span>
      {prog?.rejectionReason && status === 'pending' && (
        <span className="text-[9px] font-bold text-rose-400 block mt-1 text-center truncate max-w-[85px]" title={`Recusado: ${prog.rejectionReason}`}>
          Motivo: {prog.rejectionReason}
        </span>
      )}
    </button>
  );
}

interface CertificateDrawerProps {
  prog: CandidateModuleProgress;
  candidateName: string;
  onValidate: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
  schools: School[];
}

function CertificateDrawer({ prog, candidateName, onValidate, onReject, onClose, schools }: CertificateDrawerProps) {
  const schoolName = schools.find((s) => s.id === prog.schoolId)?.name ?? '—';
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      // Fallback
      window.open(url, '_blank');
    }
  };

  const fmt = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-dark border-l border-brand-medium/40 z-50 flex flex-col shadow-2xl animate-drawer-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-medium/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/25">
                AGUARDANDO VALIDAÇÃO
              </span>
            </div>
            <h3 className="font-bold text-slate-100">{candidateName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Módulo: {moduleLabel(prog.moduleCode)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Details */}
          <div className="bg-brand-medium/20 rounded-2xl border border-brand-medium/30 p-4 flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Escola Emissora</span>
              <span className="text-xs font-semibold text-slate-300">{schoolName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Data de Conclusão</span>
              <span className="text-xs font-semibold text-slate-300">
                {prog.completionDate ? new Date(prog.completionDate).toLocaleDateString('pt-BR') : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Anexado em</span>
              <span className="text-xs font-semibold text-slate-300">{fmt(prog.uploadedAt)}</span>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wide flex-shrink-0">Certificado</span>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <a
                  href={prog.certificateUrl ? (prog.certificateUrl.startsWith('http') ? prog.certificateUrl : `/${prog.certificateUrl}`) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!prog.certificateUrl) {
                      e.preventDefault();
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-sky-400 font-semibold hover:text-sky-300 hover:underline transition cursor-pointer truncate max-w-[140px]"
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  Abrir
                </a>
                {prog.certificateUrl && (
                  <button
                    onClick={() => {
                      const url = prog.certificateUrl!.startsWith('http') ? prog.certificateUrl! : `/${prog.certificateUrl!}`;
                      downloadFile(url, `certificado_${candidateName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
                    }}
                    className="p-1 rounded bg-brand-medium hover:bg-brand-medium/80 text-sky-400 hover:text-sky-300 transition"
                    title="Baixar Certificado"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {prog.classSheets && prog.classSheets.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-brand-medium/20">
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wide font-bold">Fichas de Aula</span>
                <div className="flex flex-col gap-1.5 pl-2">
                  {prog.classSheets.map((sheet, index) => (
                    <div key={index} className="flex justify-between items-center gap-4">
                      <span className="text-[11px] text-slate-400">Ficha {index + 1}:</span>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <a
                          href={sheet ? (sheet.startsWith('http') ? sheet : `/${sheet}`) : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold hover:text-sky-300 hover:underline transition cursor-pointer truncate max-w-[140px]"
                        >
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          Abrir
                        </a>
                        {sheet && (
                          <button
                            onClick={() => {
                              const url = sheet.startsWith('http') ? sheet : `/${sheet}`;
                              downloadFile(url, `ficha_aula_${index + 1}_${candidateName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
                            }}
                            className="p-1 rounded bg-brand-medium hover:bg-brand-medium/80 text-sky-400 hover:text-sky-300 transition"
                            title="Baixar Ficha"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PDF Viewer Simulation */}
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-2">Visualização do Certificado</p>
            {prog.certificateUrl && (prog.certificateUrl.startsWith('http') || prog.certificateUrl.startsWith('blob:')) ? (
              <div className="rounded-xl border border-brand-medium/30 h-64 overflow-hidden bg-slate-950 relative group flex items-center justify-center">
                {prog.certificateUrl.toLowerCase().includes('.pdf') ? (
                  <iframe 
                    src={prog.certificateUrl} 
                    className="w-full h-full bg-white" 
                    title="Visualização do Certificado"
                  />
                ) : (
                  <img 
                    src={prog.certificateUrl} 
                    alt="Certificado" 
                    className="w-full h-full object-contain"
                  />
                )}
                {/* Hover screen actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-200 pointer-events-none">
                  <a
                    href={prog.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Abrir original
                  </a>
                  <button
                    onClick={() => {
                      const url = prog.certificateUrl!.startsWith('http') ? prog.certificateUrl! : `/${prog.certificateUrl!}`;
                      downloadFile(url, `certificado_${candidateName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
                    }}
                    className="pointer-events-auto px-3 py-1.5 bg-brand-medium hover:bg-brand-medium/80 text-sky-400 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-brand-medium/20 rounded-xl border border-brand-medium/30 h-64 flex flex-col items-center justify-center gap-3 text-slate-600">
                <FileText className="w-12 h-12 opacity-30 text-sky-400" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-300">{prog.certificateUrl || 'Sem arquivo anexado'}</p>
                  <p className="text-xs text-slate-500 mt-1">Visualizador PDF (simulado)</p>
                </div>
                <a
                  href={prog.certificateUrl ? `/${prog.certificateUrl}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!prog.certificateUrl) {
                      e.preventDefault();
                    }
                  }}
                  className="mt-3 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Visualizar Certificado
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 border-t border-brand-medium/30 flex flex-col gap-3">
          {!confirmingReject ? (
            <>
              <button
                onClick={onValidate}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle className="w-4 h-4" /> Validar Módulo
              </button>
              <button
                onClick={() => setConfirmingReject(true)}
                className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <XCircle className="w-4 h-4" /> Rejeitar Certificado
              </button>
            </>
          ) : (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-3">
              <div>
                <p className="text-sm text-slate-300 font-semibold mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Confirmar rejeição?
                </p>
                <p className="text-xs text-slate-500">O certificado será removido e a Escola precisará anexar novamente.</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide block mb-1">
                  Justificativa da Rejeição (Obrigatorio)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Escreva aqui por que o certificado foi rejeitado..."
                  rows={3}
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-xs rounded-xl p-2 outline-none focus:border-red-500 transition resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setConfirmingReject(false); setRejectionReason(''); }} 
                  className="flex-1 py-2 rounded-lg bg-brand-medium text-slate-300 text-xs font-semibold transition hover:bg-brand-medium/80"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      alert('A justificativa é obrigatória para rejeitar um certificado.');
                      return;
                    }
                    onReject(rejectionReason.trim());
                  }} 
                  className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-slate-950 text-xs font-bold transition shadow-lg shadow-red-500/20"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTACH MODULE MODAL (for school)
// ─────────────────────────────────────────────────────────────────────────────
interface AttachModuleModalProps {
  candidateName: string;
  moduleCode: ModuleCode;
  schools: School[];
  defaultSchoolId: string;
  onSubmit: (date: string, certName: string, classSheets: string[], schoolId: string) => void;
  onClose: () => void;
}

function AttachModuleModal({ candidateName, moduleCode, schools, defaultSchoolId, onSubmit, onClose }: AttachModuleModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [certName, setCertName] = useState(`cert_${moduleCode.toLowerCase()}.pdf`);
  const [selectedSchoolId, setSelectedSchoolId] = useState(defaultSchoolId || (schools[0]?.id || ''));
  const [classSheets, setClassSheets] = useState<string[]>(['']);

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadingSheets, setUploadingSheets] = useState<Record<number, boolean>>({});

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `certificates/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(storageRef);

      setCertName(publicUrl);
    } catch (err: any) {
      console.error('Erro ao fazer upload:', err);
      alert(`Erro no upload: ${err.message}. Mas você pode continuar informando o link manualmente.`);
    } finally {
      setUploading(false);
    }
  };

  const handleSheetFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSheets(prev => ({ ...prev, [index]: true }));

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `sheets/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(storageRef);

      updateSheetField(index, publicUrl);
    } catch (err: any) {
      console.error('Erro ao fazer upload da ficha:', err);
      alert(`Erro no upload da ficha: ${err.message}. Mas você pode continuar inserindo o link manualmente.`);
    } finally {
      setUploadingSheets(prev => ({ ...prev, [index]: false }));
    }
  };

  const addSheetField = () => setClassSheets([...classSheets, '']);
  const removeSheetField = (index: number) => setClassSheets(classSheets.filter((_, i) => i !== index));
  const updateSheetField = (index: number, val: string) => {
    const updated = [...classSheets];
    updated[index] = val;
    setClassSheets(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b border-brand-medium/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100">Anexar Conclusão</h3>
            <p className="text-xs text-slate-500 mt-0.5">{candidateName} · Módulo {moduleLabel(moduleCode)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">Escola Realizada</label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-brand-accent transition cursor-pointer"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">Data de Conclusão</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-brand-accent transition" />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
              Certificado (Upload de PDF ou Imagem)
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="cert-file-input"
              />
              <label
                htmlFor="cert-file-input"
                className="w-full flex items-center justify-center gap-2 bg-brand-medium/50 hover:bg-brand-medium hover:text-slate-200 border border-dashed border-brand-medium/60 text-slate-400 text-xs rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {uploading ? 'Enviando arquivo...' : fileName ? `Substituir: ${fileName}` : 'Selecionar Arquivo PDF ou Imagem'}
              </label>
              
              <div className="relative mt-1">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="Nome do certificado ou URL"
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-300 text-[10px] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
              Fichas de Conclusão de Aula
            </label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {classSheets.map((sheet, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleSheetFileChange(index, e)}
                      className="hidden"
                      id={`sheet-file-input-${index}`}
                    />
                    <label
                      htmlFor={`sheet-file-input-${index}`}
                      className="w-full flex items-center justify-between bg-brand-medium border border-brand-medium/40 text-slate-300 text-xs rounded-xl px-3 py-2 cursor-pointer hover:border-brand-accent transition"
                    >
                      <span className="truncate max-w-[180px]">
                        {uploadingSheets[index] ? 'Enviando...' : sheet ? (sheet.startsWith('http') ? 'Ficha Anexada (Ver link abaixo)' : sheet) : `Selecionar Ficha ${index + 1}`}
                      </span>
                      {uploadingSheets[index] ? (
                        <div className="w-3.5 h-3.5 border border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </label>
                    {sheet && (
                      <input
                        type="text"
                        value={sheet}
                        onChange={(e) => updateSheetField(index, e.target.value)}
                        placeholder="Link da ficha"
                        className="w-full mt-1 bg-brand-medium/40 border border-brand-medium/20 text-slate-400 text-[10px] rounded-lg px-2 py-1 outline-none"
                      />
                    )}
                  </div>
                  {classSheets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSheetField(index)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 transition border border-red-500/25 self-start"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSheetField}
              className="mt-2 text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar outra ficha
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-brand-medium/30 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-300 text-sm font-semibold transition">
            Cancelar
          </button>
          <button onClick={() => { if (date && certName && selectedSchoolId) { onSubmit(date, certName, classSheets.filter(Boolean), selectedSchoolId); onClose(); } }}
            className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-sm font-bold transition shadow-lg shadow-sky-500/20">
            Enviar Certificado
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN EDIT MODULE MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface AdminEditModuleModalProps {
  candidateName: string;
  moduleCode: ModuleCode;
  prog: CandidateModuleProgress;
  schools: School[];
  onSubmit: (status: ModuleStatus, date?: string, cert?: string, classSheets?: string[], schoolId?: string) => void;
  onClose: () => void;
}

function AdminEditModuleModal({ candidateName, moduleCode, prog, schools, onSubmit, onClose }: AdminEditModuleModalProps) {
  const [date, setDate] = useState(prog.completionDate || new Date().toISOString().split('T')[0]);
  const [certName, setCertName] = useState(prog.certificateUrl || '');
  const [selectedSchoolId, setSelectedSchoolId] = useState(prog.schoolId || (schools[0]?.id || ''));
  const [classSheets, setClassSheets] = useState<string[]>(prog.classSheets || ['']);
  const [confirmingAnnul, setConfirmingAnnul] = useState(false);

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      window.open(url, '_blank');
    }
  };

  const addSheetField = () => setClassSheets([...classSheets, '']);
  const removeSheetField = (index: number) => setClassSheets(classSheets.filter((_, i) => i !== index));
  const updateSheetField = (index: number, val: string) => {
    const updated = [...classSheets];
    updated[index] = val;
    setClassSheets(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-brand-medium/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100">Editar Módulo (Admin)</h3>
            <p className="text-xs text-slate-500 mt-0.5">{candidateName} · Módulo {moduleLabel(moduleCode)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {!confirmingAnnul ? (
          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">Escola Realizada</label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-brand-accent transition cursor-pointer"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">Data de Conclusão</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-brand-accent transition" />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5 flex justify-between items-center">
                <span>Nome do Certificado (PDF)</span>
                {certName && certName.startsWith('http') && (
                  <div className="flex gap-2 items-center">
                    <a
                      href={certName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-sky-400 font-bold hover:underline hover:text-sky-300 transition"
                    >
                      Abrir Anexo
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadFile(certName, `certificado_${candidateName.toLowerCase().replace(/\s+/g, '_')}.pdf`)}
                      className="text-[10px] text-sky-400 font-bold hover:underline hover:text-sky-300 flex items-center gap-0.5"
                    >
                      <Download className="w-3 h-3" /> Baixar
                    </button>
                  </div>
                )}
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={certName} onChange={(e) => setCertName(e.target.value)}
                  placeholder="cert_modulo.pdf"
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-brand-accent transition" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">Fichas de Conclusão de Aula</label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {classSheets.map((sheet, index) => (
                  <div key={index} className="flex flex-col gap-1 border-b border-brand-medium/10 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Ficha {index + 1}</label>
                      {sheet && sheet.startsWith('http') && (
                        <div className="flex gap-2 items-center">
                          <a
                            href={sheet}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-sky-400 font-bold hover:underline hover:text-sky-300 transition"
                          >
                            Abrir Ficha
                          </a>
                          <button
                            type="button"
                            onClick={() => downloadFile(sheet, `ficha_aula_${index + 1}_${candidateName.toLowerCase().replace(/\s+/g, '_')}.pdf`)}
                            className="text-[9px] text-sky-400 font-bold hover:underline hover:text-sky-300 flex items-center gap-0.5"
                          >
                            <Download className="w-2.5 h-2.5" /> Baixar
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={sheet}
                          onChange={(e) => updateSheetField(index, e.target.value)}
                          placeholder={`Link ou arquivo da Ficha ${index + 1}`}
                          className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-brand-accent transition"
                        />
                      </div>
                      {classSheets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSheetField(index)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 transition border border-red-500/25"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSheetField}
                className="mt-2 text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar outra ficha
              </button>
            </div>

            <div className="flex gap-3 pt-2 border-t border-brand-medium/30">
              <button type="button" onClick={() => setConfirmingAnnul(true)} 
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-bold transition">
                Anular Módulo
              </button>
              <button type="button" onClick={() => { if (date && certName && selectedSchoolId) { onSubmit('completed', date, certName, classSheets.filter(Boolean), selectedSchoolId); onClose(); } }}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold transition shadow-lg shadow-sky-500/20">
                Salvar Alterações
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-slate-300 font-semibold mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Confirmar anulação do módulo?
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Esta ação apagará o certificado e a data de conclusão deste módulo. Se o aluno estiver 100% concluído, ele retornará ao status "Em Andamento".
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmingAnnul(false)} className="flex-1 py-2 rounded-lg bg-brand-medium text-slate-300 text-xs font-semibold transition hover:bg-brand-medium/80">
                  Cancelar
                </button>
                <button onClick={() => { onSubmit('pending'); onClose(); }} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition">
                  Sim, Anular
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 2 — TRAINING
// ─────────────────────────────────────────────────────────────────────────────
interface TrainingWorkspaceProps {
  candidates: Candidate[];
  modules: CandidateModuleProgress[];
  schools: School[];
  currentUser: User;
  onCompleteModule: (candidateId: string, code: ModuleCode, date: string, cert: string, classSheets: string[], schoolId: string) => void;
  onAdminEditModule: (candidateId: string, code: ModuleCode, status: ModuleStatus, date?: string, cert?: string, classSheets?: string[], schoolId?: string) => void;
  onRejectModule: (candidateId: string, code: ModuleCode, reason: string) => void;
}

function TrainingWorkspace({ candidates, modules, schools, currentUser, onCompleteModule, onAdminEditModule, onRejectModule }: TrainingWorkspaceProps) {
  const [search, setSearch] = useState('');
  const [drawerProg, setDrawerProg] = useState<{ prog: CandidateModuleProgress; candidateName: string } | null>(null);
  const [attachModal, setAttachModal] = useState<{ candidateId: string; code: ModuleCode; candidateName: string; schoolId: string } | null>(null);
  const [adminEditModal, setAdminEditModal] = useState<{ prog: CandidateModuleProgress; candidateName: string } | null>(null);

  const inTraining = candidates.filter((c) => {
    return c.status === 'in_progress' || c.status === 'completed';
  });

  const filtered = inTraining.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.re.toLowerCase().includes(search.toLowerCase())
  );

  const getProgress = (candidateId: string) => {
    const mods = modules.filter((m) => m.candidateId === candidateId);
    const done = mods.filter((m) => m.status === 'completed').length;
    return { mods, done, pct: Math.round((done / 3) * 100) };
  };

  const progressColor = (pct: number) =>
    pct === 100 ? 'from-emerald-500 to-teal-500' : pct === 0 ? 'bg-brand-medium/50' : 'from-sky-500 to-blue-600';

  const renderCandidateCard = (c: Candidate) => {
    const { mods, done, pct } = getProgress(c.id);
    const schoolName = schools.find((s) => s.id === c.schoolId)?.name ?? '—';
    const isSchoolOwner = currentUser.role === 'school_admin'; // Any school admin can attach/upload

    return (
      <div key={c.id} className="bg-brand-dark rounded-2xl border border-brand-medium/40 shadow-sm p-5 flex flex-col gap-4 hover:border-brand-accent transition">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-slate-200 text-base">{c.name}</h3>
              {c.status === 'completed' && (
                <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/25">
                  CONCLUÍDO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              <span className="font-mono">{c.re}</span> · <span className="font-mono">{c.anac}</span> · <Building className="w-3 h-3 inline mr-0.5 text-slate-600" />{schoolName}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-2xl font-extrabold ${pct === 100 ? 'text-emerald-400' : 'text-sky-400'}`}>{pct}%</p>
            <p className="text-[10px] text-slate-600">{done}/3 módulos</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-brand-medium/55 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor(pct)} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Module Blocks */}
        <div className="flex gap-3">
          {(['TEORICO', 'SIMULADOR', 'VOO'] as ModuleCode[]).map((code) => {
            const prog = mods.find((m) => m.moduleCode === code);
            return (
              <ModuleBlock
                key={code}
                code={code}
                prog={prog}
                isSchoolOwner={isSchoolOwner}
                isAdmin={currentUser.role === 'admin'}
                onAttach={(c2) => setAttachModal({ candidateId: c.id, code: c2, candidateName: c.name, schoolId: currentUser.schoolId || c.schoolId })}
                onOpenValidation={(p) => {
                  if (p.status === 'completed') {
                    setAdminEditModal({ prog: p, candidateName: c.name });
                  } else {
                    setDrawerProg({ prog: p, candidateName: c.name });
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const inProgressList = filtered.filter((c) => getProgress(c.id).pct < 100);
  const completedList = filtered.filter((c) => getProgress(c.id).pct === 100);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-sky-400" />
            Treinamento de Candidatos
          </h2>
          <p className="text-sm text-slate-500 mt-1">Acompanhe o progresso dos módulos: Teórico · Simulador · Voo</p>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Buscar candidato..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-brand-dark border border-brand-medium/40 text-slate-300 placeholder-slate-600 text-xs rounded-xl pl-9 pr-3 py-2 w-52 outline-none focus:border-brand-accent transition" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-600">
          <GraduationCap className="w-14 h-14 opacity-20" />
          <p className="text-base font-semibold">Nenhum candidato em treinamento</p>
          <p className="text-sm opacity-60">Aprovações no Workspace de Validação aparecerão aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Seção Em Andamento */}
          {inProgressList.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 animate-pulse" />
                Em Andamento ({inProgressList.length})
              </h3>
              <div className="flex flex-col gap-4">
                {inProgressList.map((c) => renderCandidateCard(c))}
              </div>
            </div>
          )}

          {/* Divisória Visual */}
          {inProgressList.length > 0 && completedList.length > 0 && (
            <div className="border-t border-brand-medium/30 my-2" />
          )}

          {/* Seção Concluídos */}
          {completedList.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Concluídos ({completedList.length})
              </h3>
              <div className="flex flex-col gap-4">
                {completedList.map((c) => renderCandidateCard(c))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificate Drawer */}
      {drawerProg && (
        <CertificateDrawer
          prog={drawerProg.prog}
          candidateName={drawerProg.candidateName}
          onValidate={() => {
            if (drawerProg.prog.completionDate && drawerProg.prog.certificateUrl && drawerProg.prog.schoolId) {
              onCompleteModule(drawerProg.prog.candidateId, drawerProg.prog.moduleCode,
                drawerProg.prog.completionDate, drawerProg.prog.certificateUrl, drawerProg.prog.classSheets || [], drawerProg.prog.schoolId);
            }
            setDrawerProg(null);
          }}
          onReject={async (reason: string) => {
            await onRejectModule(drawerProg.prog.candidateId, drawerProg.prog.moduleCode, reason);
            setDrawerProg(null);
          }}
          onClose={() => setDrawerProg(null)}
          schools={schools}
        />
      )}

      {/* Admin Edit Module Modal */}
      {adminEditModal && (
        <AdminEditModuleModal
          candidateName={adminEditModal.candidateName}
          moduleCode={adminEditModal.prog.moduleCode}
          prog={adminEditModal.prog}
          schools={schools}
          onSubmit={(status, date, cert, classSheets, schoolId) =>
            onAdminEditModule(adminEditModal.prog.candidateId, adminEditModal.prog.moduleCode, status, date, cert, classSheets, schoolId)
          }
          onClose={() => setAdminEditModal(null)}
        />
      )}

      {/* Attach Modal */}
      {attachModal && (
        <AttachModuleModal
          candidateName={attachModal.candidateName}
          moduleCode={attachModal.code}
          schools={schools}
          defaultSchoolId={attachModal.schoolId}
          onSubmit={(date, cert, classSheets, schoolId) =>
            onCompleteModule(attachModal.candidateId, attachModal.code, date, cert, classSheets, schoolId)
          }
          onClose={() => setAttachModal(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KANBAN CARD
// ─────────────────────────────────────────────────────────────────────────────
interface KanbanCardProps {
  candidate: Candidate;
  modules: CandidateModuleProgress[];
  currentUser: User;
  onMove: (id: string, status: SelectionStatus) => void;
  onUpdateGupy: (id: string, gupyStatus: GupyStatus) => void;
  schools: School[];
  onResetCandidate?: (id: string) => void;
}

function KanbanCard({ candidate: c, modules, currentUser, onMove, onUpdateGupy, schools, onResetCandidate }: KanbanCardProps) {
  const schoolName = schools.find((s) => s.id === c.schoolId)?.name ?? '—';
  const lastMod = modules.filter((m) => m.candidateId === c.id && m.status === 'completed')
    .sort((a, b) => new Date(b.uploadedAt ?? '').getTime() - new Date(a.uploadedAt ?? '').getTime())[0];

  const getGupyBadge = (status?: GupyStatus) => {
    if (status === 'gupy_pending') {
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Gupy: Pendente</span>;
    }
    if (!status || status === 'not_gupy') {
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">Não está na Gupy</span>;
    }
    if (status === 'gupy_min') {
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Gupy: Com Mínimos</span>;
    }
    return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Gupy: Sem Mínimos</span>;
  };

  const checkQuarantine = (rejectedAtStr?: string) => {
    if (!rejectedAtStr) return { passed: true, remainingStr: '' };
    const rejectedAt = new Date(rejectedAtStr);
    const now = new Date();
    
    // Calculate date 6 months from rejectedAt
    const unlockDate = new Date(rejectedAt);
    unlockDate.setMonth(unlockDate.getMonth() + 6);
    
    const diffMs = unlockDate.getTime() - now.getTime();
    if (diffMs <= 0) {
      return { passed: true, remainingStr: '' };
    }
    
    // Calculate remaining time in months and days
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    let remainingStr = '';
    if (months > 0) {
      remainingStr += `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    if (days > 0) {
      if (remainingStr) remainingStr += ' e ';
      remainingStr += `${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
    
    return { passed: false, remainingStr };
  };

  const { passed, remainingStr } = checkQuarantine(c.rejectedAt);

  return (
    <div className="bg-brand-dark rounded-xl border border-brand-medium/40 p-4 flex flex-col gap-3 hover:border-brand-accent hover:shadow-lg hover:shadow-black/30 transition-all duration-200 group">
      <div>
        <p className="font-semibold text-slate-200 text-sm">{c.name}</p>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.re} · {c.anac}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[11px] text-slate-600 flex items-center gap-1">
            <Building className="w-3 h-3" /> {schoolName}
          </span>
          {getGupyBadge(c.gupyStatus)}
        </div>
        {lastMod && (
          <p className="text-[11px] text-emerald-500/80 mt-2 flex items-center gap-1">
            <Award className="w-3 h-3" /> Concluído em {fmt(lastMod.uploadedAt)}
          </p>
        )}
      </div>

      {c.selectionStatus === 'finalized' && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-brand-medium/30">
          <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wide">Status na Gupy</label>
          <select
            value={c.gupyStatus || 'gupy_pending'}
            onChange={(e) => onUpdateGupy(c.id, e.target.value as GupyStatus)}
            className="w-full bg-brand-medium border border-brand-medium/40 text-slate-300 text-[11px] rounded-lg px-2 py-1.5 outline-none focus:border-brand-accent transition cursor-pointer"
          >
            <option value="gupy_pending">Pendente</option>
            <option value="not_gupy">Não está na Gupy</option>
            <option value="gupy_min">Na Gupy e tem os mínimos</option>
            <option value="gupy_no_min">Na Gupy e NÃO tem os mínimos</option>
          </select>
        </div>
      )}

      {currentUser.role === 'admin' && (
        <div className="flex flex-col gap-2 pt-2 border-t border-brand-medium/30">
          {c.selectionStatus === 'finalized' ? (
            <button
              onClick={() => onMove(c.id, 'in_selection')}
              className="w-full py-1.5 rounded-lg text-[10px] font-bold text-sky-400 border border-sky-500/25 hover:bg-sky-500/10 transition cursor-pointer"
            >
              Iniciar Proc. Seletivo
            </button>
          ) : c.selectionStatus === 'in_selection' ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => onMove(c.id, 'finalized')}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 border border-brand-medium/40 hover:bg-brand-medium/60 hover:text-slate-200 transition cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <ChevronLeft className="w-3 h-3" /> Voltar
                </button>
                <button
                  onClick={() => onMove(c.id, 'hired')}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/10 transition cursor-pointer"
                >
                  Contratar
                </button>
              </div>
              <button
                onClick={() => onMove(c.id, 'rejected')}
                className="w-full py-1.5 rounded-lg text-[10px] font-bold text-red-400 border border-red-500/25 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
              >
                Reprovar Candidato
              </button>
            </div>
          ) : c.selectionStatus === 'rejected' ? (
            <div className="flex flex-col gap-2">
              {!passed ? (
                <div className="px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold text-center flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Quarentena: {remainingStr}
                </div>
              ) : (
                <button
                  onClick={() => onResetCandidate && onResetCandidate(c.id)}
                  className="w-full py-1.5 rounded-lg text-[10px] font-bold text-amber-400 border border-amber-500/25 hover:bg-amber-500/10 hover:text-amber-300 transition cursor-pointer"
                >
                  Reiniciar Processo
                </button>
              )}
              {currentUser.role === 'admin' && (
                <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-brand-medium/20">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Mover manualmente:</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onMove(c.id, 'in_selection')}
                      className="flex-1 py-1 rounded-lg text-[9px] font-bold text-sky-400 border border-sky-500/25 hover:bg-sky-500/10 transition cursor-pointer"
                    >
                      Mover p/ P.S.
                    </button>
                    <button
                      onClick={() => onMove(c.id, 'finalized')}
                      className="flex-1 py-1 rounded-lg text-[9px] font-bold text-slate-300 border border-brand-medium/60 hover:bg-brand-medium/60 transition cursor-pointer"
                    >
                      Mover p/ Finalizou
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onMove(c.id, 'in_selection')}
              className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 border border-brand-medium/40 hover:bg-brand-medium/60 hover:text-slate-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Voltar para P.S.
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 3 — SELECTION PROCESS
// ─────────────────────────────────────────────────────────────────────────────
interface SelectionWorkspaceProps {
  candidates: Candidate[];
  modules: CandidateModuleProgress[];
  currentUser: User;
  onMove: (id: string, status: SelectionStatus) => void;
  onUpdateGupy: (id: string, gupyStatus: GupyStatus) => void;
  schools: School[];
  onResetCandidate: (id: string) => void;
}

const KANBAN_COLUMNS: { id: SelectionStatus; label: string; sublabel: string; colorClass: string; badgeClass: string }[] = [
  { id: 'finalized', label: 'Finalizou', sublabel: 'Treinamento concluído com sucesso', colorClass: 'border-brand-medium/40 bg-brand-medium/10', badgeClass: 'bg-brand-medium/60 text-slate-400' },
  { id: 'in_selection', label: 'Processo Seletivo', sublabel: 'Convocado para seleção', colorClass: 'border-brand-accent/15 bg-brand-accent/3', badgeClass: 'bg-brand-accent/20 text-sky-400' },
  { id: 'hired', label: 'Contratado', sublabel: 'Candidatos contratados', colorClass: 'border-emerald-500/15 bg-emerald-500/3', badgeClass: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'rejected', label: 'Reprovado', sublabel: 'Em quarentena (6 meses)', colorClass: 'border-rose-500/15 bg-rose-500/3', badgeClass: 'bg-rose-500/20 text-rose-400' },
];

function SelectionWorkspace({ candidates, modules, currentUser, onMove, onUpdateGupy, schools, onResetCandidate }: SelectionWorkspaceProps) {
  const completed = candidates.filter((c) => {
    const matchesRole = currentUser.role === 'admin' || c.schoolId === currentUser.schoolId;
    return matchesRole && c.status === 'completed';
  });

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-accent" />
            Processo Seletivo
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Candidatos com 100% de treinamento concluído ·{' '}
            <span className="text-slate-400 font-semibold">{completed.length} formados</span>
          </p>
        </div>
      </div>

      {completed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-600">
          <Trophy className="w-14 h-14 opacity-20" />
          <p className="text-base font-semibold">Nenhum candidato formado ainda</p>
          <p className="text-sm opacity-60">Candidatos que concluírem 100% do treinamento aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {KANBAN_COLUMNS.map((col) => {
            const cards = completed.filter((c) => c.selectionStatus === col.id);
            return (
              <div key={col.id} className={`rounded-2xl border ${col.colorClass} p-4 flex flex-col gap-4`}>
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{col.label}</h3>
                    <p className="text-[10px] text-slate-600 mt-0.5">{col.sublabel}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${col.badgeClass}`}>{cards.length}</span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {cards.length === 0 ? (
                    <div className="py-8 flex flex-col items-center text-slate-700 gap-2">
                      <Users className="w-7 h-7 opacity-40" />
                      <p className="text-xs">Nenhum candidato aqui</p>
                    </div>
                  ) : (
                    cards.map((c) => (
                      <KanbanCard key={c.id} candidate={c} modules={modules} currentUser={currentUser} onMove={onMove} onUpdateGupy={onUpdateGupy} schools={schools} onResetCandidate={onResetCandidate} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD CANDIDATE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AddCandidateModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (re: string, name: string, anac: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ re: '', name: '', anac: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b border-brand-medium/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100">Solicitar Nova Validação</h3>
            <p className="text-xs text-slate-500 mt-0.5">Submeter candidato para aprovação do Admin</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form.re, form.name, form.anac); }} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">Nome Completo</label>
            <input required type="text" value={form.name} onChange={set('name')} placeholder="Nome do candidato"
              className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-brand-accent transition placeholder-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">RE</label>
              <input required type="text" value={form.re} onChange={set('re')} placeholder="Ex: RE-4512"
                className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-brand-accent transition placeholder-slate-600" />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">ANAC</label>
              <input required type="text" value={form.anac} onChange={set('anac')} placeholder="Ex: ANAC-12345"
                className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-brand-accent transition placeholder-slate-600" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-300 text-sm font-semibold transition">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-sm font-bold transition shadow-lg shadow-sky-500/20">
              Enviar Candidato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD ADMINISTRATOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface AddAdminModalProps {
  onSubmit: (userId: string) => void;
  onClose: () => void;
  users: User[];
}

function AddAdminModal({ onSubmit, onClose, users }: AddAdminModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    onSubmit(selectedUserId);
    onClose();
  };

  const candidateUsers = users.filter(u => u.role !== 'admin');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b border-brand-medium/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100">Adicionar Administrador</h3>
            <p className="text-xs text-slate-500 mt-0.5">Promover um usuário cadastrado a Administrador Geral</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">Selecione o Usuário</label>
            {candidateUsers.length > 0 ? (
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-brand-accent transition cursor-pointer"
              >
                <option value="" disabled>Escolha um usuário registrado...</option>
                {candidateUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                Nenhum usuário escolar cadastrado disponível para promoção. Peça para o novo admin se cadastrar na tela inicial primeiro.
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-300 text-sm font-semibold transition">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedUserId}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-brand-medium disabled:text-slate-500 text-slate-950 text-sm font-bold transition shadow-lg disabled:shadow-none"
            >
              Promover a Adm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 4 — PARTNER SCHOOLS MANAGEMENT (ESCOLAS PARCEIRAS)
// ─────────────────────────────────────────────────────────────────────────────
interface PartnerSchoolsWorkspaceProps {
  schools: School[];
  users: User[];
  currentUser: User;
  onRefresh: () => Promise<void>;
  onAddAdmin: (userId: string) => void;
}

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

function PartnerSchoolsWorkspace({
  schools,
  users,
  currentUser,
  onRefresh,
  onAddAdmin
}: PartnerSchoolsWorkspaceProps) {
  const [searchName, setSearchName] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [resettingSchool, setResettingSchool] = useState<School | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    username: '',
    tempPassword: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: ''
  });

  const [newTempPassword, setNewTempPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Filtragem de escolas
  const filteredSchools = schools.filter((school) => {
    const schoolUser = users.find((u) => u.schoolId === school.id);
    const username = schoolUser?.username || '';

    const matchesName = school.name.toLowerCase().includes(searchName.trim().toLowerCase());
    const matchesUser = username.toLowerCase().includes(searchUsername.trim().toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? school.active === true
        : school.active === false;

    return matchesName && matchesUser && matchesStatus;
  });

  const handleCreateSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const res = await stateMachine.createSchoolWithUser(
        addForm.name,
        addForm.email,
        addForm.phone,
        addForm.username,
        addForm.tempPassword,
        addForm.contactName,
        currentUser
      );

      if (!res.success) {
        setModalError(res.message);
      } else {
        await onRefresh();
        setShowAddModal(false);
        setAddForm({ name: '', contactName: '', email: '', phone: '', username: '', tempPassword: '' });
        setFeedback({ type: 'success', message: res.message });
      }
    } catch (err: any) {
      setModalError(err.message || 'Erro ao cadastrar escola.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    setModalError('');
    setModalLoading(true);

    try {
      const res = await stateMachine.updateSchool(
        editingSchool.id,
        editForm.name,
        editForm.email,
        editForm.phone,
        editForm.contactName,
        currentUser
      );

      if (!res.success) {
        setModalError(res.message);
      } else {
        await onRefresh();
        setEditingSchool(null);
        setFeedback({ type: 'success', message: res.message });
      }
    } catch (err: any) {
      setModalError(err.message || 'Erro ao atualizar escola.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingSchool) return;
    setModalError('');
    setModalLoading(true);

    try {
      const res = await stateMachine.resetSchoolPassword(
        resettingSchool.id,
        newTempPassword,
        currentUser
      );

      if (!res.success) {
        setModalError(res.message);
      } else {
        await onRefresh();
        setResettingSchool(null);
        setNewTempPassword('');
        setFeedback({ type: 'success', message: res.message });
      }
    } catch (err: any) {
      setModalError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (school: School) => {
    const newStatus = !school.active;
    const res = await stateMachine.toggleSchoolStatus(school.id, newStatus, currentUser);
    if (res.success) {
      await onRefresh();
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const admins = users.filter((u) => u.role === 'admin');

  return (
    <div className="animate-fade-in flex flex-col gap-8">
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ────────────────── SEÇÃO DE ESCOLAS PARCEIRAS ────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Building className="w-6 h-6 text-sky-400" />
              Escolas Parceiras
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Cadastre, edite credenciais e gerencie os acessos das escolas credenciadas
            </p>
          </div>
          <button
            onClick={() => {
              setModalError('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Cadastro
          </button>
        </div>

        {/* Barra de Filtros e Pesquisa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-brand-dark p-4 rounded-2xl border border-brand-medium/40 shadow-md">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Buscar por Nome</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Ex: Escola Delta"
              className="w-full bg-brand-medium/55 border border-brand-medium/40 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Buscar por Usuário</label>
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Ex: escola_delta"
              className="w-full bg-brand-medium/55 border border-brand-medium/40 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Filtro por Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-brand-medium/55 border border-brand-medium/40 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition cursor-pointer"
            >
              <option value="all">Todas as Escolas</option>
              <option value="active">Apenas Ativas</option>
              <option value="inactive">Apenas Inativas</option>
            </select>
          </div>
        </div>

        {/* Tabela de Escolas */}
        <div className="bg-brand-dark rounded-2xl border border-brand-medium/40 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-medium/30 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-5">Nome da Escola</th>
                  <th className="py-3.5 px-5">Usuário</th>
                  <th className="py-3.5 px-5">E-mail</th>
                  <th className="py-3.5 px-5">Telefone</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Última Atualização</th>
                  <th className="py-3.5 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      Nenhuma escola encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => {
                    const schoolUser = users.find((u) => u.schoolId === school.id);
                    const usernameDisplay = schoolUser?.username || 'escola_parceira';
                    const lastUpdate = school.updatedAt || school.createdAt;
                    return (
                      <tr key={school.id} className="border-b border-brand-medium/20 hover:bg-brand-medium/10 transition">
                        <td className="py-3.5 px-5 font-semibold text-slate-200">{school.name}</td>
                        <td className="py-3.5 px-5 font-mono text-sky-400 font-medium">{usernameDisplay}</td>
                        <td className="py-3.5 px-5 text-slate-400">{school.email}</td>
                        <td className="py-3.5 px-5 text-slate-400 font-mono">{school.phone}</td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              school.active
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            }`}
                          >
                            {school.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                          {lastUpdate ? `${fmt(lastUpdate)} · ${fmtTime(lastUpdate)}` : '-'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingSchool(school);
                                setEditForm({
                                  name: school.name,
                                  contactName: school.contactName || school.name,
                                  email: school.email,
                                  phone: school.phone
                                });
                                setModalError('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-medium/50 hover:bg-brand-medium border border-brand-medium/60 text-slate-300 hover:text-sky-400 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                              title="Editar Escola"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => {
                                setResettingSchool(school);
                                setNewTempPassword('');
                                setModalError('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/25 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                              title="Redefinir Senha da Escola"
                            >
                              <Key className="w-3.5 h-3.5" /> Redefinir Senha
                            </button>
                            <button
                              onClick={() => handleToggleStatus(school)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                school.active
                                  ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 border-rose-500/25'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border-emerald-500/25'
                              }`}
                            >
                              {school.active ? 'Inativar' : 'Ativar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ────────────────── SEÇÃO DE ADMINISTRADORES DO SISTEMA ────────────────── */}
      <div className="flex flex-col gap-6 pt-4 border-t border-brand-medium/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              Administradores do Sistema
            </h2>
            <p className="text-sm text-slate-500 mt-1">Gerencie os usuários administradores com acesso geral</p>
          </div>
          <button
            onClick={() => setShowAddAdminModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Cadastrar Administrador
          </button>
        </div>

        <div className="bg-brand-dark rounded-2xl border border-brand-medium/40 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-medium/30 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-5">Nome do Admin</th>
                  <th className="py-3.5 px-5">E-mail</th>
                  <th className="py-3.5 px-5">Função</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-brand-medium/20 hover:bg-brand-medium/10 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-200">{admin.name}</td>
                    <td className="py-3.5 px-5 text-slate-400">{admin.email}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                        Administrador Geral
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">
                      <span className="text-emerald-400 font-medium text-[10px]">Ativo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ────────────────── MODAL NOVA ESCOLA ────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-brand-medium/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100">Nova Escola Parceira</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cadastre os dados da escola e suas credenciais de acesso</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start gap-2 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSchoolSubmit} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                  Nome da Escola *
                </label>
                <input
                  required
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Escola de Aviação Delta"
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                    Contato / Responsável
                  </label>
                  <input
                    type="text"
                    value={addForm.contactName}
                    onChange={(e) => setAddForm((p) => ({ ...p, contactName: e.target.value }))}
                    placeholder="Ex: Carlos Andrade"
                    className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                    Telefone *
                  </label>
                  <input
                    required
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                  E-mail de Contato *
                </label>
                <input
                  required
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="contato@escoladelta.com.br"
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                />
              </div>

              <div className="pt-2 border-t border-brand-medium/30 flex flex-col gap-3">
                <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">Credenciais de Acesso</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                      Usuário (Login) *
                    </label>
                    <input
                      required
                      type="text"
                      value={addForm.username}
                      onChange={(e) => setAddForm((p) => ({ ...p, username: e.target.value }))}
                      placeholder="escola_delta"
                      className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">4-30 caracteres (letras, números, _)</span>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                      Senha Provisória *
                    </label>
                    <input
                      required
                      type="password"
                      value={addForm.tempPassword}
                      onChange={(e) => setAddForm((p) => ({ ...p, tempPassword: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-300 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-sm font-bold transition shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {modalLoading ? 'Salvando...' : 'Salvar Escola'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── MODAL EDITAR ESCOLA ────────────────── */}
      {editingSchool && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-brand-medium/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100">Editar Escola Parceira</h3>
                <p className="text-xs text-slate-500 mt-0.5">Atualize as informações cadastrais da escola</p>
              </div>
              <button
                onClick={() => setEditingSchool(null)}
                className="p-2 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start gap-2 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                  Nome da Escola *
                </label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                  Contato / Responsável
                </label>
                <input
                  type="text"
                  value={editForm.contactName}
                  onChange={(e) => setEditForm((p) => ({ ...p, contactName: e.target.value }))}
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                  E-mail de Contato *
                </label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                  Telefone *
                </label>
                <input
                  required
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-300 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-sm font-bold transition shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {modalLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── MODAL REDEFINIR SENHA ────────────────── */}
      {resettingSchool && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-brand-medium/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100">Redefinir Senha de Acesso</h3>
                <p className="text-xs text-slate-500 mt-0.5">{resettingSchool.name}</p>
              </div>
              <button
                onClick={() => setResettingSchool(null)}
                className="p-2 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start gap-2 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="px-6 py-5 flex flex-col gap-4">
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-400">
                <strong>Atenção:</strong> Ao redefinir a senha provisória, a escola será obrigada a cadastrar uma nova senha definitiva no próximo acesso ao sistema.
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide block mb-1.5">
                  Nova Senha Provisória *
                </label>
                <input
                  required
                  type="password"
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-400 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingSchool(null)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-medium hover:bg-brand-medium/80 text-slate-300 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {modalLoading ? 'Redefinindo...' : 'Confirmar Redefinição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddAdminModal && (
        <AddAdminModal users={users} onSubmit={onAddAdmin} onClose={() => setShowAddAdminModal(false)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados do Primeiro Acesso
  const [firstAccessUser, setFirstAccessUser] = useState<User | null>(null);
  const [tempPasswordInput, setTempPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const rawInput = email.trim();
    const isEmail = rawInput.includes('@');
    const syntheticEmail = isEmail
      ? rawInput
      : `${rawInput.toLowerCase().replace(/[^a-z0-9]/g, '')}@escolarecomendada.local`;

    const isDefaultAdmin =
      (rawInput.toLowerCase() === 'admin' || rawInput === 'admin@empresa.com') &&
      password === 'crpazul1234*';

    try {
      await signInWithEmailAndPassword(auth, syntheticEmail, password);
    } catch (signInErr: any) {
      console.warn('Firebase Auth notice:', signInErr);

      if (
        isDefaultAdmin ||
        signInErr.code === 'auth/configuration-not-found' ||
        signInErr.code === 'auth/operation-not-allowed'
      ) {
        if (isDefaultAdmin) {
          const adminProfile: User = {
            id: 'usr-admin',
            email: 'admin@empresa.com',
            username: 'admin',
            name: 'Admin Geral (Minha Empresa)',
            role: 'admin'
          };
          localStorage.setItem('escola_user_session', JSON.stringify(adminProfile));
          window.dispatchEvent(new Event('local_auth_change'));
          setLoading(false);
          return;
        }
      }

      // Tentar login via banco de dados (localStorage + Firestore)
      try {
        const users = await mockDb.getUsers();
        const found = users.find(u =>
          (u.email.toLowerCase() === rawInput.toLowerCase() || u.username?.toLowerCase() === rawInput.toLowerCase() || u.email.toLowerCase() === syntheticEmail.toLowerCase()) &&
          (u as any).password === password
        );
        if (found) {
          // 1. Checar se a escola/usuário está inativo
          if (found.active === false) {
            setError('Sua escola encontra-se inativa. Entre em contato com o Administrador.');
            setLoading(false);
            return;
          }

          if (found.schoolId) {
            const schools = await mockDb.getSchools();
            const linkedSchool = schools.find(s => s.id === found.schoolId);
            if (linkedSchool && linkedSchool.active === false) {
              setError('Sua escola encontra-se inativa. Entre em contato com o Administrador.');
              setLoading(false);
              return;
            }
          }

          if (found.role === 'school_admin' && !found.schoolId) {
            setError('Sua conta ainda está aguardando aprovação do administrador. Aguarde o contato.');
            setLoading(false);
            return;
          }

          // 2. Checar se exige troca de senha no Primeiro Acesso
          if (found.primeiroAcesso) {
            setFirstAccessUser(found);
            setTempPasswordInput(password);
            setLoading(false);
            return;
          }

          localStorage.setItem('escola_user_session', JSON.stringify(found));
          window.dispatchEvent(new Event('local_auth_change'));
          setLoading(false);
          return;
        }
      } catch (e) {}

      setError('Usuário ou senha incorretos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFirstAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstAccessUser) return;
    setLoading(true);

    try {
      const res = await stateMachine.completeFirstAccess(
        firstAccessUser.id,
        tempPasswordInput,
        newPassword,
        confirmPassword
      );

      if (!res.success) {
        setError(res.message);
        setLoading(false);
        return;
      }

      // Concluir login automaticamente
      const updatedUser: User = {
        ...firstAccessUser,
        password: newPassword,
        primeiroAcesso: false
      };
      localStorage.setItem('escola_user_session', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('local_auth_change'));
    } catch (err: any) {
      setError(err.message || 'Erro ao concluir primeiro acesso.');
    } finally {
      setLoading(false);
    }
  };

  if (firstAccessUser) {
    return (
      <div className="min-h-screen bg-brand-darkest flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="w-full max-w-md bg-brand-dark/40 backdrop-blur-md border border-brand-medium/30 rounded-3xl shadow-2xl p-8 flex flex-col gap-6 relative z-10">
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto">
              <Key className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-2">Primeiro Acesso — Troca de Senha</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Por motivos de segurança, você deve cadastrar uma nova senha definitiva no seu primeiro acesso antes de continuar.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCompleteFirstAccess} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5 pl-1">
                Nova Senha *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-brand-medium/55 border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3.5 py-3 outline-none focus:border-brand-accent transition placeholder-slate-600 font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5 pl-1">
                Confirmar Nova Senha *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Redigite a nova senha"
                className="w-full bg-brand-medium/55 border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3.5 py-3 outline-none focus:border-brand-accent transition placeholder-slate-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-black transition shadow-lg shadow-emerald-500/10 mt-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Senha e Acessar Plataforma'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darkest flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-5000" />

      <div className="w-full max-w-md bg-brand-dark/40 backdrop-blur-md border border-brand-medium/30 rounded-3xl shadow-2xl p-8 flex flex-col gap-6 relative z-10">
        <div className="flex flex-col items-center gap-3">
          <img src="/azul_logo_2.png" alt="Azul Linhas Aéreas" className="h-20 w-auto object-contain" />
          <div className="text-center mt-1">
            <h1 className="text-lg font-black text-slate-100 tracking-wider uppercase leading-none">Escola Recomendada</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-1">Gestão de Treinamentos</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5 pl-1">Usuário / E-mail</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin ou seu_login"
              className="w-full bg-brand-medium/55 border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3.5 py-3 outline-none focus:border-brand-accent transition placeholder-slate-600 font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5 pl-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-brand-medium/55 border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3.5 py-3 outline-none focus:border-brand-accent transition placeholder-slate-600 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-sm font-black transition shadow-lg shadow-sky-500/10 mt-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Acessar Plataforma'}
          </button>
        </form>
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// SCHOOL SETTINGS WORKSPACE (CHANGE PASSWORD)
// ─────────────────────────────────────────────────────────────────────────────
interface SchoolSettingsWorkspaceProps {
  onChangePassword: (oldPass: string, newPass: string) => Promise<boolean>;
}

function SchoolSettingsWorkspace({ onChangePassword }: SchoolSettingsWorkspaceProps) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPass === 'crpazul1234*') {
      setError('A nova senha não pode ser a senha padrão.');
      return;
    }
    if (newPass.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('As senhas não coincidem.');
      return;
    }

    const ok = await onChangePassword(oldPass, newPass);
    if (ok) {
      setSuccess('Senha alterada com sucesso!');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setError('Senha atual incorreta.');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-md">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-400" />
          Configurações da Conta
        </h2>
        <p className="text-sm text-slate-500 mt-1">Gerencie a segurança e a senha de acesso da escola</p>
      </div>

      <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-slate-200 text-sm mb-4">Alterar Senha</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-xs text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-xs text-emerald-400 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5 pl-1">Senha Atual</label>
            <input
              type="password"
              required
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="Digite a senha atual"
              className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-brand-accent transition"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5 pl-1">Nova Senha</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-brand-accent transition"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5 pl-1">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirme a nova senha"
              className="w-full bg-brand-medium border border-brand-medium/40 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-brand-accent transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold transition shadow-lg shadow-sky-500/20 mt-2 cursor-pointer"
          >
            Salvar Nova Senha
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE 5 — DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardWorkspaceProps {
  candidates: Candidate[];
  modules: CandidateModuleProgress[];
  schools: School[];
}

function DashboardWorkspace({ candidates, modules, schools }: DashboardWorkspaceProps) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');

  // Filter candidates based on selected school
  const filteredCandidates = selectedSchoolId === 'all'
    ? candidates
    : candidates.filter(c => c.schoolId === selectedSchoolId);

  const total = filteredCandidates.length;
  const pendingValidation = filteredCandidates.filter(c => c.status === 'pending_validation').length;
  const inTraining = filteredCandidates.filter(c => c.status === 'in_progress').length;
  const completed = filteredCandidates.filter(c => c.status === 'completed').length;
  const rejectedValidation = filteredCandidates.filter(c => c.status === 'rejected').length;
  
  // Selection status
  const inSelection = filteredCandidates.filter(c => c.status === 'completed' && c.selectionStatus === 'in_selection').length;
  const hired = filteredCandidates.filter(c => c.status === 'completed' && c.selectionStatus === 'hired').length;
  const selectionRejected = filteredCandidates.filter(c => c.status === 'completed' && c.selectionStatus === 'rejected').length;

  // Success metrics
  const trainingSuccessRate = total > 0 ? Math.round((completed / Math.max(1, total - pendingValidation - rejectedValidation)) * 100) : 0;
  const hiringRate = completed > 0 ? Math.round((hired / completed) * 100) : 0;

  // Module Completion Counters (among candidates currently in progress or completed)
  const candidateIds = filteredCandidates.map(c => c.id);
  const relevantModules = modules.filter(m => candidateIds.includes(m.candidateId));
  const teoricoDone = relevantModules.filter(m => m.moduleCode === 'TEORICO' && m.status === 'completed').length;
  const simuladorDone = relevantModules.filter(m => m.moduleCode === 'SIMULADOR' && m.status === 'completed').length;
  const vooDone = relevantModules.filter(m => m.moduleCode === 'VOO' && m.status === 'completed').length;

  // Average time to complete training (in days)
  const completedCands = filteredCandidates.filter(c => c.status === 'completed' && c.validatedAt);
  let avgDays = 0;
  if (completedCands.length > 0) {
    const totalDays = completedCands.reduce((acc, c) => {
      const start = new Date(c.validatedAt!).getTime();
      // Find the latest completed module upload date
      const candMods = modules.filter(m => m.candidateId === c.id && m.status === 'completed' && m.uploadedAt);
      if (candMods.length > 0) {
        const latestUpload = Math.max(...candMods.map(m => new Date(m.uploadedAt!).getTime()));
        return acc + (latestUpload - start) / (1000 * 60 * 60 * 24);
      }
      return acc;
    }, 0);
    avgDays = Math.round(totalDays / completedCands.length);
  }

  // School ranking (only if 'all' is selected)
  const schoolRanking = schools.map(s => {
    const count = candidates.filter(c => c.schoolId === s.id && c.status === 'completed').length;
    const totalSchool = candidates.filter(c => c.schoolId === s.id).length;
    return { name: s.name, completedCount: count, total: totalSchool };
  }).sort((a, b) => b.completedCount - a.completedCount);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Header with Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-sky-400" />
            Painel de Estatísticas
          </h2>
          <p className="text-sm text-slate-500 mt-1">Monitore indicadores de desempenho, progresso e contratações</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Filtrar por Escola:</label>
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="bg-brand-dark border border-brand-medium/40 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-accent transition cursor-pointer"
          >
            <option value="all">Todas as Escolas</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-brand-dark to-brand-darkest border border-brand-medium/40 rounded-2xl p-5 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-brand-accent/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidatos Cadastrados</p>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-black text-slate-100">{total}</span>
            <span className="text-xs text-slate-400 font-medium">{pendingValidation} pendentes</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-brand-dark to-brand-darkest border border-brand-medium/40 rounded-2xl p-5 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-brand-accent/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Em Treinamento</p>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-black text-slate-100">{inTraining}</span>
            <span className="text-xs text-slate-400 font-medium">Cursando os módulos</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-brand-dark to-brand-darkest border border-brand-medium/40 rounded-2xl p-5 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-brand-accent/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Treinamento Concluído</p>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-black text-slate-100">{completed}</span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{trainingSuccessRate}% sucesso</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-gradient-to-br from-brand-dark to-brand-darkest border border-brand-medium/40 rounded-2xl p-5 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-brand-accent/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl group-hover:bg-brand-gold/10 transition" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilotos Contratados</p>
          <div className="flex items-baseline justify-between mt-4">
            <span className="text-3xl font-black text-slate-100">{hired}</span>
            <span className="text-xs text-brand-gold font-bold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">{hiringRate}% contratação</span>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module Progression */}
        <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl p-5 md:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Conclusão de Módulos</h3>
            <p className="text-xs text-slate-500 mt-1">Quantidade de pilotos que finalizaram cada fase obrigatória</p>
          </div>
          <div className="flex flex-col gap-5 py-2">
            {/* Teórico */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" /> Módulo Teórico
                </span>
                <span className="font-mono text-slate-400 font-bold">{teoricoDone} / {inTraining + completed} concluídos</span>
              </div>
              <div className="w-full bg-brand-medium/30 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-1000"
                  style={{ width: `${(inTraining + completed) > 0 ? (teoricoDone / (inTraining + completed)) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Simulador */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-indigo-400" /> Módulo Simulador
                </span>
                <span className="font-mono text-slate-400 font-bold">{simuladorDone} / {inTraining + completed} concluídos</span>
              </div>
              <div className="w-full bg-brand-medium/30 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000"
                  style={{ width: `${(inTraining + completed) > 0 ? (simuladorDone / (inTraining + completed)) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Voo */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-emerald-400" /> Prática de Voo
                </span>
                <span className="font-mono text-slate-400 font-bold">{vooDone} / {inTraining + completed} concluídos</span>
              </div>
              <div className="w-full bg-brand-medium/30 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${(inTraining + completed) > 0 ? (vooDone / (inTraining + completed)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Training Performance Time */}
        <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl p-5 flex flex-col gap-6">
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Tempo de Treinamento</h3>
            <p className="text-xs text-slate-500 mt-1">Duração média para concluir as 3 fases</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-4">
            <div className="w-28 h-28 rounded-full border-4 border-sky-500/20 border-t-sky-400 flex flex-col items-center justify-center bg-brand-darkest shadow-inner">
              <span className="text-3xl font-black text-slate-100">{avgDays || '—'}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">dias</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Média calculada para {completedCands.length} pilotos</p>
              <p className="text-[10px] text-slate-500 mt-1">Desde a validação do Admin até o último envio de certificado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Rankings & Funnels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* School Ranking */}
        {selectedSchoolId === 'all' ? (
          <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl p-5 md:col-span-2 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Ranking de Escolas</h3>
              <p className="text-xs text-slate-500 mt-1">Quantidade de pilotos formados (treinamento concluído)</p>
            </div>
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mt-2 pr-1">
              {schoolRanking.map((sr, idx) => (
                <div key={sr.name} className="flex items-center gap-3 bg-brand-darkest/40 border border-brand-medium/20 rounded-xl p-3 hover:border-brand-medium transition">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    idx === 0 ? 'bg-brand-gold/15 text-brand-gold' : idx === 1 ? 'bg-slate-300/15 text-slate-300' : 'bg-brand-medium text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-300 truncate">{sr.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{sr.total} candidatos registrados</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-sky-400">{sr.completedCount}</span>
                    <span className="text-[10px] text-slate-600 font-medium ml-1">concluídos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl p-5 md:col-span-2 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Distribuição Gupy</h3>
              <p className="text-xs text-slate-500 mt-1">Status da triagem para a escola selecionada</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-brand-darkest/40 border border-brand-medium/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-emerald-400">{filteredCandidates.filter(c => c.gupyStatus === 'gupy_min').length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Com Mínimos</p>
              </div>
              <div className="bg-brand-darkest/40 border border-brand-medium/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-rose-400">{filteredCandidates.filter(c => c.gupyStatus === 'gupy_no_min').length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Sem Mínimos</p>
              </div>
              <div className="bg-brand-darkest/40 border border-brand-medium/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-slate-400">{filteredCandidates.filter(c => c.gupyStatus === 'not_gupy' || !c.gupyStatus).length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Fora da Gupy</p>
              </div>
              <div className="bg-brand-darkest/40 border border-brand-medium/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-amber-400">{filteredCandidates.filter(c => c.gupyStatus === 'gupy_pending').length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Triagem Pendente</p>
              </div>
            </div>
          </div>
        )}

        {/* Funnel */}
        <div className="bg-brand-dark border border-brand-medium/40 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Processo Seletivo (Funil)</h3>
            <p className="text-xs text-slate-500 mt-1">Distribuição dos pilotos qualificados</p>
          </div>
          <div className="flex flex-col gap-4 justify-center mt-2">
            {/* Qualified */}
            <div className="flex items-center justify-between text-xs bg-slate-900/30 p-2.5 rounded-xl border border-brand-medium/20">
              <span className="font-medium text-slate-400 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Qualificados
              </span>
              <span className="font-bold text-slate-200 font-mono text-sm">{completed}</span>
            </div>
            {/* In Selection */}
            <div className="flex items-center justify-between text-xs bg-slate-900/30 p-2.5 rounded-xl border border-brand-medium/20">
              <span className="font-medium text-slate-400 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" /> Em Seleção
              </span>
              <span className="font-bold text-slate-200 font-mono text-sm">{inSelection}</span>
            </div>
            {/* Hired */}
            <div className="flex items-center justify-between text-xs bg-slate-900/30 p-2.5 rounded-xl border border-brand-medium/20">
              <span className="font-medium text-slate-400 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Contratados
              </span>
              <span className="font-bold text-slate-200 font-mono text-sm">{hired}</span>
            </div>
            {/* Reprovados */}
            <div className="flex items-center justify-between text-xs bg-slate-900/30 p-2.5 rounded-xl border border-brand-medium/20">
              <span className="font-medium text-slate-400 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Reprovados
              </span>
              <span className="font-bold text-slate-200 font-mono text-sm">{selectionRejected}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers]             = useState<User[]>([]);
  const [schools, setSchools]         = useState<School[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [candidates, setCandidates]   = useState<Candidate[]>([]);
  const [modules, setModules]         = useState<CandidateModuleProgress[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts]           = useState<Notification[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('validation');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading]         = useState(true);

  const handleSession = async (firebaseUser: any) => {
    if (!firebaseUser) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setCurrentUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Novo Usuário',
          role: 'school_admin'
        });
      } else {
        const profile = userSnap.data();
        setCurrentUser({
          id: firebaseUser.uid,
          email: profile.email || firebaseUser.email || '',
          username: profile.username,
          name: profile.name || 'Novo Usuário',
          role: (profile.role as UserRole) || 'school_admin',
          schoolId: profile.school_id || undefined
        });
      }
    } catch (err) {
      console.error("Erro ao carregar perfil no Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    try {
      const [u, s, c, m, n] = await Promise.all([
        mockDb.getUsers(),
        mockDb.getSchools(),
        mockDb.getCandidates(),
        mockDb.getModuleProgress(),
        mockDb.getNotifications()
      ]);
      setUsers(u);
      setSchools(s);
      setCandidates(c);
      setModules(m);
      setNotifications(n);
    } catch (err) {
      console.error("Erro ao carregar dados do banco:", err);
    }
  };

  useEffect(() => {
    setLoading(true);

    const checkLocalSession = () => {
      const saved = localStorage.getItem('escola_user_session');
      if (saved) {
        try {
          const u = JSON.parse(saved);
          setCurrentUser(u);
          setLoading(false);
          return true;
        } catch (e) {
          localStorage.removeItem('escola_user_session');
        }
      }
      return false;
    };

    if (checkLocalSession()) {
      refresh();
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await handleSession(firebaseUser);
      } else if (!localStorage.getItem('escola_user_session')) {
        setCurrentUser(null);
        setLoading(false);
      }
      await refresh();
    });

    const handleLocalAuthChange = () => {
      checkLocalSession();
      refresh();
    };

    window.addEventListener('local_auth_change', handleLocalAuthChange);

    return () => {
      unsubscribe();
      window.removeEventListener('local_auth_change', handleLocalAuthChange);
    };
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === 'school_admin' && (activeWorkspace === 'selection' || activeWorkspace === 'dashboard')) {
      setActiveWorkspace('validation');
    }
  }, [currentUser, activeWorkspace]);

  useEffect(() => {
    if (!currentUser) return;
    const handler = (e: Event) => {
      const notif = (e as CustomEvent).detail as Notification;
      refresh();
      const isForAdmin  = notif.recipientRole === 'admin' && currentUser.role === 'admin';
      const isForSchool = notif.recipientSchoolId === currentUser.schoolId && currentUser.role === 'school_admin';
      if (isForAdmin || isForSchool) {
        const id = notif.id;
        setToasts((p) => [notif, ...p]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
      }
    };
    window.addEventListener('new_notification', handler);
    return () => window.removeEventListener('new_notification', handler);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const fetchLists = async () => {
        try {
          const [c, m, n] = await Promise.all([
            mockDb.getCandidates(),
            mockDb.getModuleProgress(),
            mockDb.getNotifications()
          ]);
          setCandidates(c);
          setModules(m);
          setNotifications(n);
        } catch (err) {
          console.error(err);
        }
      };
      fetchLists();
    }
  }, [currentUser]);

  const visibleNotifications = currentUser
    ? notifications.filter((n) =>
        currentUser.role === 'admin' ? n.recipientRole === 'admin' : n.recipientSchoolId === currentUser.schoolId
      )
    : [];

  const markAllRead = async () => {
    if (!currentUser) return;
    const updated = notifications.map((n) => {
      const belongs = currentUser.role === 'admin' ? n.recipientRole === 'admin' : n.recipientSchoolId === currentUser.schoolId;
      return belongs ? { ...n, isRead: true, readAt: new Date().toISOString() } : n;
    });
    await mockDb.setNotifications(updated);
    await refresh();
  };

  const handleApprove = async (id: string) => {
    if (!currentUser) return;
    const res = await stateMachine.validateCandidate(id, true, currentUser);
    if (!res.success) alert(res.message);
    else await refresh();
  };

  const handleReject = async (id: string) => {
    if (!currentUser) return;
    const res = await stateMachine.validateCandidate(id, false, currentUser);
    if (!res.success) alert(res.message);
    else await refresh();
  };

  const checkCompletionAndSwitch = async (candidateId: string) => {
    const cands = await mockDb.getCandidates();
    const cand = cands.find((c) => c.id === candidateId);
    if (cand && cand.status === 'completed') {
      setActiveWorkspace('selection');
    }
  };

  const handleCompleteModule = async (candidateId: string, code: ModuleCode, date: string, cert: string, classSheets: string[], schoolId: string) => {
    if (!currentUser) return;
    const res = await stateMachine.completeModule(candidateId, code, date, schoolId, cert, classSheets, currentUser);
    if (!res.success) alert(res.message);
    else {
      await refresh();
      await checkCompletionAndSwitch(candidateId);
    }
  };

  const handleRejectModule = async (candidateId: string, code: ModuleCode, reason: string) => {
    if (!currentUser) return;
    const res = await stateMachine.rejectModule(candidateId, code, reason, currentUser);
    if (!res.success) alert(res.message);
    else await refresh();
  };

  const handleMoveKanban = async (id: string, status: SelectionStatus) => {
    if (!currentUser) return;
    if (status === 'in_selection') {
      const cand = candidates.find(c => c.id === id);
      if (!cand || (cand.gupyStatus !== 'gupy_min' && cand.gupyStatus !== 'gupy_pending')) {
        alert("Apenas candidatos marcados como 'Na Gupy e tem os mínimos' ou 'Pendente' podem avançar para a etapa de Processo Seletivo.");
        return;
      }
    }
    const res = await stateMachine.updateSelectionStatus(id, status, currentUser);
    if (!res.success) alert(res.message);
    else await refresh();
  };

  const handleResetCandidate = async (id: string) => {
    if (!currentUser) return;
    if (!confirm('Deseja realmente reiniciar o fluxo de treinamento deste candidato? Isso limpará todos os certificados atuais.')) return;
    const res = await stateMachine.resetCandidateWorkflow(id, currentUser);
    if (!res.success) alert(res.message);
    else await refresh();
  };

  const handleUpdateGupy = async (id: string, gupyStatus: GupyStatus) => {
    if (!currentUser) return;
    const res = await stateMachine.updateGupyStatus(id, gupyStatus, currentUser);
    if (!res.success) alert(res.message);
    else await refresh();
  };

  const handleCreateCandidate = async (re: string, name: string, anac: string) => {
    if (!currentUser || !currentUser.schoolId) return;
    const res = await stateMachine.createCandidate(re, name, anac, currentUser.schoolId, currentUser);
    if (!res.success) alert(res.message);
    else { setShowAddModal(false); await refresh(); }
  };

  const handleCreateAdmin = async (userId: string) => {
    try {
      const users = await mockDb.getUsers();
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
        targetUser.role = 'admin';
        targetUser.schoolId = undefined;
        await mockDb.setUsers(users);
      }
      await setDoc(doc(db, 'users', userId), {
        role: 'admin',
        school_id: null
      }, { merge: true });
      await refresh();
      alert('Usuário promovido a Administrador Geral com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao promover usuário: ${err.message}`);
    }
  };

  const handleAdminEditModule = async (
    candidateId: string,
    code: ModuleCode,
    status: ModuleStatus,
    date?: string,
    cert?: string,
    classSheets?: string[],
    schoolId?: string
  ) => {
    if (!currentUser) return;
    const res = await stateMachine.adminEditModule(candidateId, code, status, date, schoolId, cert, classSheets, currentUser);
    if (!res.success) alert(res.message);
    else {
      await refresh();
      await checkCompletionAndSwitch(candidateId);
    }
  };

  const handleChangePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser) return false;
    const res = await stateMachine.changePassword(oldPass, newPass, currentUser);
    if (!res.success) {
      return false;
    }
    await refresh();
    const updatedUsers = await mockDb.getUsers();
    const updated = updatedUsers.find((u) => u.id === currentUser.id);
    if (updated) {
      setCurrentUser(updated);
    }
    return true;
  };

  const handleLogout = async () => {
    localStorage.removeItem('escola_user_session');
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    setActiveWorkspace('validation');
  };



  const pendingCount = currentUser
    ? candidates.filter((c) => {
        const matchesRole = currentUser.role === 'admin' || c.schoolId === currentUser.schoolId;
        return matchesRole && c.status === 'pending_validation';
      }).length
    : 0;

  const completedCount = currentUser
    ? candidates.filter((c) => {
        const matchesRole = currentUser.role === 'admin' || c.schoolId === currentUser.schoolId;
        return matchesRole && c.status === 'completed';
      }).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darkest flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Conectando ao banco de dados...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  if (currentUser.role === 'school_admin' && !currentUser.schoolId) {
    const handleSelfApprove = async () => {
      const schoolName = `Escola - ${currentUser.name}`;
      const schoolId = `sch-${Math.random().toString(36).substring(2, 9)}`;
      const newSchool: School = {
        id: schoolId,
        name: schoolName,
        active: true,
        contactName: currentUser.name,
        email: currentUser.email,
        phone: '(11) 99999-9999'
      };
      const schoolsList = await mockDb.getSchools();
      await mockDb.setSchools([...schoolsList, newSchool]);

      const updatedUser: User = {
        ...currentUser,
        schoolId: schoolId
      };
      const usersList = await mockDb.getUsers();
      const updatedUsers = usersList.map(u => u.id === currentUser.id ? updatedUser : u);
      await mockDb.setUsers(updatedUsers);

      try {
        await updateDoc(doc(db, 'users', currentUser.id), { school_id: schoolId });
      } catch (e) {}

      localStorage.setItem('escola_user_session', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      await refresh();
    };

    return (
      <div className="min-h-screen bg-brand-darkest flex items-center justify-center p-4 relative overflow-hidden text-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="w-full max-w-md bg-brand-dark/40 backdrop-blur-md border border-brand-medium/30 rounded-3xl shadow-2xl p-8 flex flex-col gap-5 relative z-10 items-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-100">Acesso Pendente de Vinculação</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sua conta <strong>{currentUser.email}</strong> foi cadastrada! Você pode aguardar o administrador vincular sua escola ou ativar seu acesso agora.
          </p>

          <button
            onClick={handleSelfApprove}
            className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg shadow-sky-500/20 cursor-pointer active:scale-[0.99]"
          >
            Liberar Acesso & Ativar Minha Escola
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-brand-medium/40 hover:bg-brand-medium text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darkest flex">
      <NavigationSidebar
        active={activeWorkspace}
        onNavigate={setActiveWorkspace}
        currentUser={currentUser}
        notifications={visibleNotifications}
        onMarkAllRead={markAllRead}
        pendingCount={pendingCount}
        completedCount={completedCount}
        onLogout={handleLogout}
      />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-brand-darkest/90 backdrop-blur-md border-b border-brand-medium/30 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <span className="text-slate-600">Escola Recomendada</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300 font-medium">
              {activeWorkspace === 'dashboard' ? 'Dashboard' : activeWorkspace === 'validation' ? 'Validação' : activeWorkspace === 'training' ? 'Treinamento' : activeWorkspace === 'selection' ? 'Processo Seletivo' : currentUser.role === 'admin' ? 'Escolas Parceiras' : 'Configurações'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {currentUser.role === 'school_admin' && activeWorkspace === 'validation' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-sky-500/20 transition"
              >
                <Plus className="w-4 h-4" /> Novo Candidato
              </button>
            )}
            <button
              onClick={async () => { await mockDb.resetDatabase(); await refresh(); }}
              title="Resetar banco de dados simulado"
              className="p-2 rounded-xl bg-brand-dark hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-brand-medium/40 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          {activeWorkspace === 'dashboard' && currentUser.role === 'admin' && (
            <DashboardWorkspace
              candidates={candidates}
              modules={modules}
              schools={schools}
            />
          )}
          {activeWorkspace === 'validation' && (
            <ValidationWorkspace
              candidates={candidates}
              currentUser={currentUser}
              onApprove={handleApprove}
              onReject={handleReject}
              schools={schools}
            />
          )}
          {activeWorkspace === 'training' && (
            <TrainingWorkspace
              candidates={candidates}
              modules={modules}
              schools={schools}
              currentUser={currentUser}
              onCompleteModule={handleCompleteModule}
              onAdminEditModule={handleAdminEditModule}
              onRejectModule={handleRejectModule}
            />
          )}
          {activeWorkspace === 'selection' && (
            <SelectionWorkspace
              candidates={candidates}
              modules={modules}
              currentUser={currentUser}
              onMove={handleMoveKanban}
              onUpdateGupy={handleUpdateGupy}
              schools={schools}
              onResetCandidate={handleResetCandidate}
            />
          )}
          {activeWorkspace === 'config' && (
            currentUser.role === 'admin' ? (
              <PartnerSchoolsWorkspace
                schools={schools}
                users={users}
                currentUser={currentUser}
                onRefresh={refresh}
                onAddAdmin={handleCreateAdmin}
              />
            ) : (
              <SchoolSettingsWorkspace
                onChangePassword={handleChangePassword}
              />
            )
          )}
        </main>

        <footer className="border-t border-brand-medium/30 px-8 py-4 flex items-center justify-between text-[11px] text-slate-600">
          <span>Sistema de Gestão — Escola Recomendada</span>
          <span className="flex items-center gap-2">
            <span>Perfil: <strong className="text-slate-500">{currentUser.name.split(' ')[0]}</strong></span>
            <span className={"px-1.5 py-0.5 rounded text-[9px] font-bold " + (currentUser.role === 'admin' ? "bg-brand-gold/15 text-brand-gold" : "bg-sky-500/15 text-sky-400")}>
              {currentUser.role === 'admin' ? 'ADMIN' : 'ESCOLA'}
            </span>
          </span>
        </footer>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      {showAddModal && (
        <AddCandidateModal onSubmit={handleCreateCandidate} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
