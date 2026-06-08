import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, RefreshControl, StatusBar,
} from 'react-native';
import { useAppStore, nivelColor, formatarDataHora } from '../store/AppContext';
import {
  NivelBadge, StatCard, Card, AlertaAmbiental, Divider, SectionHeader,
} from '../components/index';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../utils/theme';
import { Trecho } from '../utils/mockData';

// ─── HEATMAP VISUAL (sem dependência de maps) ────────────────
function HeatmapStrip({ trechos }: { trechos: Trecho[] }) {
  // Representa os trechos como faixas coloridas horizontais
  return (
    <View>
      <View style={styles.heatmapLegenda}>
        <Text style={styles.heatmapKmLabel}>KM {Math.min(...trechos.map(t => t.kmInicial))}</Text>
        <Text style={styles.heatmapTitle}>SP-021 — Trecho Sob Gestão</Text>
        <Text style={styles.heatmapKmLabel}>KM {Math.max(...trechos.map(t => t.kmFinal))}</Text>
      </View>
      <View style={styles.heatmapContainer}>
        {trechos.map((t, i) => (
          <View
            key={t.id}
            style={[
              styles.heatmapSegment,
              {
                backgroundColor: nivelColor(t.nivelArtesp) + (t.nivelArtesp === 3 ? 'FF' : 'AA'),
                flex: 1,
              },
            ]}
          />
        ))}
      </View>
      {/* Marcadores dos trechos críticos */}
      <View style={styles.heatmapMarkers}>
        {trechos
          .filter(t => t.nivelArtesp === 3)
          .map(t => (
            <View key={t.id} style={styles.criticalMarker}>
              <View style={styles.criticalPin} />
              <Text style={styles.criticalKm}>KM {t.kmInicial}</Text>
            </View>
          ))}
      </View>
    </View>
  );
}

