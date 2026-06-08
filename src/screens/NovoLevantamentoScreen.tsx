import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { useAppStore, calcularNivelArtesp, nivelColor, nivelLabel, formatarDataHora } from '../store/AppContext';
import { PrimaryButton, NivelBadge, AlertaAmbiental, Divider, Card } from '../components/index';
import { Colors, Typography, Spacing, BorderRadius, Shadow, MIN_BUTTON_HEIGHT } from '../utils/theme';
import { Trecho, FaixaDominio, Levantamento, OrdemServico } from '../utils/mockData';

const FAIXAS: FaixaDominio[] = [
  'Canteiro Central Externo',
  'Canteiro Central Interno',
  'Faixa Marginal Direita',
  'Faixa Marginal Esquerda',
];

// ─── GEOLOCALIZAÇÃO MOCK ─────────────────────────────────────
function useMockGPS() {
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const capturar = () => {
    setLoading(true);
    // Simula latência de captura GPS real
    setTimeout(() => {
      setCoords({
        lat: -23.742 + Math.random() * 0.05,
        lng: -46.581 + Math.random() * 0.05,
        accuracy: 4 + Math.random() * 8,
      });
      setLoading(false);
    }, 1500);
  };

  return { coords, loading, capturar };
}

// ─── RESULTADO APÓS LEVANTAMENTO ────────────────────────────
function ResultadoOS({
  os,
  onVerOS,
  onNovoLevantamento,
}: {
  os: OrdemServico;
  onVerOS: () => void;
  onNovoLevantamento: () => void;
}) {
  const isBloqueada = os.status === 'bloqueada';
  return (
    <View style={styles.resultadoContainer}>
      <View style={[styles.resultadoHeader, { backgroundColor: isBloqueada ? Colors.alertaAmbientalBg : Colors.nivel3Bg }]}>
        <Text style={styles.resultadoIcon}>{isBloqueada ? '⚠️' : '🚨'}</Text>
        <Text style={[styles.resultadoTitle, { color: isBloqueada ? Colors.alertaAmbiental : Colors.nivel3 }]}>
          {isBloqueada ? 'OS Gerada com Restrição Ambiental' : 'OS Gerada — Intervenção Urgente'}
        </Text>
      </View>
      <View style={styles.resultadoBody}>
        <View style={styles.resultadoRow}>
          <Text style={styles.resultadoLabel}>Número da OS</Text>
          <Text style={styles.resultadoValue}>{os.numero}</Text>
        </View>
        <View style={styles.resultadoRow}>
          <Text style={styles.resultadoLabel}>Método</Text>
          <Text style={styles.resultadoValue}>
            {os.metodo === 'mecanizada' ? '🚜 Roçada Mecanizada' : '✂️ Roçada Manual Seletiva'}
          </Text>
        </View>
        <View style={styles.resultadoRow}>
          <Text style={styles.resultadoLabel}>Prazo</Text>
          <Text style={[styles.resultadoValue, { color: Colors.nivel3 }]}>
            {os.prazoHoras}h
          </Text>
        </View>
        {isBloqueada && (
          <View style={styles.resultadoBloqueio}>
            <Text style={styles.resultadoBloqueioText}>{os.motivaBloqueio}</Text>
          </View>
        )}
        <View style={styles.resultadoActions}>
          <PrimaryButton label="Ver Ordens de Serviço" onPress={onVerOS} />
          <PrimaryButton label="Novo Levantamento" onPress={onNovoLevantamento} variant="outline" />
        </View>
      </View>
    </View>
  );
}

