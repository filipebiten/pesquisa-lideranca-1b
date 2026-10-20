# Pesquisa ao vivo — Liderança 1B — Roadmap

## Estado
App estático completo e funcional (GitHub Pages + Firebase Realtime DB + Google Sheets). Evento "Colégio Pastoral" já ocorreu (setembro 2026). Histórico de commits mostra bugs críticos já corrigidos (regra de status "aberta" por padrão, sincronização silenciosa, portão de autorização removido do telão).

## Feito automaticamente 2026-10-20
- Segunda revisão independente, código inteiro (`index.html`, `js/app.js`, `js/responder.js`, `js/telao.js`, `js/sheets.js`, `js/simular.js`, `apps-script/Code.gs`, `database.rules.json`, `.gitignore`), confirma a revisão anterior do mesmo dia: nenhum bug, falha de segurança ou problema de usabilidade.
- Checado especificamente: todo texto de usuário (respostas abertas, nuvem de palavras) passa por `esc()` antes de `innerHTML` em responder.js/telao.js/simular.js — sem XSS. Regras do Firebase restringem `.write` a `auth.uid === $uid` com fase não encerrada. Segredo do Sheets nunca vai pro repo (Script Properties no Apps Script + `localStorage` no navegador do operador). Script externo (qrcode.min.js) carregado com SRI (`integrity`).
- Nenhuma alteração de código feita; nada para commitar além deste roadmap.

## Feito automaticamente 2026-10-20 (terceira checagem, sessão separada)
- Terceira revisão independente (código + `apps-script/Code.gs` + `database.rules.json`): confirma as duas anteriores, nenhum achado novo. Segredo do Sheets validado no servidor (`doPost` rejeita sem `SEGREDO_SHEETS` batendo), nunca exposto no repo. `apiKey` do Firebase em `js/config.js` é público por natureza (protegido pelas regras do Realtime Database, não por sigilo da chave).
- Commit pendente de ROADMAP.md (revisão anterior) estava só local, não publicado no GitHub — enviado (`git push`) nesta sessão.

## Pendente (decisão do Filipe)
- Projeto parece encerrado (evento já realizado). Confirmar se arquiva ou mantém ativo pra reuso em pesquisa futura.
- Se reuso futuro: teclas/roteiro do telão já documentados no README, nenhuma ação necessária agora.
