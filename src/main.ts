type Usuario = { id: number; nome: string; email: string; senha: string; papel: "Professor" | "Secretaria" };
type Sala = { id: number; nome: string; ocupada: boolean; professor: string };

const usuarios: Usuario[] = [
  { id: 1, nome: "Carlos Silva", email: "carlos@professor.escola.com", senha: "prof123", papel: "Professor" },
  { id: 2, nome: "Ana Souza", email: "ana@secretaria.escola.com", senha: "sec123", papel: "Secretaria" }
];
const salasIniciais: Sala[] = [
  { id: 1, nome: "Sala 01", ocupada: false, professor: "" }, { id: 2, nome: "Sala 02", ocupada: true, professor: "Prof. Mario" },
  { id: 3, nome: "Sala 03", ocupada: false, professor: "" }, { id: 4, nome: "Sala 04", ocupada: false, professor: "" },
  { id: 5, nome: "Sala 05", ocupada: true, professor: "Profa. Marina" }, { id: 6, nome: "Sala 06", ocupada: false, professor: "" },
  { id: 7, nome: "LaboratÃ³rio 01", ocupada: true, professor: "Prof. Rafael" }, { id: 8, nome: "LaboratÃ³rio 02", ocupada: false, professor: "" },
  { id: 9, nome: "InformÃ¡tica 01", ocupada: true, professor: "Profa. Helena" }, { id: 10, nome: "InformÃ¡tica 02", ocupada: false, professor: "" }
];
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const login = $("tela-login"), painel = $("painel"), formLogin = $("form-login") as HTMLFormElement;
const email = $("email") as HTMLInputElement, senha = $("senha") as HTMLInputElement;
const erro = $("erro"), usuarioLogado = $("usuario-logado"), btnEntrar = $("btn-entrar"), btnSair = $("btn-sair");
const salasEl = $("salas"), formSala = $("form-sala") as HTMLFormElement;
let usuarioAtual: Usuario | null = null;
let salas: Sala[];
let cliquesIntegrantes = 0;
try { salas = JSON.parse(localStorage.getItem("salas-escola") || "null") || salasIniciais; } catch { salas = salasIniciais; }

function mostrarPagina(pagina: "salas" | "equipe") {
  $("pagina-salas").classList.toggle("hidden", pagina !== "salas");
  $("pagina-equipe").classList.toggle("hidden", pagina !== "equipe");
  document.querySelectorAll<HTMLElement>("[data-pagina]").forEach((b) => b.setAttribute("aria-current", b.dataset.pagina === pagina ? "page" : "false"));
}
document.querySelectorAll<HTMLElement>("[data-pagina]").forEach((b) => b.addEventListener("click", () => mostrarPagina(b.dataset.pagina as "salas" | "equipe")));
document.querySelectorAll<HTMLElement>("#integrantes article").forEach((integrante) => {
  const contarClique = () => {
    cliquesIntegrantes += 1;
    if (cliquesIntegrantes >= 7) $("nome-secreto").classList.remove("hidden");
  };
  integrante.addEventListener("click", contarClique);
  integrante.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); contarClique(); }
  });
});
function atualizarAcesso() {
  usuarioLogado.textContent = usuarioAtual ? `${usuarioAtual.nome} (${usuarioAtual.papel})` : "";
  usuarioLogado.classList.toggle("hidden", !usuarioAtual);
  btnSair.classList.toggle("hidden", !usuarioAtual); btnEntrar.classList.toggle("hidden", !!usuarioAtual);
  $("gerenciar-salas").classList.toggle("hidden", !usuarioAtual);
  desenharSalas();
}
btnEntrar.addEventListener("click", () => { painel.classList.add("hidden"); login.classList.remove("hidden"); email.focus(); });
$("btn-voltar").addEventListener("click", () => { formLogin.reset(); erro.textContent = ""; login.classList.add("hidden"); painel.classList.remove("hidden"); });
formLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  const credencial = usuarios.find((u) => u.email === email.value.trim().toLowerCase() && u.senha === senha.value);
  if (!credencial) { erro.textContent = "E-mail ou senha incorretos. Use uma conta institucional autorizada."; return; }
  usuarioAtual = credencial; sessionStorage.setItem("usuarioId", String(credencial.id));
  erro.textContent = ""; formLogin.reset(); login.classList.add("hidden"); painel.classList.remove("hidden"); atualizarAcesso();
});
btnSair.addEventListener("click", () => { usuarioAtual = null; sessionStorage.removeItem("usuarioId"); atualizarAcesso(); });