// ─── SCREEN PRINCIPAL ────────────────────────────────────────
export default function NovoLevantamentoScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { state, dispatch } = useAppStore();
  const { trechoId } = route.params || {};

  const trechoPreSelecionado = trechoId
    ? state.trechos.find(t => t.id === trechoId)
    : null;

  // FORM STATE
  const [kmInicial, setKmInicial] = useState(
    trechoPreSelecionado ? String(trechoPreSelecionado.kmInicial) : ''
  );
  const [kmFinal, setKmFinal] = useState(
    trechoPreSelecionado ? String(trechoPreSelecionado.kmFinal) : ''
  );
  const [faixa, setFaixa] = useState<FaixaDominio>(
    trechoPreSelecionado ? trechoPreSelecionado.faixa : 'Faixa Marginal Direita'
  );
  const [altura, setAltura] = useState('');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [osGerada, setOsGerada] = useState<OrdemServico | null>(null);

  const { coords, loading: gpsLoading, capturar } = useMockGPS();

  // Auto-captura GPS ao abrir
  useEffect(() => { capturar(); }, []);

  const alturaNum = parseFloat(altura);
  const nivelCalculado = altura && !isNaN(alturaNum) ? calcularNivelArtesp(alturaNum) : null;

  // Verificar restrição ambiental para o trecho
  const trechoAtual = state.trechos.find(
    t => t.kmInicial === parseFloat(kmInicial) && t.faixa === faixa
  ) || trechoPreSelecionado;
  const temRestricao = trechoAtual?.restricaoAmbiental ?? false;
  const especieRestricao = trechoAtual?.especieEmRestricao;

  const podeSalvar = kmInicial && kmFinal && altura && !isNaN(alturaNum) && alturaNum > 0 && coords;

  const handleSalvar = () => {
    if (!podeSalvar) return;

    setSalvando(true);
    // Simula processamento
    setTimeout(() => {
      const agora = new Date().toISOString();
      const nivel = calcularNivelArtesp(alturaNum);

      // 1. Registra levantamento
      const novoLev: Levantamento = {
        id: `lev_${Date.now()}`,
        trechoId: trechoAtual?.id || `trecho_new_${Date.now()}`,
        kmInicial: parseFloat(kmInicial),
        kmFinal: parseFloat(kmFinal),
        faixa,
        alturaVegetacaoCm: alturaNum,
        nivelArtesp: nivel,
        dataRegistro: agora,
        tecnicoNome: state.user.apelido,
        lat: coords!.lat,
        lng: coords!.lng,
        temFoto: false,
        observacoes: obs || undefined,
      };
      dispatch({ type: 'REGISTRAR_LEVANTAMENTO', payload: novoLev });

      // 2. Se Nível 3, gera OS automaticamente
      if (nivel === 3) {
        const metodo = temRestricao ? 'manual_seletiva' : 'mecanizada';
        const novaOS: OrdemServico = {
          id: `os_${Date.now()}`,
          numero: `OS-2025-${String(900 + state.ordens.length).padStart(4, '0')}`,
          trechoId: novoLev.trechoId,
          kmInicial: parseFloat(kmInicial),
          kmFinal: parseFloat(kmFinal),
          faixa,
          metodo,
          status: temRestricao ? 'bloqueada' : 'pendente',
          urgencia: 'critica',
          prazoHoras: 48,
          criadaEm: agora,
          motivaBloqueio: temRestricao
            ? `ALERTA AMBIENTAL: Período reprodutivo ativo de ${especieRestricao}. Roçada mecanizada bloqueada. Somente roçada manual seletiva autorizada.`
            : undefined,
          equipeResponsavel: metodo === 'mecanizada'
            ? 'Equipe Ômega — Roçada Mecânica'
            : 'Equipe Alfa — Roçada Manual',
          observacoes: obs || `Vegetação registrada em ${alturaNum}cm — Nível 3 ARTESP. Gerada automaticamente via levantamento de campo.`,
        };
        dispatch({ type: 'GERAR_OS', payload: novaOS });
        setOsGerada(novaOS);
      } else {
        Alert.alert(
          '✅ Levantamento Registrado',
          `KM ${kmInicial}–${kmFinal}\nAltura: ${alturaNum}cm — ${nivelLabel(nivel)}\n\nNenhuma OS gerada (abaixo do Nível 3).`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }

      setSalvando(false);
    }, 1200);
  };

  // Mostrar resultado se OS foi gerada
  if (osGerada) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Levantamento Registrado</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: Spacing.base }}>
          <ResultadoOS
            os={osGerada}
            onVerOS={() => {
              setOsGerada(null);
              navigation.navigate('Ordens');
            }}
            onNovoLevantamento={() => {
              setOsGerada(null);
              setAltura('');
              setObs('');
              setKmInicial('');
              setKmFinal('');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Levantamento</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* GPS */}
        <Card style={styles.gpsCard}>
          <View style={styles.gpsRow}>
            <Text style={styles.gpsIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsLabel}>Localização GPS</Text>
              {gpsLoading ? (
                <View style={styles.gpsLoading}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.gpsLoadingText}>Capturando localização...</Text>
                </View>
              ) : coords ? (
                <View>
                  <Text style={styles.gpsCoords}>
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </Text>
                  <Text style={styles.gpsAccuracy}>
                    Precisão: ±{coords.accuracy.toFixed(1)}m {coords.accuracy > 25 ? '⚠️' : '✅'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.gpsError}>GPS não disponível</Text>
              )}
            </View>
            <TouchableOpacity onPress={capturar} style={styles.gpsRefresh}>
              <Text style={styles.gpsRefreshText}>↻</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* TRECHO */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Trecho (KM)</Text>
          <View style={styles.kmRow}>
            <View style={styles.kmField}>
              <Text style={styles.kmFieldLabel}>Inicial</Text>
              <TextInput
                style={styles.input}
                value={kmInicial}
                onChangeText={setKmInicial}
                keyboardType="decimal-pad"
                placeholder="Ex: 23.0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <Text style={styles.kmSep}>—</Text>
            <View style={styles.kmField}>
              <Text style={styles.kmFieldLabel}>Final</Text>
              <TextInput
                style={styles.input}
                value={kmFinal}
                onChangeText={setKmFinal}
                keyboardType="decimal-pad"
                placeholder="Ex: 23.5"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* FAIXA */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Faixa de Domínio</Text>
          <View style={styles.faixaGrid}>
            {FAIXAS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.faixaChip, faixa === f && styles.faixaChipActive]}
                onPress={() => setFaixa(f)}
              >
                <Text style={[styles.faixaText, faixa === f && styles.faixaTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ALTURA */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Altura da Vegetação (cm)</Text>
          <View style={styles.alturaRow}>
            <TextInput
              style={[styles.input, styles.alturaInput]}
              value={altura}
              onChangeText={setAltura}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.alturaCm}>cm</Text>
          </View>

          {/* Preview do nível em tempo real */}
          {nivelCalculado && (
            <View style={styles.nivelPreview}>
              <NivelBadge nivel={nivelCalculado} />
              {nivelCalculado === 3 && (
                <Text style={styles.nivelAviso}>
                  ⚠️ Nível 3 — OS será gerada automaticamente
                </Text>
              )}
              {nivelCalculado === 2 && (
                <Text style={styles.nivelAvisoWarning}>
                  Atenção — Monitorar. OS gerada se chegar a 30cm+
                </Text>
              )}
            </View>
          )}
        </View>

        {/* ALERTA AMBIENTAL (se trecho tem restrição) */}
        {temRestricao && especieRestricao && nivelCalculado === 3 && (
          <View style={styles.formSection}>
            <AlertaAmbiental especie={especieRestricao} />
          </View>
        )}

        {/* FOTO (simulada) */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Evidência Fotográfica (Obrigatória no N3)</Text>
          <TouchableOpacity style={styles.fotoBtn} onPress={() => Alert.alert('Câmera', 'Em produção: expo-camera abrirá aqui.\n\nNesta Sprint, simulado como capturado.')}>
            <Text style={styles.fotoBtnIcon}>📷</Text>
            <Text style={styles.fotoBtnText}>Abrir Câmera</Text>
            <Text style={styles.fotoBtnSub}>Foto geotaggeada com timestamp</Text>
          </TouchableOpacity>
        </View>

        {/* OBSERVAÇÕES */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Observações (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.obsInput]}
            value={obs}
            onChangeText={setObs}
            placeholder="Ex: Vegetação próxima à placa de sinalização. Visibilidade comprometida."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* BOTÃO SALVAR */}
        <View style={[styles.formSection, { marginBottom: Spacing.xxxl }]}>
          <PrimaryButton
            label={salvando ? 'Registrando...' : 'Registrar Levantamento'}
            onPress={handleSalvar}
            loading={salvando}
            disabled={!podeSalvar || salvando}
          />
          {!podeSalvar && (
            <Text style={styles.validacaoText}>
              Preencha KM inicial/final, faixa, altura e aguarde o GPS.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 32, color: Colors.primary, marginTop: -4 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: Spacing.base },

  gpsCard: { flexDirection: 'row' },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  gpsIcon: { fontSize: 28 },
  gpsLabel: { fontSize: Typography.size.sm, color: Colors.textMuted, fontWeight: Typography.weight.medium },
  gpsLoading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  gpsLoadingText: { fontSize: Typography.size.sm, color: Colors.textMuted },
  gpsCoords: { fontSize: Typography.size.sm, fontFamily: 'monospace', color: Colors.textPrimary, marginTop: 2 },
  gpsAccuracy: { fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2 },
  gpsError: { fontSize: Typography.size.sm, color: Colors.nivel3, marginTop: 2 },
  gpsRefresh: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  gpsRefreshText: { fontSize: 20, color: Colors.primary },

  formSection: { gap: Spacing.sm },
  formLabel: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: Colors.textPrimary },

  kmRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  kmField: { flex: 1, gap: 4 },
  kmFieldLabel: { fontSize: Typography.size.xs, color: Colors.textMuted },
  kmSep: { fontSize: Typography.size.lg, color: Colors.textMuted, marginTop: 16 },

  input: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: Typography.size.base, color: Colors.textPrimary,
    minHeight: 48,
  },
  obsInput: { minHeight: 80 },

  faixaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  faixaChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  faixaChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  faixaText: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  faixaTextActive: { color: Colors.primary, fontWeight: Typography.weight.bold },

  alturaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  alturaInput: { width: 120, textAlign: 'center', fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  alturaCm: { fontSize: Typography.size.lg, color: Colors.textMuted, fontWeight: Typography.weight.medium },

  nivelPreview: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  nivelAviso: { fontSize: Typography.size.sm, color: Colors.nivel3, fontWeight: Typography.weight.semibold, flex: 1 },
  nivelAvisoWarning: { fontSize: Typography.size.sm, color: Colors.nivel2, fontWeight: Typography.weight.medium, flex: 1 },

  fotoBtn: {
    backgroundColor: Colors.surfaceElevated, borderWidth: 1.5,
    borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: BorderRadius.md, padding: Spacing.lg,
    alignItems: 'center', gap: 4,
  },
  fotoBtnIcon: { fontSize: 32 },
  fotoBtnText: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: Colors.textSecondary },
  fotoBtnSub: { fontSize: Typography.size.xs, color: Colors.textMuted },

  validacaoText: { fontSize: Typography.size.sm, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },

  resultadoContainer: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.md,
  },
  resultadoHeader: { padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm },
  resultadoIcon: { fontSize: 40 },
  resultadoTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.extrabold, textAlign: 'center' },
  resultadoBody: { padding: Spacing.base, gap: Spacing.sm },
  resultadoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  resultadoLabel: { fontSize: Typography.size.base, color: Colors.textMuted },
  resultadoValue: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  resultadoBloqueio: {
    backgroundColor: Colors.alertaAmbientalBg, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginTop: Spacing.sm,
  },
  resultadoBloqueioText: { fontSize: Typography.size.sm, color: Colors.alertaAmbiental, lineHeight: 20 },
  resultadoActions: { gap: Spacing.sm, marginTop: Spacing.md },
});
