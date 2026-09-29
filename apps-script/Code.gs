/**
 * Espelho da pesquisa (sessão oficial) na planilha "COLEGIO PASTORAL - SETEMBRO 2026".
 * Publicar como Web App (Extensões → Apps Script → Implantar → Nova implantação → App da Web,
 * "Executar como: eu", "Quem pode acessar: qualquer pessoa"). O segredo compartilhado fica em
 * Propriedades do Script (Configurações do projeto → Propriedades do script), nunca aqui no código.
 */

var SHEET_ID = "1pD8YpAhTxY2yZmkRB9sml8QAUN0cF-KLxWXUO4KFtds";
var COLUNAS_FIXAS = ["Participante", "Entrou em", "Concluiu em"];

function doPost(e) {
  var resposta;
  try {
    var body = JSON.parse(e.postData.contents);
    var segredo = PropertiesService.getScriptProperties().getProperty("SEGREDO_SHEETS");
    if (!segredo || body.secret !== segredo) {
      return saida_({ ok: false, erro: "segredo inválido" });
    }
    var fase = body.fase === "fase2" ? "fase2" : "fase1";
    var nomeAba = fase === "fase1" ? "Fase 1" : "Fase 2";
    var colunas = body.colunas || [];
    var participantes = body.participantes || [];

    var ss = SpreadsheetApp.openById(SHEET_ID);
    garantirEstruturaBase_(ss);
    var ordem = garantirColunas_(ss, nomeAba, fase, colunas);
    var mapa = carregarMapaUids_(fase);

    participantes.forEach(function (p) {
      var linha = upsertParticipante_(ss, nomeAba, ordem, mapa, fase, p);
      atualizarAbertas_(ss, fase, colunas, mapa[p.uid], p);
    });

    salvarMapaUids_(fase, mapa);
    resposta = { ok: true, participantesProcessados: participantes.length };
  } catch (err) {
    resposta = { ok: false, erro: String(err) };
  }
  return saida_(resposta);
}

function saida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Remove a aba padrão "Página1" (se vazia) e cria as abas fixas que ainda não existirem. */
function garantirEstruturaBase_(ss) {
  var nomes = ["Fase 1", "Fase 2", "Resumo Fase 1", "Resumo Fase 2", "Abertas"];
  nomes.forEach(function (nome) {
    if (!ss.getSheetByName(nome)) ss.insertSheet(nome);
  });
  var padrao = ss.getSheetByName("Página1") || ss.getSheetByName("Sheet1");
  if (padrao && padrao.getLastRow() === 0 && padrao.getLastColumn() === 0) {
    ss.deleteSheet(padrao);
  }
  var abertas = ss.getSheetByName("Abertas");
  if (abertas.getLastRow() === 0) {
    abertas.getRange(1, 1, 1, 4).setValues([["Fase", "Pergunta", "Participante", "Resposta"]]);
    abertas.setFrozenRows(1);
  }
}

/**
 * Garante o cabeçalho da aba da fase. Na primeira vez, escreve tudo a partir de `colunas`.
 * Nas próximas, só acrescenta colunas novas no fim (nunca reordena o que já existe).
 * Retorna a ordem de ids de coluna (índice = posição na planilha, a partir da 4ª coluna).
 */
function garantirColunas_(ss, nomeAba, fase, colunas) {
  var props = PropertiesService.getScriptProperties();
  var chave = "ORDEM_" + fase;
  var ordem = JSON.parse(props.getProperty(chave) || "[]");
  var aba = ss.getSheetByName(nomeAba);

  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, COLUNAS_FIXAS.length).setValues([COLUNAS_FIXAS]);
    aba.setFrozenRows(1);
    ordem = [];
  }

  var novas = colunas.filter(function (c) { return ordem.indexOf(c.id) === -1; });
  if (novas.length) {
    var inicioCol = COLUNAS_FIXAS.length + ordem.length + 1;
    aba.getRange(1, inicioCol, 1, novas.length).setValues([novas.map(function (c) { return c.cabecalho; })]);
    ordem = ordem.concat(novas.map(function (c) { return c.id; }));
    props.setProperty(chave, JSON.stringify(ordem));
    regerarResumo_(ss, fase, colunas);
  }
  return ordem;
}

function carregarMapaUids_(fase) {
  var raw = PropertiesService.getScriptProperties().getProperty("MAPA_" + fase);
  return raw ? JSON.parse(raw) : {};
}
function salvarMapaUids_(fase, mapa) {
  PropertiesService.getScriptProperties().setProperty("MAPA_" + fase, JSON.stringify(mapa));
}

function codigoParticipante_(mapa, uid) {
  if (mapa[uid]) return mapa[uid];
  var n = Object.keys(mapa).length + 1;
  var codigo = "P" + ("000" + n).slice(-3);
  mapa[uid] = codigo;
  return codigo;
}

