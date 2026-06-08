import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  mockTrechos,
  mockOrdens,
  mockFauna,
  mockHistoricoLevantamentos,
  mockUser,
  mockDashboardStats,
  Trecho,
  OrdemServico,
  EspecieRestricao,
  Levantamento,
  SeverityLevel,
  FaixaDominio,
} from '../utils/mockData';

// ─── TIPOS DE ESTADO ────────────────────────────────────────
interface AppState {
  user: typeof mockUser;
  trechos: Trecho[];
  ordens: OrdemServico[];
  fauna: EspecieRestricao[];
  levantamentos: Levantamento[];
  dashboardStats: typeof mockDashboardStats;
  filtroStatusOS: 'todos' | 'pendente' | 'em_execucao' | 'concluida' | 'bloqueada';
  novaOSGerada: OrdemServico | null;
}

// ─── ACTIONS ────────────────────────────────────────────────
type Action =
  | { type: 'REGISTRAR_LEVANTAMENTO'; payload: Levantamento }
  | { type: 'ATUALIZAR_SEVERIDADE_TRECHO'; trechoId: string; novaAltura: number; novoNivel: SeverityLevel }
  | { type: 'GERAR_OS'; payload: OrdemServico }
  | { type: 'ATUALIZAR_STATUS_OS'; osId: string; status: OrdemServico['status'] }
  | { type: 'SET_FILTRO_OS'; filtro: AppState['filtroStatusOS'] }
  | { type: 'LIMPAR_NOVA_OS' };

// ─── REDUCER ────────────────────────────────────────────────
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REGISTRAR_LEVANTAMENTO': {
      const novoLev = action.payload;
      const trechosAtualizados = state.trechos.map(t =>
        t.id === novoLev.trechoId
          ? {
              ...t,
              alturaVegetacaoCm: novoLev.alturaVegetacaoCm,
              nivelArtesp: novoLev.nivelArtesp,
              ultimoLevantamento: novoLev.dataRegistro,
            }
          : t
      );
      return {
        ...state,
        levantamentos: [novoLev, ...state.levantamentos],
        trechos: trechosAtualizados,
        dashboardStats: calcularStats(trechosAtualizados, state.ordens),
      };
    }

    case 'GERAR_OS': {
      const novasOrdens = [action.payload, ...state.ordens];
      return {
        ...state,
        ordens: novasOrdens,
        novaOSGerada: action.payload,
        dashboardStats: calcularStats(state.trechos, novasOrdens),
      };
    }

    case 'ATUALIZAR_STATUS_OS': {
      const ordens = state.ordens.map(o =>
        o.id === action.osId ? { ...o, status: action.status } : o
      );
      return {
        ...state,
        ordens,
        dashboardStats: calcularStats(state.trechos, ordens),
      };
    }

    case 'SET_FILTRO_OS':
      return { ...state, filtroStatusOS: action.filtro };

    case 'LIMPAR_NOVA_OS':
      return { ...state, novaOSGerada: null };

    default:
      return state;
  }
}

function calcularStats(
  trechos: Trecho[],
  ordens: OrdemServico[]
): typeof mockDashboardStats {
  return {
    totalTrechos: trechos.length,
    nivel3Critico: trechos.filter(t => t.nivelArtesp === 3).length,
    nivel2Atencao: trechos.filter(t => t.nivelArtesp === 2).length,
    nivel1Ok: trechos.filter(t => t.nivelArtesp === 1).length,
    osAbertas: ordens.filter(o => o.status !== 'concluida').length,
    osUrgentes: ordens.filter(o => o.urgencia === 'critica' && o.status !== 'concluida').length,
    restricoesAtivas: trechos.filter(t => t.restricaoAmbiental).length,
    ultimaAtualizacao: new Date().toISOString(),
  };
}

// ─── INITIAL STATE ──────────────────────────────────────────
const initialState: AppState = {
  user: mockUser,
  trechos: mockTrechos,
  ordens: mockOrdens,
  fauna: mockFauna,
  levantamentos: mockHistoricoLevantamentos,
  dashboardStats: mockDashboardStats,
  filtroStatusOS: 'todos',
  novaOSGerada: null,
};

// ─── CONTEXT ────────────────────────────────────────────────
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}

// ─── HELPERS REUTILIZÁVEIS ──────────────────────────────────
export function calcularNivelArtesp(alturaCm: number): SeverityLevel {
  if (alturaCm < 15) return 1;
  if (alturaCm < 30) return 2;
  return 3;
}

export function nivelColor(nivel: SeverityLevel): string {
  if (nivel === 1) return '#16a34a';
  if (nivel === 2) return '#d97706';
  return '#dc2626';
}

export function nivelLabel(nivel: SeverityLevel): string {
  if (nivel === 1) return 'Nível 1 — Conforme';
  if (nivel === 2) return 'Nível 2 — Atenção';
  return 'Nível 3 — Crítico';
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