function persistirSalas() { localStorage.setItem("salas-escola", JSON.stringify(salas)); }
function desenharSalas() {
  salasEl.replaceChildren();
  salas.forEach((sala) => {
    const card = document.createElement("article");
    card.className = `bg-white rounded-lg shadow p-6 border-l-8 ${sala.ocupada ? "border-red-500" : "border-green-500"}`;
    const nome = document.createElement("h3"); nome.className = "text-xl font-bold"; nome.textContent = sala.nome;
    const status = document.createElement("p"); status.className = `mt-4 text-lg font-semibold ${sala.ocupada ? "text-red-600" : "text-green-600"}`;
    status.textContent = sala.ocupada ? "â— Ocupada" : "â— DisponÃ­vel"; card.append(nome, status);
    if (sala.ocupada && sala.professor) { const prof = document.createElement("p"); prof.className = "mt-2 text-gray-700"; prof.textContent = `Professor: ${sala.professor}`; card.append(prof); }
    if (usuarioAtual) {
      const actions = document.createElement("div"); actions.className = "mt-4 flex gap-2";
      const edit = document.createElement("button"); edit.type = "button"; edit.textContent = "Editar"; edit.className = "rounded bg-blue-700 px-3 py-2 text-white";
      edit.addEventListener("click", () => {
        const novoNome = prompt("Nome da sala:", sala.nome); if (novoNome === null) return;
        const nomeLimpo = novoNome.trim(); if (nomeLimpo.length < 2) { alert("Informe um nome com pelo menos 2 caracteres."); return; }
        if (salas.some((s) => s.id !== sala.id && s.nome.toLocaleLowerCase() === nomeLimpo.toLocaleLowerCase())) { alert("JÃ¡ existe uma sala com esse nome."); return; }
        sala.nome = nomeLimpo;
        const ocupada = confirm("A sala estÃ¡ ocupada? Selecione Cancelar para disponÃ­vel."); sala.ocupada = ocupada;
        sala.professor = ocupada ? (prompt("Professor responsÃ¡vel:", sala.professor) || "").trim() : "";
        persistirSalas(); desenharSalas();
      });
      const del = document.createElement("button"); del.type = "button"; del.textContent = "Excluir"; del.className = "rounded bg-red-700 px-3 py-2 text-white";
      del.addEventListener("click", () => { if (confirm(`Excluir ${sala.nome}?`)) { salas = salas.filter((s) => s.id !== sala.id); persistirSalas(); desenharSalas(); } });
      actions.append(edit, del); card.append(actions);
    }
    salasEl.append(card);
  });
}
formSala.addEventListener("submit", (event) => {
  event.preventDefault(); if (!usuarioAtual) return;
  const nomeInput = $("nome-sala") as HTMLInputElement; const nome = nomeInput.value.trim();
  if (nome.length < 2) { nomeInput.setCustomValidity("Informe ao menos 2 caracteres."); nomeInput.reportValidity(); return; }
  nomeInput.setCustomValidity("");
  if (salas.some((s) => s.nome.toLocaleLowerCase() === nome.toLocaleLowerCase())) { nomeInput.setCustomValidity("JÃ¡ existe uma sala com esse nome."); nomeInput.reportValidity(); return; }
  salas.push({ id: Math.max(0, ...salas.map((s) => s.id)) + 1, nome, ocupada: false, professor: "" });
  persistirSalas(); formSala.reset(); desenharSalas();
});

const idSalvo = sessionStorage.getItem("usuarioId");
usuarioAtual = usuarios.find((u) => String(u.id) === idSalvo) || null;
atualizarAcesso();

