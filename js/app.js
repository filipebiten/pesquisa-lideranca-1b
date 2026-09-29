// Núcleo: inicializa Firebase, autentica anônimo, decide a view pela URL
// e delega para responder.js / telao.js / simular.js.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getDatabase, ref, get, set, update, remove, onValue, off,
  serverTimestamp, runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

const params = new URLSearchParams(location.search);
const view = params.get("view") || "responder";
const fase = params.get("fase") === "fase2" ? "fase2" : "fase1";
const sessao = params.get("sessao") === "teste" ? "teste" : "oficial";
const n = parseInt(params.get("n") || "30", 10);

document.body.classList.add("v-" + view);

function caminho(...partes) {
  return ["fases", fase, sessao, ...partes].filter((p) => p !== undefined && p !== null).join("/");
}

const el = document.getElementById("app");

function erroFatal(msg) {
  el.innerHTML = `<div style="padding:24px;font-family:sans-serif;max-width:480px">${msg}</div>`;
}

if (view === "simular" && sessao !== "teste") {
  erroFatal("O simulador só roda com <code>&amp;sessao=teste</code>.");
} else {
  signInAnonymously(auth).catch((err) => {
    erroFatal("Erro de conexão com o Firebase: " + err.message);
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const ctx = {
      db, ref, get, set, update, remove, onValue, off, serverTimestamp, runTransaction,
      uid: user.uid, fase, sessao, caminho, view, el, params, n,
    };
    try {
      if (view === "responder") {
        const mod = await import("./responder.js");
        mod.init(ctx);
      } else if (view === "telao") {
        const mod = await import("./telao.js");
        mod.init(ctx);
      } else if (view === "simular") {
        const mod = await import("./simular.js");
        mod.init(ctx);
      } else {
        erroFatal("View desconhecida. Use ?view=responder ou ?view=telao.");
      }
    } catch (err) {
      erroFatal("Erro ao carregar o app: " + err.message);
      console.error(err);
    }
  });
}
