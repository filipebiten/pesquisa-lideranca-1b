// Fluxo do celular: uma pergunta por tela, salva a cada resposta, retoma de onde parou.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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
  const { db, ref, get, set, update, onValue, serverTimestamp, uid, fase, caminho, el } = ctx;
  const pq = PESQUISAS[fase];

  const st = { ans: {}, idx: 0, sub: 0, fim: false, status: null, conectado: true, entrouRegistrado: false };
  let rascunho = null;

  // ---- carga inicial: respostas já dadas por este uid + status da fase ----
  const [statusSnap, participanteSnap, respostasSnap] = await Promise.all([
    get(ref(db, caminho("status"))),
    get(ref(db, caminho("participantes", uid))),
    get(ref(db, caminho("respostas"))),
  ]);
  st.status = statusSnap.val() || "aberta";
  const part = participanteSnap.val();
  if (part) {
    st.entrouRegistrado = true;
    if (part.concluiuEm) st.fim = true;
  }
  const todasRespostas = respostasSnap.val() || {};
  Object.keys(todasRespostas).forEach((qid) => {
    const doUid = todasRespostas[qid][uid];
    if (doUid) st.ans[qid] = doUid.valor;
  });
  if (part && part.ultimaPergunta && !st.fim) {
    const lista = visiveis(pq, st.ans);
    const i = lista.findIndex((q) => q.id === part.ultimaPergunta);
    if (i >= 0) st.idx = i;
  }

  onValue(ref(db, caminho("status")), (snap) => {
    st.status = snap.val() || "aberta";
    render();
  });
  onValue(ref(db, ".info/connected"), (snap) => {
    st.conectado = snap.val() === true;
    const badge = document.getElementById("salvo");
    if (badge && !st.conectado) badge.textContent = "sem internet, salvando ao reconectar…";
  });

  function entrouUmaVez() {
    if (st.entrouRegistrado) return {};
    st.entrouRegistrado = true;
    return { entrouEm: serverTimestamp() };
  }

  async function gravar(q, valor) {
    try {
      await set(ref(db, caminho("respostas", q.id, uid)), { valor, em: serverTimestamp() });
      await update(ref(db, caminho("participantes", uid)), { ...entrouUmaVez(), ultimaPergunta: q.id });
      const badge = document.getElementById("salvo");
      if (badge) {
        badge.textContent = "salvo ✓";
        badge.classList.add("show");
        setTimeout(() => badge && badge.classList.remove("show"), 900);
      }
    } catch (err) {
      // provavelmente a fase fechou no meio da resposta — recarrega status
      const snap = await get(ref(db, caminho("status")));
      st.status = snap.val() || "aberta";
      render();
    }
  }

  async function apagar(qid) {
    try {
      await set(ref(db, caminho("respostas", qid, uid)), null);
    } catch (_) {}
  }

  function commit(q, val) {
    let v = val;
    if (q.tipo === "aberta") {
      v = (val || "").trim();
      if (!v) { apagar(q.id); return; }
    }
    if (q.tipo === "nuvem") {
      v = (val || []).map((w) => w.trim()).filter(Boolean);
      if (!v.length) { apagar(q.id); return; }
    }
    if (v == null) return;
    gravar(q, v);
  }

  async function concluir() {
    st.fim = true;
    await update(ref(db, caminho("participantes", uid)), { ...entrouUmaVez(), concluiuEm: serverTimestamp() });
    render();
  }

  function render() {
    const cab = `<div class="cab-cel"><div class="logo-txt"><img src="img/logo-1b-branca.png" alt="1B"></div><div class="fase">${esc(pq.rotulo)}</div></div>`;

    if (st.status !== "aberta" && !st.fim) {
      el.innerHTML = cab + `<div class="fim-cel"><span class="tag-line">${esc(pq.rotulo)}</span><h2>Pesquisa encerrada</h2><p>Obrigado pela participação. Se ainda não respondeu, aguarde a abertura.</p></div>`;
      return;
    }
    if (st.fim) {
      el.innerHTML = cab + `<div class="fim-cel"><div class="circ"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg></div><h2>Respostas enviadas</h2><p>${esc(pq.encerramento)}</p></div>`;
      return;
    }

    const lista = visiveis(pq, st.ans);
    if (st.idx >= lista.length) st.idx = lista.length - 1;
    const q = lista[st.idx];
    const numeradas = lista.filter((x) => x.numero).length;
    const feitas = lista.slice(0, st.idx + 1).filter((x) => x.numero).length;
    const pct = Math.round((feitas / numeradas) * 100);
    let corpo = "", podeAvancar = true, textoProx = "Próxima";
    const atual = st.ans[q.id];
    rascunho = atual != null ? JSON.parse(JSON.stringify(atual)) : null;

    if (q.tipo === "conteudo") {
      textoProx = "Continuar";
      let tab = "";
      if (q.tabela) {
        const cols = q.tabela.colunas;
        for (let c = 1; c < cols.length; c++) {
          tab += `<div class="card-op"><h3>${esc(cols[c])}</h3><dl>` + q.tabela.linhas.map((l) => `<dt>${esc(l[0])}</dt><dd>${esc(l[c])}</dd>`).join("") + `</dl></div>`;
        }
      }
      let txt = esc(q.texto);
      if (q.destaque) txt = txt.replace(esc(q.destaque), `<b>${esc(q.destaque)}</b>`);
      corpo = `<div class="conteudo-cel">${q.secao ? `<span class="tag-line">${esc(q.secao)}</span>` : `<span class="tag-line">${esc(pq.rotulo)} · ${esc(pq.titulo)}</span>`}<h2>${esc(q.titulo)}</h2><p>${txt}</p>${tab}${q.rodape ? `<p class="rod">${esc(q.rodape)}</p>` : ""}</div>`;
    } else {
      const cont = q.numero ? `<div class="contagem">Pergunta ${feitas} de ${numeradas}</div>` : `<div class="contagem">Complemento</div>`;
      let inner = "";
      if (q.tipo === "unica") {
        inner = `<div class="opcs ${q.opcoes.length > 6 ? "compacta" : ""}">` + q.opcoes.map((o) => `<button class="opc ${atual === o ? "on" : ""}" data-o="${esc(o)}">${esc(o)}</button>`).join("") + `</div>`;
        podeAvancar = atual != null;
      } else if (q.tipo === "multipla") {
        const sel = rascunho || [];
        const cheio = q.max && sel.length >= q.max;
        inner = `<div class="opcs ${q.opcoes.length > 6 ? "compacta" : ""}">` + q.opcoes.map((o) => `<button class="opc ${sel.includes(o) ? "on" : cheio ? "off" : ""}" data-o="${esc(o)}">${esc(o)}</button>`).join("") + `</div>`;
        podeAvancar = sel.length > 0;
      } else if (q.tipo === "escala_grade") {
        const arr = rascunho || Array(q.itens.length).fill(null);
        const v = arr[st.sub];
        inner = `<div class="contagem" style="margin-top:4px">Item ${st.sub + 1} de ${q.itens.length}</div><div class="item-escala">${esc(q.itens[st.sub])}</div>
          <div class="escala">` + [1, 2, 3, 4, 5].map((n) => `<button class="opc ${v === n ? "on" : ""}" data-n="${n}">${n}</button>`).join("") + `</div>
          <div class="rot-escala">${v && v !== "ns" ? esc(q.rotulos[v]) : "&nbsp;"}</div>
          <button class="opc ${v === "ns" ? "on" : ""}" data-n="ns" style="text-align:center">${esc(q.naoSei)}</button>`;
        podeAvancar = v != null;
      } else if (q.tipo === "aberta") {
        inner = q.longa
          ? `<textarea id="txt" maxlength="1000" placeholder="Escreva aqui">${esc(atual || "")}</textarea>`
          : `<input class="txt" id="txt" maxlength="200" placeholder="Escreva aqui" value="${esc(atual || "")}">`;
        textoProx = atual && atual.trim() ? "Próxima" : "Pular";
      } else if (q.tipo === "nuvem") {
        const arr = rascunho || Array(q.qtd).fill("");
        inner = `<div class="nuvem-in">` + arr.map((w, i) => `<input class="txt" data-i="${i}" maxlength="25" placeholder="Palavra ${i + 1}" value="${esc(w)}">`).join("") + `</div>`;
        textoProx = arr.some((w) => w.trim()) ? "Próxima" : "Pular";
      }
      corpo = `${q.secao ? `<span class="tag-line">${esc(q.secao)}</span>` : ""}${cont}<h2 class="perg">${esc(q.pergunta)}</h2>${q.instrucao ? `<p class="instr">${esc(q.instrucao)}</p>` : q.tipo === "escala_grade" ? `<p class="instr">1 = ${esc(q.rotulos[1])} · 5 = ${esc(q.rotulos[5])}</p>` : ""}${inner}`;
    }

    const ultimo = st.idx === lista.length - 1 && (q.tipo !== "escala_grade" || st.sub === q.itens.length - 1);
    if (ultimo && q.tipo !== "conteudo") textoProx = "Enviar";

    el.innerHTML = cab + `<div class="prog"><i style="width:${pct}%"></i></div><span class="salvo" id="salvo">salvo ✓</span>
      <div class="corpo-cel">${corpo}</div>
      <div class="rodape-cel">${st.idx > 0 || st.sub > 0 ? `<button class="btn btn-out" id="volta">Voltar</button>` : ""}<button class="btn btn-verde" id="prox" ${podeAvancar ? "" : "disabled"}>${textoProx}</button></div>`;

    el.querySelectorAll(".opc[data-o]").forEach((b) => (b.onclick = () => {
      const o = b.dataset.o;
      if (q.tipo === "unica") { st.ans[q.id] = o; commit(q, o); render(); } else {
        let sel = (st.ans[q.id] || []).slice();
        if (sel.includes(o)) sel = sel.filter((x) => x !== o);
        else {
          const ex = q.exclusivas || [];
          if (ex.includes(o)) sel = [o];
          else { sel = sel.filter((x) => !ex.includes(x)); if (q.max && sel.length >= q.max) return; sel.push(o); }
        }
        st.ans[q.id] = sel; if (!sel.length) delete st.ans[q.id]; render();
      }
    }));
    el.querySelectorAll(".opc[data-n]").forEach((b) => (b.onclick = () => {
      const arr = (st.ans[q.id] || Array(q.itens.length).fill(null)).slice();
      arr[st.sub] = b.dataset.n === "ns" ? "ns" : +b.dataset.n;
      st.ans[q.id] = arr; render();
    }));
    const t = document.getElementById("txt");
    if (t) t.oninput = () => { st.ans[q.id] = t.value; document.getElementById("prox").textContent = t.value.trim() ? (ultimo ? "Enviar" : "Próxima") : "Pular"; };
    el.querySelectorAll(".nuvem-in input").forEach((inp) => (inp.oninput = () => {
      const arr = (st.ans[q.id] || Array(q.qtd).fill("")).slice();
      arr[+inp.dataset.i] = inp.value; st.ans[q.id] = arr;
      document.getElementById("prox").textContent = arr.some((w) => w.trim()) ? (ultimo ? "Enviar" : "Próxima") : "Pular";
    }));
    const v = document.getElementById("volta");
    if (v) v.onclick = () => {
      if (q.tipo === "escala_grade" && st.sub > 0) st.sub--;
      else {
        st.idx--;
        const anterior = visiveis(pq, st.ans)[st.idx];
        st.sub = anterior && anterior.tipo === "escala_grade" ? anterior.itens.length - 1 : 0;
      }
      render();
    };
    document.getElementById("prox").onclick = () => {
      if (q.tipo === "escala_grade" && st.sub < q.itens.length - 1) { st.sub++; render(); return; }
      if (q.tipo !== "conteudo") commit(q, st.ans[q.id]);
      // limpa respostas condicionais que deixaram de valer
      pq.perguntas.filter((x) => x.mostrarSe).forEach((x) => {
        if (!visiveis(pq, st.ans).includes(x) && st.ans[x.id] != null) { delete st.ans[x.id]; apagar(x.id); }
      });
      const nova = visiveis(pq, st.ans);
      if (st.idx >= nova.length - 1) { concluir(); return; }
      st.idx++; st.sub = 0;
      render();
    };
  }

  render();
}
