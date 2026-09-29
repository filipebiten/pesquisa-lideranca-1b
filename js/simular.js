// Gera participantes fictícios na sessão de teste, pra ver o telão cheio.
// Só funciona com &sessao=teste (checado em app.js) e no MESMO navegador que já é operador
// (é o operador que tem permissão de escrever em uid de outra pessoa).

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const POOL_ABERTA = [
  "Uma igreja presente em várias regiões da cidade.",
  "Mais espaço para crianças e adolescentes.",
  "O estacionamento hoje limita muito.",
  "Estrutura própria para retiros.",
  "Cuidar bem de quem já está antes de crescer.",
  "Formar mais líderes para os PGMs.",
  "Planejamento financeiro responsável, por etapas.",
  "Salas de ensino adequadas para a Escola do Discípulo.",
  "Acolhimento melhor para visitantes.",
  "Ouvir mais a igreja antes de decidir.",
];
const POOL_NUVEM = ["acolhedora", "missionária", "família", "relevante", "generosa", "unida", "bíblica", "presente", "viva", "comunidade", "serviço", "oração"];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function visiveis(pq, ans) {
  return pq.perguntas.filter((q) => {
    if (!q.mostrarSe) return true;
    const v = ans[q.mostrarSe.pergunta];
    if (v == null) return false;
    const arr = Array.isArray(v) ? v : [v];
    return q.mostrarSe.opcoes.some((o) => arr.includes(o));
  });
}

export async function init(ctx) {
  const { db, ref, get, set, update, serverTimestamp, caminho, fase, el, n } = ctx;
  const pq = PESQUISAS[fase];

  const statusSnap = await get(ref(db, caminho("status")));
  if (statusSnap.val() !== "aberta") {
    el.innerHTML = `<div class="setup-op"><h1>Pesquisa fechada</h1><p>Abra o telão desta fase (sessão teste) e aperte <b>A</b> antes de simular.</p></div>`;
    return;
  }

  el.innerHTML = `<div class="setup-op"><h1>Simulando ${n} participantes…</h1><p id="prog">0 / ${n}</p></div>`;
  const progEl = document.getElementById("prog");
  let ok = 0, falhou = false;

  for (let p = 0; p < n; p++) {
    const simUid = "sim_" + Date.now().toString(36) + "_" + p;
    await new Promise((res) => setTimeout(res, 180));
    try {
      await update(ref(db, caminho("participantes", simUid)), { entrouEm: serverTimestamp() });
      const ans = {};
      for (const q of pq.perguntas) {
        if (q.tipo === "conteudo") continue;
        if (q.mostrarSe) {
          const v = ans[q.mostrarSe.pergunta];
          const arr = Array.isArray(v) ? v : [v];
          if (!q.mostrarSe.opcoes.some((o) => arr.includes(o))) continue;
        }
        let v = null;
        if (q.tipo === "unica") v = pick(q.opcoes);
        else if (q.tipo === "multipla") {
          const lim = q.max || 3;
          const c = q.opcoes.filter((o) => !(q.exclusivas || []).includes(o));
          v = [...new Set(Array.from({ length: 1 + Math.floor(Math.random() * lim) }, () => pick(c)))].slice(0, lim);
        } else if (q.tipo === "escala_grade") v = q.itens.map(() => (Math.random() < 0.08 ? "ns" : 1 + Math.floor(Math.random() * 5)));
        else if (q.tipo === "nuvem") v = Array.from({ length: q.qtd }, () => pick(POOL_NUVEM));
        else if (q.tipo === "aberta" && Math.random() < 0.7) v = pick(POOL_ABERTA);
        if (v != null) {
          ans[q.id] = v;
          await set(ref(db, caminho("respostas", q.id, simUid)), { valor: v, em: serverTimestamp() });
        }
      }
      await update(ref(db, caminho("participantes", simUid)), { concluiuEm: serverTimestamp() });
      ok++;
    } catch (err) {
      falhou = true;
      progEl.innerHTML = `Erro: ${esc(err.message)}<br>Confirme que este navegador é operador (abra o telão desta fase aqui primeiro).`;
      break;
    }
    progEl.textContent = `${ok} / ${n}`;
  }
  if (!falhou) progEl.textContent = `Pronto: ${ok} participantes simulados na sessão de teste.`;
}
