// Telão: operado só por teclado. Mostra QR, depois cada pergunta com respostas ao vivo.
import * as sheets from "./sheets.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function init(ctx) {
  const { db, ref, set, onValue, off, caminho, fase, sessao, el } = ctx;
  const pq = PESQUISAS[fase];

  const slides = ["qr", ...pq.perguntas, "fim"];
  let idx = 0;
  let abertasVisiveis = true;
  let vistos = new Set();
  let confirmaF = false;
  let respostasOff = null;
  let dadosAtuais = {};
  let nPart = 0;

  onValue(ref(db, caminho("participantes")), (snap) => {
    nPart = snap.val() ? Object.keys(snap.val()).length : 0;
    const c = document.getElementById("cntPart");
    if (c) { c.textContent = nPart; c.classList.remove("pulse"); void c.offsetWidth; c.classList.add("pulse"); }
    else render();
    sheets.onParticipantes(ctx, snap.val() || {});
  });

  let status = "aberta";
  onValue(ref(db, caminho("status")), (snap) => {
    status = snap.val() || "aberta";
    render();
  });

  function assinarPergunta(q) {
    if (respostasOff) { respostasOff(); respostasOff = null; }
    if (!q || q === "qr" || q === "fim" || q.tipo === "conteudo") { dadosAtuais = {}; return; }
    const r = ref(db, caminho("respostas", q.id));
    const cb = onValue(r, (snap) => {
      dadosAtuais = snap.val() || {};
      atualizaViz(q, false);
      sheets.onResposta(ctx, q, dadosAtuais);
    });
    respostasOff = () => off(r, "value", cb);
  }

  function nResp() { return Object.keys(dadosAtuais).length; }

  function render() {
    const s = slides[idx];
    vistos = new Set();
    assinarPergunta(s);
    const sheetsPill = sheets.statusPill();
    const cab = `<div class="t-cab"><div class="logo-txt"><img src="img/logo-1b-branca.png" alt="1B" style="height:2.6cqw"></div>
      <div class="t-status"><span class="pill ${status === "aberta" ? "aberta" : ""}">${status === "aberta" ? "Aberta" : "Encerrada"}</span><span class="pill ${sheetsPill.alerta ? "alerta" : ""}">${esc(sheetsPill.texto)}</span>${sessao === "teste" ? `<span class="pill alerta">Sessão teste</span>` : ""}</div></div>`;

    let corpo = "", rod = "";
    if (s === "qr") {
      corpo = `<div class="qr-wrap"><div class="qr-box" id="qr"></div><div class="qr-txt">
        <span class="tag-line tag-white t-tag">${esc(pq.rotulo)}</span>
        <h1>${esc(pq.titulo)}</h1>
        <p>Aponte a câmera do celular para o código e responda.<br>Leva cerca de ${fase === "fase1" ? "10" : "15"} minutos.</p>
        <div class="qr-num"><b id="cntPart">${nPart}</b><small>pessoas já entraram</small></div></div></div>`;
    } else if (s === "fim") {
      corpo = `<div class="t-cont-slide" style="display:flex;flex-direction:column;justify-content:center;height:100%"><span class="tag-line tag-white t-tag">${esc(pq.rotulo)} encerrada</span><h1>Obrigado pela participação</h1><p>${esc(pq.encerramento)}</p><div class="qr-num" style="margin-top:2cqw">${nPart}<small>participantes</small></div></div>`;
    } else if (s.tipo === "conteudo") {
      let tab = "";
      if (s.tabela) {
        const c = s.tabela.colunas;
        tab = `<div class="t-tab">` + c.map((h, k) => `<div class="h ${k > 1 ? "op" : ""}">${esc(h)}</div>`).join("") +
          s.tabela.linhas.map((l) => l.map((x, k) => `<div class="${k === 0 ? "r" : "c"}">${esc(x)}</div>`).join("")).join("") + `</div>`;
      }
      corpo = `<div class="t-cont-slide"><span class="tag-line tag-white t-tag">${esc(s.secao || pq.rotulo + " · " + pq.titulo)}</span><h1 style="${s.tabela ? "font-size:2.6cqw;margin-bottom:.6cqw" : ""}">${esc(s.titulo)}</h1><p style="${s.tabela ? "font-size:1.15cqw;max-width:85cqw;margin-bottom:1cqw" : ""}">${esc(s.texto)}</p>${tab}${s.rodape ? `<p class="rod" style="margin-top:1cqw">${esc(s.rodape)}</p>` : ""}</div>`;
    } else {
      const titulo = `<span class="tag-line tag-white t-tag">${esc(s.secao || "")}${s.numero ? ` · Pergunta ${s.numero}` : " · Complemento"}</span>
        <h2 class="t-perg">${esc(s.pergunta)}${s.instrucao ? `<small>${esc(s.instrucao)}</small>` : ""}</h2>`;
      corpo = titulo + `<div id="viz">${vizHTML(s)}</div>`;
      rod = `<span class="t-cont"><b id="cntResp">${nResp()}</b> responderam esta pergunta</span>`;
    }

    el.innerHTML = cab + `<div class="telao" id="telao" tabindex="0"><div class="t-corpo">${corpo}</div>
      <div class="t-rod">${rod || `<span></span>`}<span>${idx} / ${slides.length - 1}</span></div>
      <div class="teclas" id="teclas"><kbd>← →</kbd>navegar<br><kbd>Q</kbd>voltar ao QR<br><kbd>↑ ↓</kbd>rolar respostas abertas<br><kbd>H</kbd>esconder/mostrar abertas<br><kbd>A</kbd>abrir pesquisa<br><kbd>F F</kbd>encerrar pesquisa<br><kbd>S</kbd>ressincronizar Sheets<br><kbd>?</kbd>esta legenda</div>
      <div class="aviso" id="aviso"></div></div>`;

    if (s === "qr" && window.QRCode) {
      new QRCode(document.getElementById("qr"), { text: `${BASE_URL}?view=responder&fase=${fase}${sessao === "teste" ? "&sessao=teste" : ""}`, width: 600, height: 600, colorDark: "#232323", colorLight: "#FFFFFF", correctLevel: QRCode.CorrectLevel.M });
    }
    if (s !== "qr" && s !== "fim" && s.tipo !== "conteudo") requestAnimationFrame(() => atualizaViz(s, true));

    const telaoEl = document.getElementById("telao");
    telaoEl.focus();
    telaoEl.onkeydown = onKey;
  }

  function vizHTML(q) {
    if (q.tipo === "unica" || q.tipo === "multipla") {
      const densa = q.opcoes.length > 6;
      return `<div class="barras ${densa ? "densa" : ""}">` + q.opcoes.map((o, k) => `<div class="barra-l" data-k="${k}"><div class="nome">${esc(o)}</div><div class="trilho"><i></i></div><div class="val">0%<small>0</small></div></div>`).join("") + `</div>` +
        (q.tipo === "multipla" ? `<div class="legenda">Cada pessoa pode marcar mais de uma opção: a soma passa de 100%.</div>` : "");
    }
    if (q.tipo === "escala_grade") {
      const cores = ["#8a4b4b", "#a07a6a", "#6f6f6f", "#6fa58d", "#5E9C82"];
      return `<div class="grade ${q.itens.length > 7 ? "densa" : ""}">` + q.itens.map((it, k) => `<div class="g-l" data-k="${k}"><div>${esc(it)}</div><div class="med">–</div><div class="dist">${cores.map((c) => `<i style="background:${c};flex-grow:0"></i>`).join("")}</div><div class="ns">0 não sei</div></div>`).join("") + `</div>
        <div class="g-leg">${cores.map((c, k) => `<span><i style="background:${c}"></i>${k + 1} ${esc(q.rotulos[k + 1])}</span>`).join("")}</div>`;
    }
    if (q.tipo === "nuvem") return `<div class="nuvem" id="nuv"></div>`;
    if (q.tipo === "aberta") return `<div id="ab"></div>`;
    return "";
  }

  function atualizaViz(q, inicial) {
    const dados = dadosAtuais, uids = Object.keys(dados), n = uids.length;
    if (q.tipo === "unica" || q.tipo === "multipla") {
      const cont = q.opcoes.map(() => 0);
      uids.forEach((u) => { const v = dados[u].valor; (Array.isArray(v) ? v : [v]).forEach((x) => { const k = q.opcoes.indexOf(x); if (k >= 0) cont[k]++; }); });
      const max = Math.max(...cont);
      document.querySelectorAll(".barra-l").forEach((row) => {
        const k = +row.dataset.k, c = cont[k], p = n ? Math.round((c / n) * 100) : 0;
        row.querySelector(".trilho i").style.width = p + "%";
        row.querySelector(".val").innerHTML = `${p}%<small>${c}</small>`;
        row.classList.toggle("lider", max > 0 && c === max);
      });
    } else if (q.tipo === "escala_grade") {
      document.querySelectorAll(".g-l").forEach((row) => {
        const k = +row.dataset.k, dist = [0, 0, 0, 0, 0]; let ns = 0, sum = 0, cnt = 0;
        uids.forEach((u) => { const v = (dados[u].valor || [])[k]; if (v === "ns") ns++; else if (v) { dist[v - 1]++; sum += v; cnt++; } });
        row.querySelector(".med").textContent = cnt ? (sum / cnt).toFixed(1).replace(".", ",") : "–";
        row.querySelectorAll(".dist i").forEach((el2, j) => (el2.style.flexGrow = dist[j]));
        row.querySelector(".ns").textContent = ns + " não sei";
      });
    } else if (q.tipo === "nuvem") {
      const f = {};
      uids.forEach((u) => (dados[u].valor || []).forEach((w) => { const k = w.toLowerCase().trim().replace(/\s+/g, " "); if (k) f[k] = (f[k] || 0) + 1; }));
      const ent = Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, 40), mx = ent.length ? ent[0][1] : 1;
      const nuv = document.getElementById("nuv"); if (!nuv) return;
      if (!ent.length) { nuv.innerHTML = `<span style="font-size:1.6cqw;font-weight:500;color:rgba(255,255,255,.4)">As palavras vão aparecer aqui</span>`; return; }
      const ord = ent.map((e, i) => [e, (i * 7919) % ent.length]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
      nuv.innerHTML = ord.map(([w, c]) => { const sz = 1.6 + (c / mx) * 5.4, novo = !inicial && !vistos.has(w); return `<span class="${novo ? "novo" : ""}" style="font-size:${sz}cqw;color:${c === mx ? "var(--verde-claro)" : `rgba(255,255,255,${0.55 + 0.45 * (c / mx)})`}">${esc(w)}</span>`; }).join("");
      ord.forEach(([w]) => vistos.add(w));
    } else if (q.tipo === "aberta") {
      const ab = document.getElementById("ab"); if (!ab) return;
      if (!abertasVisiveis) {
        ab.innerHTML = `<div class="abertas-ocultas"><div class="n">${n}</div><p>${n === 1 ? "resposta recebida" : "respostas recebidas"} · escondidas no telão · aperte H para mostrar</p></div>`;
      } else {
        const lista = uids.map((u) => ({ u, ...dados[u] })).sort((a, b) => b.em - a.em);
        const velho = ab.querySelector(".cards-ab"), pos = velho ? velho.scrollTop : 0;
        ab.innerHTML = lista.length
          ? `<div class="cards-ab" id="cardsAb">` + lista.map((r) => `<div class="card-ab ${!inicial && !vistos.has(r.u) ? "novo" : ""}">${esc(r.valor)}</div>`).join("") + `</div>` + (lista.length > 9 ? `<div class="dica-scroll">${lista.length} respostas · role com ↑ ↓ ou com o mouse para ver todas</div>` : "")
          : `<p style="font-size:1.6cqw;color:rgba(255,255,255,.4)">As respostas vão aparecer aqui assim que chegarem.</p>`;
        const novo = ab.querySelector(".cards-ab"); if (novo && pos > 40) novo.scrollTop = pos;
        lista.forEach((r) => vistos.add(r.u));
      }
    }
    const c = document.getElementById("cntResp");
    if (c && c.textContent !== String(n)) { c.textContent = n; c.classList.remove("pulse"); void c.offsetWidth; c.classList.add("pulse"); }
  }

  function aviso(msg, sub) {
    const a = document.getElementById("aviso"); if (!a) return;
    a.innerHTML = esc(msg) + (sub ? `<small>${esc(sub)}</small>` : "");
    a.classList.add("show");
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => a.classList.remove("show"), 2200);
  }

  async function abrir() {
    await set(ref(db, caminho("status")), "aberta");
    aviso("Pesquisa aberta", pq.rotulo);
  }
  async function encerrar() {
    await set(ref(db, caminho("status")), "encerrada");
    aviso("Pesquisa encerrada", "Quem estava respondendo vê a tela de encerrado");
  }

  function onKey(e) {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const teclasUsadas = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "PageDown", "PageUp", " ", "q", "h", "a", "f", "s", "?"];
    if (!teclasUsadas.includes(k)) return;
    e.preventDefault();
    if (k !== "f") confirmaF = false;
    if (k === "ArrowRight" || k === "PageDown" || k === " ") { idx = Math.min(slides.length - 1, idx + 1); render(); }
    else if (k === "ArrowLeft" || k === "PageUp") { idx = Math.max(0, idx - 1); render(); }
    else if (k === "q") { idx = 0; render(); }
    else if (k === "ArrowDown" || k === "ArrowUp") { const c = document.getElementById("cardsAb"); if (c) c.scrollBy({ top: (k === "ArrowDown" ? 1 : -1) * c.clientHeight * 0.6 }); }
    else if (k === "h") { abertasVisiveis = !abertasVisiveis; const s = slides[idx]; if (s && s.tipo === "aberta") { vistos = new Set(); atualizaViz(s, true); } aviso(abertasVisiveis ? "Respostas abertas visíveis" : "Respostas abertas escondidas (H mostra de novo)"); }
    else if (k === "a") { abrir(); }
    else if (k === "f") {
      if (status !== "aberta") { abrir(); aviso("Pesquisa aberta de novo"); return; }
      if (!confirmaF) { confirmaF = true; aviso("Encerrar a pesquisa?", "Aperte F de novo para confirmar"); return; }
      confirmaF = false; encerrar();
    }
    else if (k === "s") { sheets.resincronizarTudo(ctx); aviso("Ressincronizando com o Sheets…"); }
    else if (k === "?") { document.getElementById("teclas").classList.toggle("show"); }
  }

  // esconder cursor depois de parado, mostrar tela cheia com o primeiro gesto
  let cursorTimer;
  el.addEventListener("mousemove", () => {
    const t = document.getElementById("telao");
    if (t) t.classList.add("mostrar-cursor");
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => t && t.classList.remove("mostrar-cursor"), 2000);
  });
  el.addEventListener("click", () => {
    const t = document.getElementById("telao");
    if (t && !document.fullscreenElement && t.requestFullscreen) t.requestFullscreen().catch(() => {});
  }, { once: true });

  sheets.init(ctx);
  render();
}
