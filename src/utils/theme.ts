// ============================================================
// VEGTRACK — Design Tokens
// Tema: Industrial/Utilitário — uso em campo sob sol forte
// ============================================================

export const Colors = {
  // Primário — Verde operacional
  primary: '#15803d',
  primaryLight: '#dcfce7',
  primaryDark: '#14532d',

  // Superfícies
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',

  // Severidade ARTESP
  nivel1: '#16a34a',
  nivel1Bg: '#dcfce7',
  nivel2: '#d97706',
  nivel2Bg: '#fef3c7',
  nivel3: '#dc2626',
  nivel3Bg: '#fee2e2',

  // Status OS
  pendente: '#2563eb',
  pendenteBg: '#dbeafe',
  emExecucao: '#7c3aed',
  emExecucaoBg: '#ede9fe',
  concluida: '#16a34a',
  concluidaBg: '#dcfce7',
  bloqueada: '#dc2626',
  bloqueadaBg: '#fee2e2',

  // Alerta ambiental
  alertaAmbiental: '#b45309',
  alertaAmbientalBg: '#fef3c7',
  alertaAmbientalBorder: '#d97706',

  // Texto
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',

  // Utilitários
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.5)',
};

export const Typography = {
  // Usamos fonte system para performance em campo
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'monospace',
  },

  size: {
    xs: 11,
    sm: 13,
    base: 16,  // mínimo RNF006
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 28,
    display: 34,
  },

  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Área de toque mínima — RNF006: 48x48dp
export const MIN_TOUCH = 48;
// Altura mínima botão primário — RNF006: 56dp
export const MIN_BUTTON_HEIGHT = 56;
