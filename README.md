# VegTrack — App Mobile

> **Ecossistema de inteligência ecológica e operacional para conservação de rodovias**  
> Concessionária Motiva · SP-021 Rodovia Anchieta · Sprint 2

---

## 👥 Integrantes

| Nome | RM |
|------|-----|
|Luis Otavio Santini Feitosa | 563556 |
|Rogério Deligi	| 561942 |
|Maria Fernanda Garavelli |	562686 |
|Vitor Barbosa de Paiva	| 565303 |
|Arthur Traldi Felix	| 563477 |
|Lucas Andrade de Souza | 564066 |
---

## 📋 Sobre o Projeto

O **VegTrack** é uma solução mobile desenvolvida para supervisores de campo da **CCR Motiva**, substituindo o modelo reativo de inspeção de vegetação em rodovias por um **Modelo de Intervenção Direcionada por Dados**.

O app resolve três problemas críticos da operação:
1. **Cegueira territorial** — mapa de calor por KM elimina inspeções manuais em toda a rodovia
2. **Risco regulatório** — alertas proativos de Nível 3 ARTESP antes da fiscalização agir
3. **Passivos ambientais** — motor de restrição de fauna bloqueia roçada mecanizada em períodos reprodutivos

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- App **Expo Go** instalado no celular (Android/iOS) — ou emulador configurado

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/lucasouza06/Challenge-Sprint02-CPAD.git
cd vegtrack-sprint2/mobile

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npx expo start

# 4. Escaneie o QR Code com o Expo Go (Android) ou câmera (iOS)
#    — ou pressione 'a' para emulador Android / 'i' para iOS
```

### Executar em dispositivo físico (recomendado para GPS e câmera)

```bash
npx expo start --tunnel
```

> ⚠️ **Importante**: Use `--tunnel` se estiver em rede diferente do dispositivo.

---

## 📁 Estrutura do Projeto

```
mobile/
├── App.tsx                          # Ponto de entrada — Provider + Navigator
├── app.json                         # Configuração Expo (permissões, targets)
├── package.json
└── src/
    ├── screens/
    │   ├── DashboardScreen.tsx      # RF001 — Mapa de calor + stats gerais
    │   ├── OrdensScreen.tsx         # RF007/RF008 — Listagem e gestão de OS
    │   ├── NovoLevantamentoScreen.tsx  # RF002 — Registro de levantamento em campo
    │   └── FaunaScreen.tsx          # RF004/RF005 — Calendário de restrições
    ├── components/
    │   └── index.tsx                # NivelBadge, StatusBadge, Card, PrimaryButton, etc.
    ├── store/
    │   └── AppContext.tsx           # Context API + Reducer — Estado global
    ├── services/
    │   └── navigation.tsx           # React Navigation — Bottom Tabs + Stack
    └── utils/
        ├── mockData.ts              # 📦 MOCKS — Dados realistas contextualizados
        └── theme.ts                 # Design tokens — cores, tipografia, espaçamentos