function formatarData_(ms) {
  if (!ms) return "";
  return Utilities.formatDate(new Date(ms), "America/Campo_Grande", "dd/MM/yyyy HH:mm");
}

function upsertParticipante_(ss, nomeAba, ordem, mapa, fase, p) {
  var aba = ss.getSheetByName(nomeAba);
  var codigo = codigoParticipante_(mapa, p.uid);
  var lastRow = aba.getLastRow();
  var linhaAlvo = -1;
  if (lastRow > 1) {
    var idsColuna = aba.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < idsColuna.length; i++) {
      if (idsColuna[i][0] === codigo) { linhaAlvo = i + 2; break; }
    }
  }
  if (linhaAlvo === -1) linhaAlvo = lastRow + 1;

  var linhaValores = [codigo, formatarData_(p.entrouEm), formatarData_(p.concluiuEm)];
  ordem.forEach(function (id) {
    var v = p.respostas && p.respostas[id] != null ? p.respostas[id] : "";
    linhaValores.push(v);
  });
  aba.getRange(linhaAlvo, 1, 1, linhaValores.length).setValues([linhaValores]);
  return linhaAlvo;
}

/** Reescreve as linhas "Abertas" deste participante (evita duplicar em ressync). */
function atualizarAbertas_(ss, fase, colunas, codigo, p) {
  if (!codigo) return;
  var abertas = ss.getSheetByName("Abertas");
  var rotuloFase = fase === "fase1" ? "Fase 1" : "Fase 2";
  var lastRow = abertas.getLastRow();
  if (lastRow > 1) {
    var dados = abertas.getRange(2, 1, lastRow - 1, 3).getValues();
    for (var i = dados.length - 1; i >= 0; i--) {
      if (dados[i][0] === rotuloFase && dados[i][2] === codigo) abertas.deleteRow(i + 2);
    }
  }
  var novasLinhas = [];
  colunas.filter(function (c) { return c.tipo === "aberta"; }).forEach(function (c) {
    var v = p.respostas && p.respostas[c.id];
    if (v) novasLinhas.push([rotuloFase, c.cabecalho, codigo, v]);
  });
  if (novasLinhas.length) {
    abertas.getRange(abertas.getLastRow() + 1, 1, novasLinhas.length, 4).setValues(novasLinhas);
  }
}

/** Gera as fórmulas do Resumo (contagem/% nas fechadas, média nas escalas). Roda quando colunas mudam. */
function regerarResumo_(ss, fase, colunas) {
  var nomeAba = fase === "fase1" ? "Fase 1" : "Fase 2";
  var nomeResumo = fase === "fase1" ? "Resumo Fase 1" : "Resumo Fase 2";
  var resumo = ss.getSheetByName(nomeResumo);
  resumo.clear();
  var linhas = [["Pergunta", "Opção / Item", "Contagem ou Média", "% (nas fechadas)"]];
  var colIndex = COLUNAS_FIXAS.length + 1; // 1-based, primeira coluna de pergunta

  colunas.forEach(function (c) {
    var letra = colunaParaLetra_(colIndex);
    var faixa = "'" + nomeAba + "'!" + letra + "2:" + letra + "9999";
    if (c.tipo === "unica" && c.opcoes) {
      c.opcoes.forEach(function (op) {
        linhas.push([
          c.cabecalho, op,
          "=COUNTIF(" + faixa + ",\"" + op.replace(/"/g, '""') + "\")",
          "=IFERROR(COUNTIF(" + faixa + ",\"" + op.replace(/"/g, '""') + "\")/COUNTA(" + faixa + "),\"\")",
        ]);
      });
    } else if (c.tipo === "multipla" && c.opcoes) {
      c.opcoes.forEach(function (op) {
        linhas.push([
          c.cabecalho, op,
          "=SUMPRODUCT(--ISNUMBER(SEARCH(\"" + op.replace(/"/g, '""') + "\"," + faixa + ")))",
          "",
        ]);
      });
    } else if (c.tipo === "escala") {
      linhas.push([c.cabecalho, "Média (1–5)", "=IFERROR(AVERAGE(" + faixa + "),\"\")", ""]);
      linhas.push([c.cabecalho, "Não sei avaliar", "=COUNTIF(" + faixa + ",\"Não sei\")", ""]);
    }
    colIndex++;
  });

  if (linhas.length > 1) resumo.getRange(1, 1, linhas.length, 4).setValues(linhas);
  resumo.setFrozenRows(1);
}

function colunaParaLetra_(col) {
  var letra = "";
  while (col > 0) {
    var resto = (col - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    col = Math.floor((col - 1) / 26);
  }
  return letra;
}

/** Rodar manualmente uma vez, na primeira configuração, pra gerar o segredo. */
function gerarSegredo() {
  var s = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty("SEGREDO_SHEETS", s);
  Logger.log("Segredo gerado. Copie do log de execução (View → Logs) e cole no telão quando pedido: " + s);
}
