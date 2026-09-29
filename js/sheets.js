// Espelho da sessão oficial no Google Sheets. Roda só no telão (operador logado).
// Sessão "teste" nunca sincroniza. Se SHEETS_WEBAPP_URL estiver vazio, fica desligado sem quebrar o app.

let ctxRef = null;
let secret = null;
let colunasCache = {}; // por fase
let sujos = new Set(); // uids pendentes de reenvio
let debounceTimer = null;
let pendentes = 0;
let ultimoErro = null;
let offParticipantes = null;
let offRespostas = null;

function ligado(ctx) {
  return !!SHEETS_WEBAPP_URL && ctx.sessao === "oficial";
}

export function statusPill() {
  if (!SHEETS_WEBAPP_URL) return { texto: "Sheets: não configurado", alerta: true };
  if (ctxRef && ctxRef.sessao !== "oficial") return { texto: "Sheets: sessão teste", alerta: false };
  if (ultimoErro) return { texto: "Sheets: erro, tentando de novo", alerta: true };
  if (pendentes > 0) return { texto: `Sheets: ${pendentes} pendente${pendentes > 1 ? "s" : ""}`, alerta: true };
  return { texto: "Sheets ✓", alerta: false };
}

function secretSalvo() {
  return localStorage.getItem("pesquisa1b_sheets_secret") || "";
}
function pedirSecret() {
  const salvo = secretSalvo();
  if (salvo) return salvo;
  const digitado = prompt("Segredo do Sheets (colado uma única vez, fica só neste navegador):");
  if (digitado) localStorage.setItem("pesquisa1b_sheets_secret", digitado);
  return digitado || "";
}

function colunasDaFase(fase) {
  if (colunasCache[fase]) return colunasCache[fase];
  const pq = PESQUISAS[fase];
  const cols = [];
  pq.perguntas.forEach((q) => {
    if (q.tipo === "conteudo") return;
    const rotulo = q.numero ? `${q.numero}. ${q.pergunta}` : q.pergunta;
    if (q.tipo === "escala_grade") {
      q.itens.forEach((item, i) => {
        cols.push({ id: `${q.id}__${i}`, cabecalho: `${q.numero}.${i + 1} ${item}`, tipo: "escala" });
      });
    } else {
      cols.push({ id: q.id, cabecalho: rotulo, tipo: q.tipo, opcoes: q.opcoes || null });
    }
  });
  colunasCache[fase] = cols;
  return cols;
}

function formatarValor(q, valor) {
  if (valor == null) return "";
  if (q.tipo === "multipla" || q.tipo === "nuvem") return (Array.isArray(valor) ? valor : [valor]).join("; ");
  return String(valor);
}

async function linhaParticipante(ctx, uid, todasRespostas, todosParticipantes) {
  const pq = PESQUISAS[ctx.fase];
  const respostas = {};
  pq.perguntas.forEach((q) => {
    if (q.tipo === "conteudo") return;
    const doUid = todasRespostas[q.id] && todasRespostas[q.id][uid];
    const valor = doUid ? doUid.valor : null;
    if (q.tipo === "escala_grade") {
      (valor || []).forEach((v, i) => { respostas[`${q.id}__${i}`] = v === "ns" ? "Não sei" : v == null ? "" : String(v); });
    } else {
      respostas[q.id] = formatarValor(q, valor);
    }
  });
  const part = todosParticipantes[uid] || {};
  return { uid, entrouEm: part.entrouEm || null, concluiuEm: part.concluiuEm || null, respostas };
}

async function enviar(ctx, participantes, motivo) {
  if (!ligado(ctx)) return;
  // sincronização automática (motivo "auto") nunca interrompe com prompt — só usa
  // segredo já salvo. O prompt (uma vez, por navegador) só aparece com a tecla S.
  if (!secret) secret = motivo === "auto" ? secretSalvo() : pedirSecret();
  if (!secret) return;
  const body = { secret, fase: ctx.fase, colunas: colunasDaFase(ctx.fase), participantes, motivo };
  try {
    const resp = await fetch(SHEETS_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita preflight CORS no Apps Script
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    ultimoErro = null;
    pendentes = Math.max(0, pendentes - participantes.length);
  } catch (err) {
    ultimoErro = err.message;
    participantes.forEach((p) => sujos.add(p.uid));
    agendarEnvio(ctx);
  }
}

function agendarEnvio(ctx) {
  if (!ligado(ctx)) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!sujos.size) return;
    const uids = Array.from(sujos); sujos.clear();
    const [rSnap, pSnap] = await Promise.all([
      ctx.get(ctx.ref(ctx.db, ctx.caminho("respostas"))),
      ctx.get(ctx.ref(ctx.db, ctx.caminho("participantes"))),
    ]);
    const todasRespostas = rSnap.val() || {}, todosParticipantes = pSnap.val() || {};
    const linhas = await Promise.all(uids.map((u) => linhaParticipante(ctx, u, todasRespostas, todosParticipantes)));
    enviar(ctx, linhas, "auto");
  }, 3000);
}

export function onResposta(ctx, q, dadosDaPergunta) {
  if (!ligado(ctx)) return;
  Object.keys(dadosDaPergunta || {}).forEach((uid) => { sujos.add(uid); pendentes++; });
  agendarEnvio(ctx);
}

export function onParticipantes(ctx, todosParticipantes) {
  if (!ligado(ctx)) return;
  Object.keys(todosParticipantes || {}).forEach((uid) => sujos.add(uid));
  agendarEnvio(ctx);
}

export async function resincronizarTudo(ctx) {
  if (!SHEETS_WEBAPP_URL) return;
  if (!secret) secret = pedirSecret();
  if (!secret) return;
  const [rSnap, pSnap] = await Promise.all([
    ctx.get(ctx.ref(ctx.db, ctx.caminho("respostas"))),
    ctx.get(ctx.ref(ctx.db, ctx.caminho("participantes"))),
  ]);
  const todasRespostas = rSnap.val() || {}, todosParticipantes = pSnap.val() || {};
  const uids = Object.keys(todosParticipantes);
  const linhas = await Promise.all(uids.map((u) => linhaParticipante(ctx, u, todasRespostas, todosParticipantes)));
  pendentes = 0; sujos.clear();
  await enviar(ctx, linhas, "resync_total");
}

export function init(ctx) {
  ctxRef = ctx;
  if (!ligado(ctx)) return;
}
