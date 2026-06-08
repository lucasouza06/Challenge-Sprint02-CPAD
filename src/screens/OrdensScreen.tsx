import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, StatusBar,
} from 'react-native';
import { useAppStore, formatarData, formatarDataHora } from '../store/AppContext';
import { NivelBadge, StatusBadge, Card, PrimaryButton, AlertaAmbiental, Divider, EmptyState } from '../components/index';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../utils/theme';
import { OrdemServico } from '../utils/mockData';

// ─── CARD DE OS ─────────────────────────────────────────────
function OSCard({
  os,
  onIniciar,
  onConcluir,
}: {
  os: OrdemServico;
  onIniciar: () => void;
  onConcluir: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const urgenciaColor =
    os.urgencia === 'critica' ? Colors.nivel3 :
    os.urgencia === 'urgente' ? Colors.nivel2 : Colors.textMuted;

  const metodoIcon = os.metodo === 'mecanizada' ? '🚜' : '✂️';
  const metodoLabel = os.metodo === 'mecanizada' ? 'Roçada Mecanizada' : 'Roçada Manual Seletiva';

  return (
    <View style={[styles.osCard, os.status === 'bloqueada' && styles.osCardBloqueada]}>
      {/* HEADER */}
      <TouchableOpacity style={styles.osHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <View style={styles.osHeaderLeft}>
          <View style={styles.osNumeroRow}>
            <Text style={styles.osNumero}>{os.numero}</Text>
            {os.urgencia === 'critica' && (
              <View style={styles.urgenciaBadge}>
                <Text style={styles.urgenciaText}>CRÍTICO</Text>
              </View>
            )}
          </View>
          <Text style={styles.osKm}>
            KM {os.kmInicial.toFixed(1)}–{os.kmFinal.toFixed(1)} · {os.faixa}
          </Text>
        </View>
        <View style={styles.osHeaderRight}>
          <StatusBadge status={os.status} />
          <Text style={styles.osExpand}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* MÉTODO */}
      <View style={styles.osMetodo}>
        <Text style={styles.osMetodoIcon}>{metodoIcon}</Text>
        <Text style={styles.osMetodoText}>{metodoLabel}</Text>
        <View style={[styles.prazoBadge, { borderColor: urgenciaColor }]}>
          <Text style={[styles.prazoText, { color: urgenciaColor }]}>
            ⏱ {os.prazoHoras}h
          </Text>
        </View>
      </View>

      {/* ALERTA AMBIENTAL se bloqueada */}
      {os.status === 'bloqueada' && os.motivaBloqueio && (
        <View style={styles.osBloqueioAlert}>
          <Text style={styles.osBloqueioText}>🔒 {os.motivaBloqueio}</Text>
        </View>
      )}

      {/* DETALHES EXPANDIDOS */}
      {expanded && (
        <View style={styles.osDetalhes}>
          <Divider />
          {os.equipeResponsavel && (
            <View style={styles.osDetalheRow}>
              <Text style={styles.osDetalheLabel}>Equipe</Text>
              <Text style={styles.osDetalheValue}>{os.equipeResponsavel}</Text>
            </View>
          )}
          <View style={styles.osDetalheRow}>
            <Text style={styles.osDetalheLabel}>Emitida em</Text>
            <Text style={styles.osDetalheValue}>{formatarDataHora(os.criadaEm)}</Text>
          </View>
          {os.observacoes && (
            <View style={styles.osObservacoes}>
              <Text style={styles.osDetalheLabel}>Observações</Text>
              <Text style={styles.osObsText}>{os.observacoes}</Text>
            </View>
          )}

          {/* AÇÕES */}
          {os.status === 'pendente' && (
            <View style={styles.osActions}>
              <PrimaryButton
                label="Iniciar Execução"
                onPress={onIniciar}
                variant="default"
              />
            </View>
          )}
          {os.status === 'em_execucao' && (
            <View style={styles.osActions}>
              <PrimaryButton
                label="Registrar Conclusão"
                onPress={onConcluir}
                variant="default"
              />
            </View>
          )}
          {os.status === 'bloqueada' && (
            <View style={styles.osActions}>
              <PrimaryButton
                label="Iniciar Roçada Manual"
                onPress={onIniciar}
                variant="warning"
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── SCREEN ─────────────────────────────────────────────────
export default function OrdensScreen({ navigation }: { navigation: any }) {
  const { state, dispatch } = useAppStore();
  const { ordens, filtroStatusOS, dashboardStats } = state;

  const filtradas = filtroStatusOS === 'todos'
    ? ordens
    : ordens.filter(o => o.status === filtroStatusOS);

  const handleIniciar = (os: OrdemServico) => {
    Alert.alert(
      'Iniciar Ordem de Serviço',
      `Confirmar início da ${os.numero}?\n\nEquipe: ${os.equipeResponsavel || 'Não atribuída'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: () => dispatch({ type: 'ATUALIZAR_STATUS_OS', osId: os.id, status: 'em_execucao' }),
        },
      ]
    );
  };

  const handleConcluir = (os: OrdemServico) => {
    Alert.alert(
      'Registrar Conclusão',
      `Confirmar conclusão da ${os.numero}?\n\nIsso gerará o registro de conformidade para a ARTESP.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluir',
          style: 'default',
          onPress: () => dispatch({ type: 'ATUALIZAR_STATUS_OS', osId: os.id, status: 'concluida' }),
        },
      ]
    );
  };

  const filtros: { key: typeof filtroStatusOS; label: string }[] = [
    { key: 'todos', label: 'Todas' },
    { key: 'pendente', label: 'Pendentes' },
    { key: 'em_execucao', label: 'Em Execução' },
    { key: 'bloqueada', label: 'Bloqueadas' },
    { key: 'concluida', label: 'Concluídas' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ordens de Serviço</Text>
          <Text style={styles.headerSub}>
            {dashboardStats.osAbertas} abertas · {dashboardStats.osUrgentes} urgentes
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newOSBtn}
          onPress={() => navigation.navigate('NovoLevantamento', {})}
        >
          <Text style={styles.newOSIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* FILTROS */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filtroBar}
        contentContainerStyle={styles.filtroContent}
      >
        {filtros.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filtroChip,
              filtroStatusOS === f.key && styles.filtroChipActive,
            ]}
            onPress={() => dispatch({ type: 'SET_FILTRO_OS', filtro: f.key })}
          >
            <Text style={[
              styles.filtroText,
              filtroStatusOS === f.key && styles.filtroTextActive,
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {filtradas.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nenhuma OS encontrada"
            subtitle="Não há ordens de serviço para o filtro selecionado."
          />
        ) : (
          filtradas.map(os => (
            <OSCard
              key={os.id}
              os={os}
              onIniciar={() => handleIniciar(os)}
              onConcluir={() => handleConcluir(os)}
            />
          ))
        )}
        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.base,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.extrabold, color: Colors.textPrimary },
  headerSub: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 2 },
  newOSBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  newOSIcon: { fontSize: 24, color: Colors.white, fontWeight: Typography.weight.bold, marginTop: -2 },

  filtroBar: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    maxHeight: 52,
  },
  filtroContent: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filtroChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  filtroChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filtroText: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  filtroTextActive: { color: Colors.primary, fontWeight: Typography.weight.bold },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: Spacing.sm },

  osCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  osCardBloqueada: {
    borderColor: Colors.alertaAmbientalBorder, borderWidth: 1.5,
  },
  osHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: Spacing.md, paddingBottom: Spacing.sm,
  },
  osHeaderLeft: { flex: 1 },
  osNumeroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  osNumero: {
    fontSize: Typography.size.base, fontWeight: Typography.weight.bold,
    color: Colors.textPrimary, fontFamily: 'monospace',
  },
  urgenciaBadge: {
    backgroundColor: Colors.nivel3Bg, borderRadius: BorderRadius.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  urgenciaText: {
    fontSize: 9, fontWeight: Typography.weight.extrabold,
    color: Colors.nivel3, letterSpacing: 0.5,
  },
  osKm: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 3 },
  osHeaderRight: { alignItems: 'flex-end', gap: Spacing.sm },
  osExpand: { fontSize: 10, color: Colors.textMuted },

  osMetodo: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  osMetodoIcon: { fontSize: 18 },
  osMetodoText: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.medium, flex: 1 },
  prazoBadge: {
    borderWidth: 1, borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  prazoText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },

  osBloqueioAlert: {
    backgroundColor: Colors.alertaAmbientalBg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.alertaAmbientalBorder,
  },
  osBloqueioText: { fontSize: Typography.size.xs, color: Colors.alertaAmbiental, lineHeight: 18 },

  osDetalhes: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  osDetalheRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  osDetalheLabel: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    fontWeight: Typography.weight.medium, flex: 1,
  },
  osDetalheValue: {
    fontSize: Typography.size.sm, color: Colors.textPrimary,
    fontWeight: Typography.weight.semibold, flex: 2, textAlign: 'right',
  },
  osObservacoes: { marginTop: Spacing.sm },
  osObsText: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    marginTop: 4, lineHeight: 20,
  },
  osActions: { marginTop: Spacing.md },
});
