import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow, MIN_TOUCH, MIN_BUTTON_HEIGHT } from '../utils/theme';
import { SeverityLevel, OSStatus } from '../utils/mockData';
import { nivelColor, nivelLabel } from '../store/AppContext';

// ─── BADGE DE NÍVEL ARTESP ──────────────────────────────────
export function NivelBadge({ nivel, size = 'md' }: { nivel: SeverityLevel; size?: 'sm' | 'md' }) {
  const bgColor = nivel === 1 ? Colors.nivel1Bg : nivel === 2 ? Colors.nivel2Bg : Colors.nivel3Bg;
  const textColor = nivelColor(nivel);
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, isSmall && styles.badgeSm]}>
      <View style={[styles.badgeDot, { backgroundColor: textColor }]} />
      <Text style={[styles.badgeText, { color: textColor }, isSmall && styles.badgeTextSm]}>
        {isSmall ? `N${nivel}` : nivelLabel(nivel)}
      </Text>
    </View>
  );
}

// ─── BADGE DE STATUS OS ──────────────────────────────────────
const statusConfig: Record<OSStatus, { label: string; bg: string; color: string }> = {
  pendente: { label: 'Pendente', bg: Colors.pendenteBg, color: Colors.pendente },
  em_execucao: { label: 'Em Execução', bg: Colors.emExecucaoBg, color: Colors.emExecucao },
  concluida: { label: 'Concluída', bg: Colors.concluidaBg, color: Colors.concluida },
  bloqueada: { label: 'Bloqueada', bg: Colors.bloqueadaBg, color: Colors.bloqueada },
};

export function StatusBadge({ status }: { status: OSStatus }) {
  const cfg = statusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ─── CARD BASE ───────────────────────────────────────────────
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.75}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── BOTÃO PRIMÁRIO ──────────────────────────────────────────
export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'default',
  icon,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'warning' | 'outline';
  icon?: React.ReactNode;
}) {
  const bgColor =
    variant === 'danger' ? Colors.nivel3 :
    variant === 'warning' ? Colors.nivel2 :
    variant === 'outline' ? 'transparent' :
    Colors.primary;
  const borderColor = variant === 'outline' ? Colors.primary : 'transparent';
  const txtColor = variant === 'outline' ? Colors.primary : Colors.white;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor, borderColor, borderWidth: variant === 'outline' ? 1.5 : 0 },
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : (
        <>
          {icon && <View style={styles.buttonIcon}>{icon}</View>}
          <Text style={[styles.buttonText, { color: txtColor }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── ALERTA AMBIENTAL ────────────────────────────────────────
export function AlertaAmbiental({ especie }: { especie: string }) {
  return (
    <View style={styles.alertaAmbiental}>
      <Text style={styles.alertaIcon}>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.alertaTitle}>ALERTA AMBIENTAL CRÍTICO</Text>
        <Text style={styles.alertaText}>
          Período reprodutivo ativo:{' '}
          <Text style={styles.alertaSpecies}>{especie}</Text>
        </Text>
        <Text style={styles.alertaSubtext}>Roçada mecanizada bloqueada. Somente intervenção manual seletiva.</Text>
      </View>
    </View>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────
export function StatCard({
  value,
  label,
  color,
  bgColor,
}: {
  value: number | string;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── DIVIDER ────────────────────────────────────────────────
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

// ─── EMPTY STATE ────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── SECTION HEADER ─────────────────────────────────────────
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── ESTILOS ────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: BorderRadius.full, alignSelf: 'flex-start',
  },
  badgeSm: { paddingHorizontal: 6, paddingVertical: 2 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: {
    fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold,
    letterSpacing: 0.2,
  },
  badgeTextSm: { fontSize: Typography.size.xs },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadow.md,
  },

  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm,
    height: MIN_BUTTON_HEIGHT,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonIcon: { marginRight: 2 },
  buttonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.3,
  },

  alertaAmbiental: {
    flexDirection: 'row', gap: Spacing.md,
    backgroundColor: Colors.alertaAmbientalBg,
    borderWidth: 1.5, borderColor: Colors.alertaAmbientalBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
  },
  alertaIcon: { fontSize: 22, marginTop: 2 },
  alertaTitle: {
    fontSize: Typography.size.sm, fontWeight: Typography.weight.extrabold,
    color: Colors.alertaAmbiental, letterSpacing: 0.5,
  },
  alertaText: {
    fontSize: Typography.size.sm, color: Colors.alertaAmbiental,
    marginTop: 2,
  },
  alertaSpecies: { fontStyle: 'italic', fontWeight: Typography.weight.bold },
  alertaSubtext: {
    fontSize: Typography.size.xs, color: Colors.alertaAmbiental,
    marginTop: 4, opacity: 0.85,
  },

  statCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
    minHeight: 72,
  },
  statValue: {
    fontSize: Typography.size.xxl, fontWeight: Typography.weight.extrabold,
  },
  statLabel: {
    fontSize: Typography.size.xs, fontWeight: Typography.weight.medium,
    textAlign: 'center', marginTop: 2, opacity: 0.8,
  },

  divider: {
    height: 1, backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  emptyState: {
    alignItems: 'center', paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: { fontSize: 44, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Typography.size.md, fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary, textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.size.base, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.sm,
  },

  sectionHeader: { marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: Typography.size.lg, fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 2,
  },
});