// ─── CARD DE TRECHO ──────────────────────────────────────────
function TrechoCard({ trecho, onPress }: { trecho: Trecho; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.trechoCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.trechoHeader}>
        <View style={[styles.trechoColorBar, { backgroundColor: nivelColor(trecho.nivelArtesp) }]} />
        <View style={styles.trechoInfo}>
          <Text style={styles.trechoKm}>
            KM {trecho.kmInicial.toFixed(1)} — {trecho.kmFinal.toFixed(1)}
          </Text>
          <Text style={styles.trechoFaixa}>{trecho.faixa}</Text>
        </View>
        <View style={styles.trechoRight}>
          <NivelBadge nivel={trecho.nivelArtesp} size="sm" />
          <Text style={styles.trechoAltura}>{trecho.alturaVegetacaoCm}cm</Text>
        </View>
      </View>
      {trecho.restricaoAmbiental && (
        <View style={styles.trechoAlert}>
          <Text style={styles.trechoAlertText}>
            ⚠️ Restrição ambiental: {trecho.especieEmRestricao}
          </Text>
        </View>
      )}
      <View style={styles.trechoFooter}>
        <Text style={styles.trechoMeta}>
          Último levantamento: {formatarDataHora(trecho.ultimoLevantamento)}
        </Text>
        <Text style={[styles.trechoDias, trecho.diasSemRocada > 30 && styles.trechoDiasAlert]}>
          {trecho.diasSemRocada}d sem roçada
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── SCREEN PRINCIPAL ────────────────────────────────────────
export default function DashboardScreen({ navigation }: { navigation: any }) {
  const { state } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filtroNivel, setFiltroNivel] = useState<0 | 1 | 2 | 3>(0);
  const { dashboardStats, trechos } = state;

  const trechosFiltrados = filtroNivel === 0
    ? trechos
    : trechos.filter(t => t.nivelArtesp === filtroNivel);

  const trechosCriticos = trechos.filter(t => t.nivelArtesp === 3);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Olá, {state.user.apelido} 👋</Text>
          <Text style={styles.headerSub}>
            {state.user.rodovia} · KM {state.user.trechoGerenciado.kmInicial}–{state.user.trechoGerenciado.kmFinal}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerBell}
          onPress={() => navigation.navigate('Fauna')}
        >
          <Text style={styles.headerBellIcon}>🔔</Text>
          {dashboardStats.restricoesAtivas > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{dashboardStats.restricoesAtivas}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* ALERTAS CRÍTICOS */}
        {trechosCriticos.some(t => t.restricaoAmbiental) && (
          <View style={styles.section}>
            {trechosCriticos
              .filter(t => t.restricaoAmbiental)
              .map(t => (
                <AlertaAmbiental key={t.id} especie={t.especieEmRestricao!} />
              ))}
          </View>
        )}

        {/* STATS GRID */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <StatCard
              value={dashboardStats.nivel3Critico}
              label="Críticos N3"
              color={Colors.nivel3}
              bgColor={Colors.nivel3Bg}
            />
            <StatCard
              value={dashboardStats.nivel2Atencao}
              label="Atenção N2"
              color={Colors.nivel2}
              bgColor={Colors.nivel2Bg}
            />
            <StatCard
              value={dashboardStats.nivel1Ok}
              label="Conformes N1"
              color={Colors.nivel1}
              bgColor={Colors.nivel1Bg}
            />
          </View>
          <View style={[styles.statsRow, { marginTop: Spacing.sm }]}>
            <StatCard
              value={dashboardStats.osAbertas}
              label="OS Abertas"
              color={Colors.pendente}
              bgColor={Colors.pendenteBg}
            />
            <StatCard
              value={dashboardStats.osUrgentes}
              label="OS Urgentes"
              color={Colors.nivel3}
              bgColor={Colors.nivel3Bg}
            />
            <StatCard
              value={dashboardStats.restricoesAtivas}
              label="Restrições"
              color={Colors.alertaAmbiental}
              bgColor={Colors.alertaAmbientalBg}
            />
          </View>
        </View>

        {/* HEATMAP */}
        <View style={styles.section}>
          <SectionHeader
            title="Mapa de Calor — Vegetação"
            subtitle={`Atualizado: ${formatarDataHora(dashboardStats.ultimaAtualizacao)}`}
          />
          <Card>
            <HeatmapStrip trechos={trechos} />
            <View style={styles.heatmapLegendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.nivel1 }]} />
                <Text style={styles.legendText}>Nível 1 — OK</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.nivel2 }]} />
                <Text style={styles.legendText}>Nível 2 — Atenção</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.nivel3 }]} />
                <Text style={styles.legendText}>Nível 3 — Crítico</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* FILTRO DE TRECHOS */}
        <View style={styles.section}>
          <SectionHeader title="Trechos da Rodovia" subtitle={`${trechosFiltrados.length} trechos exibidos`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroScroll}>
            {([0, 3, 2, 1] as const).map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.filtroChip, filtroNivel === n && styles.filtroChipActive]}
                onPress={() => setFiltroNivel(n)}
              >
                <Text style={[styles.filtroText, filtroNivel === n && styles.filtroTextActive]}>
                  {n === 0 ? 'Todos' : n === 3 ? '🔴 Crítico' : n === 2 ? '🟡 Atenção' : '🟢 Conforme'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {trechosFiltrados.map(t => (
            <TrechoCard
              key={t.id}
              trecho={t}
              onPress={() => navigation.navigate('NovoLevantamento', { trechoId: t.id })}
            />
          ))}
        </View>

        {/* AÇÃO RÁPIDA */}
        <View style={[styles.section, { marginBottom: Spacing.xxxl }]}>
          <TouchableOpacity
            style={styles.fabCard}
            onPress={() => navigation.navigate('NovoLevantamento', {})}
            activeOpacity={0.8}
          >
            <Text style={styles.fabIcon}>📍</Text>
            <View>
              <Text style={styles.fabTitle}>Registrar Levantamento</Text>
              <Text style={styles.fabSub}>Cadastrar nova medição de vegetação em campo</Text>
            </View>
            <Text style={styles.fabArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.base,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerGreeting: {
    fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary,
  },
  headerSub: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 2 },
  headerBell: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  headerBellIcon: { fontSize: 20 },
  bellBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.nivel3,
    alignItems: 'center', justifyContent: 'center',
  },
  bellBadgeText: { color: Colors.white, fontSize: 9, fontWeight: Typography.weight.bold },

  section: { paddingHorizontal: Spacing.base, marginTop: Spacing.lg },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },

  heatmapContainer: {
    flexDirection: 'row', height: 28, borderRadius: BorderRadius.sm, overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  heatmapSegment: {},
  heatmapLegenda: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  heatmapTitle: {
    fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
  },
  heatmapKmLabel: { fontSize: Typography.size.xs, color: Colors.textMuted },
  heatmapMarkers: {
    flexDirection: 'row', marginTop: 6, gap: Spacing.sm, flexWrap: 'wrap',
  },
  criticalMarker: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  criticalPin: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.nivel3 },
  criticalKm: { fontSize: Typography.size.xs, color: Colors.nivel3, fontWeight: Typography.weight.semibold },
  heatmapLegendRow: {
    flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md, flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: Typography.size.xs, color: Colors.textSecondary },

  filtroScroll: { marginBottom: Spacing.md },
  filtroChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceElevated,
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  filtroChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filtroText: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  filtroTextActive: { color: Colors.primary, fontWeight: Typography.weight.bold },

  trechoCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm, overflow: 'hidden',
    ...Shadow.sm,
  },
  trechoHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  trechoColorBar: { width: 4, height: '100%', borderRadius: 2, marginRight: Spacing.md, position: 'absolute', left: 0, top: 0, bottom: 0 },
  trechoInfo: { flex: 1, marginLeft: 12 },
  trechoKm: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  trechoFaixa: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 2 },
  trechoRight: { alignItems: 'flex-end', gap: 4 },
  trechoAltura: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.textSecondary },
  trechoAlert: {
    backgroundColor: Colors.alertaAmbientalBg,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: Colors.alertaAmbientalBorder,
  },
  trechoAlertText: { fontSize: Typography.size.xs, color: Colors.alertaAmbiental, fontWeight: Typography.weight.medium },
  trechoFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  trechoMeta: { fontSize: Typography.size.xs, color: Colors.textMuted },
  trechoDias: { fontSize: Typography.size.xs, color: Colors.textMuted, fontWeight: Typography.weight.medium },
  trechoDiasAlert: { color: Colors.nivel3, fontWeight: Typography.weight.bold },

  fabCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    padding: Spacing.base, ...Shadow.lg,
  },
  fabIcon: { fontSize: 28 },
  fabTitle: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.white },
  fabSub: { fontSize: Typography.size.xs, color: Colors.white, opacity: 0.8, marginTop: 2 },
  fabArrow: { fontSize: 26, color: Colors.white, marginLeft: 'auto', opacity: 0.7 },
});
