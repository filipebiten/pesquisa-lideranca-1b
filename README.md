# Pesquisa ao vivo — Liderança 1B

App estático (sem build) para as duas pesquisas do Colégio Pastoral: respostas pelo celular, resultados ao vivo no telão, espelho automático numa planilha Google Sheets. Hospedado no GitHub Pages.

## Os 4 links oficiais

| | Fase 1 | Fase 2 |
|---|---|---|
| Celular (vai no QR) | `?view=responder&fase=fase1` | `?view=responder&fase=fase2` |
| Telão (abre no notebook) | `?view=telao&fase=fase1` | `?view=telao&fase=fase2` |

Base: `https://filipebiten.github.io/pesquisa-lideranca-1b/`

## Os 4 links de teste

Iguais aos de cima, com `&sessao=teste` no final. Gravam num lugar separado no banco — nunca aparecem na planilha nem se misturam com a sessão oficial.

Simulador (só na sessão teste, pra ver o telão cheio):
`?view=simular&fase=fase1&sessao=teste&n=30`

## Roteiro do dia

1. Abra o telão da Fase 1 (link acima) no notebook, projete. Primeira tela: QR gigante + contador de quem entrou.
2. Todos respondem no celular, cada um no seu ritmo.
3. Aperte **A** pra abrir a votação. Aperte **→** pra sair do QR e ir mostrando as perguntas com respostas chegando ao vivo.
4. Antes do relatório, aperte **F** duas vezes pra encerrar a Fase 1 (quem ainda estiver respondendo vê "Pesquisa encerrada").
5. Relatório apresentado.
6. Abra o telão da Fase 2, aperte **A**, mesmo ciclo.

## Teclas do telão

| Tecla | Ação |
|---|---|
| → / PageDown / Espaço | Próxima tela |
| ← / PageUp | Tela anterior |
| Q | Voltar ao QR |
| ↑ / ↓ | Rolar a lista de respostas abertas |
| H | Esconder/mostrar respostas abertas (emergência; padrão é visível) |
| A | Abrir a pesquisa desta fase |
| F (duas vezes) | Encerrar a pesquisa desta fase |
| S | Forçar ressincronização com o Sheets |
| ? | Mostrar/ocultar a legenda de teclas |

Clique uma vez na tela pra entrar em tela cheia.

## Autorizar um telão novo (sem senha)

Na primeira vez que abrir `?view=telao` num navegador, ele mostra um ID e pede pra você colar em `/operadores/<ID> = true` no console do Firebase (Realtime Database → aba Dados). Sem senha, sem usuário — só aquele navegador específico fica autorizado a ler as respostas. Faça isso uma vez por navegador/notebook que for operar o telão.

## Configurar o Google Sheets (uma vez)

1. Abra a planilha "COLEGIO PASTORAL - SETEMBRO 2026".
2. Extensões → Apps Script.
3. Apague o conteúdo padrão e cole tudo de `apps-script/Code.gs`.
4. Na barra de funções (topo), selecione `gerarSegredo` e clique em Executar. Autorize o acesso quando pedir.
5. Ver → Registros (Logs) — copie o segredo gerado (um código tipo UUID).
6. Implantar → Nova implantação → tipo "App da Web". Executar como "Eu", quem pode acessar "Qualquer pessoa". Implantar, copie a URL do Web App.
7. Cole essa URL em `js/config.js`, na constante `SHEETS_WEBAPP_URL`, e publique (commit + push).
8. Na primeira vez que o telão te pedir o "segredo do Sheets", cole o UUID do passo 5. Fica salvo só naquele navegador.

A sincronização só roda com o telão aberto e a sessão oficial (nunca a de teste). Se alguém responder com o telão fechado, a planilha completa sozinha quando você reabrir o telão ou apertar **S**.

## Baixar o Excel

Na planilha: Arquivo → Fazer o download → Microsoft Excel (.xlsx).

## Apagar a sessão de teste

O app nunca apaga nada sozinho. Pra limpar os testes: Firebase Console → Realtime Database → navegue até `fases/fase1/teste` (e `fases/fase2/teste`) → menu (⋮) → Excluir.

## Checklist da véspera

- [ ] Testar no Wi-Fi do local do evento (não só em casa).
- [ ] Conferir que o notebook do telão está logado como operador (abrir os dois telões lá, uma vez).
- [ ] Conferir que o segredo do Sheets já foi colado nesse mesmo notebook.
- [ ] QR impresso de reserva (caso o notebook trave).
- [ ] Bateria/carregador do notebook e do celular que vai operar.