```

---

## 📦 Mocks Utilizados

Todos os mocks estão em `src/utils/mockData.ts` e representam dados reais da operação da Motiva.

### `mockTrechos` — Segmentos da SP-021

Representa **8 segmentos de 500m** entre o KM 23 e KM 67 da SP-021 Rodovia Anchieta, com dados contextualizados:

| Campo | Exemplo | Contexto |
|-------|---------|----------|
| `kmInicial/kmFinal` | `23.0 / 23.5` | Segmentação a cada 500m conforme Caderno de Encargos ARTESP |
| `faixa` | `"Faixa Marginal Direita"` | Faixas reais fiscalizadas: Canteiro Central (interno/externo), Marginal (D/E) |
| `alturaVegetacaoCm` | `47` | Altura real medida em campo; >30cm = Nível 3 (infração) |
| `nivelArtesp` | `3` | Classificação 1–3 do Caderno de Encargos ARTESP |
| `diasSemRocada` | `38` | Indicador operacional de urgência |
| `restricaoAmbiental` | `true` | Cruzamento com calendário de fauna protegida |
| `especieEmRestricao` | `"Turdus rufiventris (Sabiá-laranjeira)"` | Espécie real catalogada CETESB/SMA-SP |

**Distribuição dos níveis nos mocks:**
- Nível 3 (Crítico): 4 trechos → `trecho_001`, `trecho_004`, `trecho_005`, `trecho_008`
- Nível 2 (Atenção): 2 trechos → `trecho_002`, `trecho_006`
- Nível 1 (Conforme): 2 trechos → `trecho_003`, `trecho_007`

---

### `mockOrdens` — Ordens de Serviço

**5 OS** representando cenários reais do pipeline operacional:

| OS | Cenário Simulado |
|----|-----------------|
| `OS-2025-0847` | Nível 3 sem restrição → roçada **mecanizada** em 48h |
| `OS-2025-0848` | Nível 3 + Jararaca → roçada **mecanizada bloqueada**, substituída por **manual seletiva** |
| `OS-2025-0831` | Em execução com restrição Sabiá-laranjeira ativa |
| `OS-2025-0802` | Pendente urgente, sem restrição |
| `OS-2025-0788` | **Concluída** — histórico de conformidade |

---

### `mockFauna` — Calendário de Restrições

**3 espécies** nativas de SP com dados reais de restrição:

| Espécie | Nome Popular | Período | Restrição |
|---------|-------------|---------|-----------|
| `Turdus rufiventris` | Sabiá-laranjeira | Ago–Dez | Nidificação — proibido roçada mecanizada |
| `Bothrops jararaca` | Jararaca | Mar–Jun | Acasalamento — proibido roçada mecânica pesada |
| `Didelphis albiventris` | Gambá-de-orelha-branca | Jan–Mar | Lactação — reduzir velocidade de roçadeiras |

> Espécies catalogadas com base em dados da CETESB, SMA-SP e registros GBIF para bbox do estado de SP.

---

### `mockHistoricoLevantamentos` — Histórico

**3 registros históricos** para o `trecho_001` (KM 23.0–23.5), mostrando progressão do crescimento de vegetação ao longo de 3 meses — base para o gráfico de tendência (RF003).

---

## 🔄 Fluxo Completo Demonstrado

**Fluxo: Técnico registra levantamento crítico → Sistema gera OS automaticamente**

1. Usuário abre a tela **Dashboard** → visualiza mapa de calor e trechos críticos
2. Toca em um trecho vermelho (Nível 3) → abre **Novo Levantamento** pré-preenchido
3. GPS captura coordenadas automaticamente (simulado com latência real)
4. Usuário informa altura da vegetação (ex: `47cm`)
5. App exibe em tempo real: `Nível 3 — Crítico · OS será gerada automaticamente`
6. Se o trecho tem restrição ambiental, exibe **Alerta Ambiental Crítico** com espécie
7. Usuário confirma → levantamento é salvo e OS é gerada automaticamente
8. OS gerada com método correto:
   - Sem restrição → `roçada mecanizada`, prazo 48h, status `pendente`
   - Com restrição → `roçada manual seletiva`, status `bloqueada`, com justificativa
9. Tela de confirmação exibe o número da OS e motivo do método escolhido
10. Estado global atualizado: contadores do dashboard refletem a nova OS

---

## 📱 Telas Implementadas

| Tela | Arquivo | Requisitos Cobertos |
|------|---------|---------------------|
| Dashboard | `DashboardScreen.tsx` | RF001, RF003 (parcial) |
| Ordens de Serviço | `OrdensScreen.tsx` | RF007, RF008 |
| Novo Levantamento | `NovoLevantamentoScreen.tsx` | RF002, RF004, RF007, RF009 (parcial) |
| Fauna & Restrições | `FaunaScreen.tsx` | RF004, RF005 |

---

## 🛡️ Conformidade com Requisitos Não-Funcionais

| RNF | Implementado |
|-----|-------------|
| RNF002 — GPS precisão | Mock simula accuracy real com aviso se >25m |
| RNF005 — Android 10+ / iOS 14+ | `targetSdkVersion: 34`, `deploymentTarget: 14.0` |
| RNF006 — Usabilidade campo | Área de toque mínima 48dp, botões 56dp, fonte base 16sp, tema claro |
| RNF004 — Segurança | Estrutura preparada para `expo-secure-store` (JWT); GPS não logado em texto |

---

## 🎥 Vídeo de Demonstração

[YouTube — não listado](https://youtu.be/1TPgrU_rzcM)

---

## 📌 Observações Técnicas da Sprint 2

- **Mocks são intencionais** — integração com FastAPI backend ocorrerá na Sprint 3
- A estrutura de `services/` está preparada para substituição de mocks por chamadas reais à API (`/api/v1/trechos`, `/api/v1/ordens`, `/api/v1/restricoes-fauna`)
- O `AppContext` com Reducer reflete a arquitetura que será mantida após integração real — apenas a camada de dados muda
- GPS e câmera: simulados nesta Sprint com comportamento realista (latência, accuracy, alertas)
