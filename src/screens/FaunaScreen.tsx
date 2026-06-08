import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { useAppStore } from '../store/AppContext';
import { Card, Divider } from '../components/index';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../utils/theme';
import { EspecieRestricao } from '../utils/mockData';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MES_ATUAL = new Date().getMonth() + 1; // 1-12

function CalendarioEspecie({ especie }: { especie: EspecieRestricao }) {
  const [expanded, setExpanded] = useState(false);
  const isAtiva = MES_ATUAL >= especie.mesInicio && MES_ATUAL <= especie.mesFim;

  return (
    <TouchableOpacity
      style={[styles.especieCard, isAtiva && styles.especieCardAtiva]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.8}
    >
      <View style={styles.especieHeader}>
        <View style={styles.especieLeft}>
          <View style={[styles.statusDot, { backgroundColor: isAtiva ? Colors.nivel3 : Colors.nivel1 }]} />
          <View>
            <Text style={styles.especieNomePopular}>{especie.nomePopular}</Text>
            <Text style={styles.especieNomeCientifico}>{especie.nome}</Text>
          </View>
        </View>
        <View style={styles.especieRight}>
          {isAtiva ? (
            <View style={styles.ativaBadge}>
              <Text style={styles.ativaText}>ATIVA</Text>
            </View>
          ) : (
            <View style={styles.inativaBadge}>
              <Text style={styles.inativaText}>Inativa</Text>
            </View>
          )}
          <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </View>

      {/* BARRA DO CALENDÁRIO */}
      <View style={styles.calendarioBar}>
        {MESES.map((m, i) => {
          const mes = i + 1;
          const emRestricao = mes >= especie.mesInicio && mes <= especie.mesFim;
          const isHoje = mes === MES_ATUAL;
          return (
            <View key={m} style={styles.mesContainer}>
              <View
                style={[
                  styles.mesBarra,
                  { backgroundColor: emRestricao ? Colors.nivel3 : Colors.border },
                  isHoje && styles.mesHoje,
                ]}
              />
              <Text style={[styles.mesLabel, isHoje && styles.mesLabelHoje]}>{m}</Text>
            </View>
          );
        })}
      </View>

      {expanded && (
        <View style={styles.especieDetalhes}>
          <Divider />
          <View style={styles.detalheRow}>
            <Text style={styles.detalheIcon}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detalheLabel}>Período de Restrição</Text>
              <Text style={styles.detalheValue}>{especie.periodoRestricao}</Text>
            </View>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheIcon}>🚫</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detalheLabel}>Restrição Operacional</Text>
              <Text style={styles.detalheValue}>{especie.tipoRestricao}</Text>
            </View>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detalheLabel}>Trechos Afetados</Text>
              <Text style={styles.detalheValue}>{especie.kmAfetados}</Text>
            </View>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.detalheLabel}>Nível de Risco</Text>
              <Text style={[
                styles.detalheValue,
                { color: especie.nivelRisco === 'alto' ? Colors.nivel3 : Colors.nivel2 }
              ]}>
                {especie.nivelRisco === 'alto' ? '🔴 Alto — Autuação IBAMA/CETESB' : '🟡 Médio — Monitoramento'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function FaunaScreen({ navigation }: { navigation: any }) {
  const { state } = useAppStore();
  const restricoesAtivas = state.fauna.filter(
    e => MES_ATUAL >= e.mesInicio && MES_ATUAL <= e.mesFim
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Restrições de Fauna</Text>
          <Text style={styles.headerSub}>SP-021 · Calendário Anual · SP</Text>
        </View>
        {restricoesAtivas.length > 0 && (
          <View style={styles.alertaBadge}>
            <Text style={styles.alertaBadgeText}>{restricoesAtivas.length} ativa{restricoesAtivas.length > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* AVISO MES ATUAL */}
        {restricoesAtivas.length > 0 && (
          <View style={styles.avisoAtual}>
            <Text style={styles.avisoIcon}>🦜</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.avisoTitle}>
                {restricoesAtivas.length} espécie{restricoesAtivas.length > 1 ? 's' : ''} em período restrito agora
              </Text>
              <Text style={styles.avisoText}>
                Roçada mecanizada bloqueada nos trechos afetados. Consulte os detalhes abaixo.
              </Text>
            </View>
          </View>
        )}

        {/* LEGENDA */}
        <Card style={styles.legendaCard}>
          <Text style={styles.legendaTitle}>Como ler o calendário</Text>
          <View style={styles.legendaRow}>
            <View style={[styles.legendaDot, { backgroundColor: Colors.nivel3 }]} />
            <Text style={styles.legendaText}>Mês em período de restrição — Roçada mecanizada proibida</Text>
          </View>
          <View style={styles.legendaRow}>
            <View style={[styles.legendaDot, { backgroundColor: Colors.border }]} />
            <Text style={styles.legendaText}>Mês fora do período — Operação normal permitida</Text>
          </View>
          <View style={styles.legendaRow}>
            <View style={[styles.legendaDot, { backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.primaryDark }]} />
            <Text style={styles.legendaText}>Mês atual destacado</Text>
          </View>
        </Card>

        {/* ESPÉCIES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Espécies Monitoradas</Text>
          <Text style={styles.sectionSub}>Fauna nativa catalogada — CETESB/SMA-SP</Text>
        </View>

        {state.fauna.map(e => (
          <CalendarioEspecie key={e.id} especie={e} />
        ))}

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
  alertaBadge: {
    backgroundColor: Colors.nivel3Bg, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  alertaBadgeText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.nivel3 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: Spacing.md },

  avisoAtual: {
    flexDirection: 'row', gap: Spacing.md,
    backgroundColor: Colors.nivel3Bg, borderWidth: 1.5, borderColor: Colors.nivel3,
    borderRadius: BorderRadius.md, padding: Spacing.base,
  },
  avisoIcon: { fontSize: 28 },
  avisoTitle: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.nivel3 },
  avisoText: { fontSize: Typography.size.sm, color: Colors.nivel3, marginTop: 4, opacity: 0.9, lineHeight: 20 },

  legendaCard: { gap: Spacing.sm },
  legendaTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: 4 },
  legendaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendaDot: { width: 12, height: 12, borderRadius: 2 },
  legendaText: { fontSize: Typography.size.sm, color: Colors.textSecondary, flex: 1 },

  section: { gap: 2 },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  sectionSub: { fontSize: Typography.size.sm, color: Colors.textMuted },

  especieCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  especieCardAtiva: {
    borderColor: Colors.nivel3, borderWidth: 1.5,
  },
  especieHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  especieLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  especieNomePopular: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  especieNomeCientifico: { fontSize: Typography.size.xs, color: Colors.textMuted, fontStyle: 'italic', marginTop: 1 },
  especieRight: { alignItems: 'flex-end', gap: 6 },
  ativaBadge: {
    backgroundColor: Colors.nivel3Bg, borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  ativaText: { fontSize: 10, fontWeight: Typography.weight.extrabold, color: Colors.nivel3, letterSpacing: 0.5 },
  inativaBadge: {
    backgroundColor: Colors.nivel1Bg, borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  inativaText: { fontSize: 10, fontWeight: Typography.weight.semibold, color: Colors.nivel1, letterSpacing: 0.5 },
  expandIcon: { fontSize: 10, color: Colors.textMuted },

  calendarioBar: {
    flexDirection: 'row', gap: 3, marginTop: Spacing.md,
  },
  mesContainer: { flex: 1, alignItems: 'center', gap: 4 },
  mesBarra: {
    height: 20, width: '100%', borderRadius: 3,
  },
  mesHoje: { borderWidth: 2, borderColor: Colors.primary },
  mesLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: Typography.weight.medium },
  mesLabelHoje: { color: Colors.primary, fontWeight: Typography.weight.bold },

  especieDetalhes: { marginTop: Spacing.md, gap: Spacing.sm },
  detalheRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  detalheIcon: { fontSize: 16, width: 24, textAlign: 'center', marginTop: 2 },
  detalheLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, fontWeight: Typography.weight.medium, marginBottom: 2 },
  detalheValue: { fontSize: Typography.size.sm, color: Colors.textSecondary, lineHeight: 20 },
});
