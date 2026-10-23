import * as XLSX from 'xlsx';
import type { Candidate, CandidateModuleProgress, School, User, GupyStatus, SelectionStatus } from '../db/mockDb';

const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  }
  if (iso.includes('T00:00:00')) {
    const datePart = iso.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
};

const getQuarantineText = (selectionStatus: SelectionStatus, rejectedAtStr?: string): string => {
  if (selectionStatus !== 'rejected') return '—';
  if (!rejectedAtStr) return 'Quarentena: Não informada';

  const rejectedAt = new Date(rejectedAtStr);
  const now = new Date();
  const unlockDate = new Date(rejectedAt);
  unlockDate.setMonth(unlockDate.getMonth() + 6);

  const diffMs = unlockDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return 'Quarentena Concluída';
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;

  let remaining = '';
  if (months > 0) remaining += `${months} ${months === 1 ? 'mês' : 'meses'}`;
  if (days > 0) {
    if (remaining) remaining += ' e ';
    remaining += `${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  return `Ativa (${remaining})`;
};

const getGupyLabel = (status?: GupyStatus): string => {
  switch (status) {
    case 'gupy_min':
      return 'Na Gupy e tem os mínimos';
    case 'gupy_no_min':
      return 'Na Gupy e NÃO tem os mínimos';
    case 'not_gupy':
      return 'Não está na Gupy';
    case 'gupy_pending':
      return 'Pendente';
    default:
      return 'Não informado';
  }
};

const getSelectionStatusLabel = (status: SelectionStatus): string => {
  switch (status) {
    case 'finalized':
      return 'Finalizou';
    case 'in_selection':
      return 'Processo Seletivo';
    case 'hired':
      return 'Contratado';
    case 'rejected':
      return 'Reprovado';
    default:
      return status;
  }
};

const getModuleStatusLabel = (mod?: CandidateModuleProgress): string => {
  if (!mod || mod.status === 'pending') return 'Pendente';
  if (mod.status === 'waiting_admin') return 'Aguardando Aprovação';
  if (mod.status === 'completed') return 'Concluído';
  return 'Pendente';
};

const getTodayFilenameSuffix = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function exportTrainingToExcel(
  candidates: Candidate[],
  modules: CandidateModuleProgress[],
  schools: School[],
  currentUser: User
) {
  // Filtra por permissão de acesso (admin vê todos, escola vê apenas seus alunos)
  // Conforme solicitação do usuário: sempre todos os candidatos da aba (sem aplicar o filtro de texto da tela)
  const allowed = candidates.filter((c) => {
    const matchesRole = currentUser.role === 'admin' || c.schoolId === currentUser.schoolId;
    return matchesRole && (c.status === 'in_progress' || c.status === 'completed');
  });

  // Ordenação alfabética pelo nome
  const sorted = [...allowed].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const data = sorted.map((c) => {
    const school = schools.find((s) => s.id === c.schoolId);
    const candidateMods = modules.filter((m) => m.candidateId === c.id);

    const doneCount = candidateMods.filter((m) => m.status === 'completed').length;
    const pct = Math.round((doneCount / 3) * 100);

    const modTeorico = candidateMods.find((m) => m.moduleCode === 'TEORICO');
    const modSimulador = candidateMods.find((m) => m.moduleCode === 'SIMULADOR');
    const modVoo = candidateMods.find((m) => m.moduleCode === 'VOO');

    return {
      'Nome do Candidato': c.name,
      'RE': c.re,
      'CANAC': c.anac,
      'Escola Parceira': school?.name || '—',
      'Status Geral': c.status === 'completed' ? 'Concluído' : 'Em Andamento',
      'Progresso': `${pct}%`,
      'Teórico - Status': getModuleStatusLabel(modTeorico),
      'Teórico - Conclusão': formatDate(modTeorico?.completionDate),
      'Simulador - Status': getModuleStatusLabel(modSimulador),
      'Simulador - Conclusão': formatDate(modSimulador?.completionDate),
      'Voo - Status': getModuleStatusLabel(modVoo),
      'Voo - Conclusão': formatDate(modVoo?.completionDate),
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 32 }, // Nome
    { wch: 12 }, // RE
    { wch: 14 }, // CANAC
    { wch: 28 }, // Escola
    { wch: 16 }, // Status Geral
    { wch: 12 }, // Progresso
    { wch: 22 }, // Teórico - Status
    { wch: 20 }, // Teórico - Conclusão
    { wch: 22 }, // Simulador - Status
    { wch: 20 }, // Simulador - Conclusão
    { wch: 22 }, // Voo - Status
    { wch: 20 }, // Voo - Conclusão
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Treinamento');
  XLSX.writeFile(wb, `Relatorio_Treinamento_${getTodayFilenameSuffix()}.xlsx`);
}

export function exportSelectionToExcel(
  candidates: Candidate[],
  modules: CandidateModuleProgress[],
  schools: School[],
  currentUser: User
) {
  // Filtra por permissão de acesso e status de formação concluída
  // Conforme solicitação do usuário: sempre todos os candidatos da aba (sem aplicar o filtro de texto ou escola da tela)
  const allowed = candidates.filter((c) => {
    const matchesRole = currentUser.role === 'admin' || c.schoolId === currentUser.schoolId;
    return matchesRole && c.status === 'completed';
  });

  const sorted = [...allowed].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const data = sorted.map((c) => {
    const school = schools.find((s) => s.id === c.schoolId);
    const candidateMods = modules.filter((m) => m.candidateId === c.id && m.status === 'completed');
    const lastMod = [...candidateMods].sort(
      (a, b) => new Date(b.uploadedAt || b.completionDate || '').getTime() - new Date(a.uploadedAt || a.completionDate || '').getTime()
    )[0];

    return {
      'Nome do Candidato': c.name,
      'RE': c.re,
      'CANAC': c.anac,
      'Escola Parceira': school?.name || '—',
      'Etapa do Processo': getSelectionStatusLabel(c.selectionStatus),
      'Status na Gupy': getGupyLabel(c.gupyStatus),
      'Conclusão do Treinamento': formatDate(lastMod?.uploadedAt || lastMod?.completionDate || c.updatedAt),
      'Situação da Quarentena': getQuarantineText(c.selectionStatus, c.rejectedAt),
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 32 }, // Nome
    { wch: 12 }, // RE
    { wch: 14 }, // CANAC
    { wch: 28 }, // Escola
    { wch: 20 }, // Etapa do Processo
    { wch: 28 }, // Status na Gupy
    { wch: 26 }, // Conclusão do Treinamento
    { wch: 25 }, // Situação da Quarentena
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Processo Seletivo');
  XLSX.writeFile(wb, `Relatorio_Processo_Seletivo_${getTodayFilenameSuffix()}.xlsx`);
}
