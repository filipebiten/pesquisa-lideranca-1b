# Pesquisa ao vivo — Liderança 1B — Roadmap

## Estado
App estático completo e funcional (GitHub Pages + Firebase Realtime DB + Google Sheets). Evento "Colégio Pastoral" já ocorreu (setembro 2026). Histórico de commits mostra bugs críticos já corrigidos (regra de status "aberta" por padrão, sincronização silenciosa, portão de autorização removido do telão).

## Revisão automática — 2026-10-20
- Lidos todos os arquivos (README, `database.rules.json`, `js/config.js`, `js/sheets.js`).
- Regras do Firebase: `.write` restrito a `auth.uid === $uid` e só com fase não encerrada — adequado.
- `SHEETS_WEBAPP_URL` e `apiKey` do Firebase expostos no client são públicos por natureza (apiKey web não é segredo; URL do Apps Script exige secret separado salvo em `localStorage`) — nenhuma vulnerabilidade encontrada.
- Nenhum bug, falha de segurança ou problema de usabilidade identificado que justifique mudança de código.
- Nenhuma alteração feita; nada para commitar.

## Pendente (decisão do Filipe)
- Projeto parece encerrado (evento já realizado). Confirmar se arquiva ou mantém ativo pra reuso em pesquisa futura.
- Se reuso futuro: teclas/roteiro do telão já documentados no README, nenhuma ação necessária agora.
