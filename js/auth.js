// ============================================================
// auth.js — Autenticação e sincronização com Supabase
// ============================================================

let usuarioAtual = null;

// ─── SESSÃO ──────────────────────────────────────────────────

async function inicializarSessao() {
  const { data: { session } } = await sb.auth.getSession();

  if (session) {
    usuarioAtual = session.user;
    await carregarDadosNuvem();
    mostrarApp();
  } else {
    mostrarTelaLogin();
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      usuarioAtual = session.user;
      await carregarDadosNuvem();
      mostrarApp();
    }
    if (event === "SIGNED_OUT") {
      usuarioAtual = null;
      mostrarTelaLogin();
    }
  });

  // Sincroniza automaticamente quando o app volta ao foco
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && usuarioAtual) {
      await carregarDadosNuvem();
      if (typeof carregar === "function") carregar();
      if (typeof renderizarTabelaHistorico === "function") renderizarTabelaHistorico();
      if (typeof renderizarGraficoPainel === "function") renderizarGraficoPainel();
      if (typeof renderizarGraficoNutricao === "function") renderizarGraficoNutricao();
    }
  });
}

async function sincronizarManual() {
  if (!usuarioAtual) return;
  const btn = document.querySelector(".btn-sync");
  if (btn) { btn.style.opacity = "0.4"; btn.style.pointerEvents = "none"; btn.textContent = "⏳"; }
  await carregarDadosNuvem();
  if (typeof carregar === "function") carregar();
  if (typeof renderizarTabelaHistorico === "function") renderizarTabelaHistorico();
  if (typeof renderizarGraficoPainel === "function") renderizarGraficoPainel();
  if (typeof renderizarGraficoNutricao === "function") renderizarGraficoNutricao();
  if (typeof atualizarKPIs === "function") atualizarKPIs();
  if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
  if (btn) { btn.style.opacity = "1"; btn.style.pointerEvents = "auto"; btn.textContent = "✓"; }
  setTimeout(() => { if (btn) btn.innerHTML = "&#x21bb;"; }, 2000);
}

function mostrarApp() {
  const telaLogin = document.getElementById("telaLogin");
  const appShell  = document.getElementById("appShell");
  if (telaLogin) telaLogin.style.display = "none";
  if (appShell)  appShell.style.display  = "block";

  const emailEl = document.getElementById("usuarioEmail");
  if (emailEl && usuarioAtual) emailEl.textContent = usuarioAtual.email;

  // Inicializa o app após dados da nuvem estarem no localStorage
  if (typeof carregar === "function") carregar();
  if (typeof renderizarGraficoPainel === "function") renderizarGraficoPainel();
  if (typeof renderizarGraficoNutricao === "function") renderizarGraficoNutricao();
  if (typeof renderizarTabelaHistorico === "function") renderizarTabelaHistorico();
  if (typeof inicializarAlimentos === "function") inicializarAlimentos();
  if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
}

function mostrarTelaLogin() {
  const telaLogin = document.getElementById("telaLogin");
  const appShell  = document.getElementById("appShell");
  if (telaLogin) telaLogin.style.display = "flex";
  if (appShell)  appShell.style.display  = "none";
  limparErroLogin();
}

// ─── LOGIN / CADASTRO / LOGOUT ───────────────────────────────

async function fazerLogin() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const senha = document.getElementById("loginSenha")?.value;
  if (!email || !senha) { mostrarErroLogin("Preencha e-mail e senha."); return; }

  mostrarLoadingLogin(true);
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  mostrarLoadingLogin(false);

  if (error) mostrarErroLogin(traduzirErro(error.message));
}

async function fazerCadastro() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const senha = document.getElementById("loginSenha")?.value;
  if (!email || !senha) { mostrarErroLogin("Preencha e-mail e senha."); return; }
  if (senha.length < 6)  { mostrarErroLogin("Senha mínima de 6 caracteres."); return; }

  mostrarLoadingLogin(true);
  const { error } = await sb.auth.signUp({ email, password: senha });
  mostrarLoadingLogin(false);

  if (error) {
    mostrarErroLogin(traduzirErro(error.message));
  } else {
    mostrarErroLogin("Cadastro realizado! Verifique seu e-mail para confirmar.", "success");
  }
}

async function fazerLogout() {
  await sb.auth.signOut();
  localStorage.clear();
  usuarioAtual = null;
  mostrarTelaLogin();
}

async function recuperarSenha() {
  const email = document.getElementById("loginEmail")?.value.trim();
  if (!email) { mostrarErroLogin("Digite seu e-mail para recuperar a senha."); return; }
  const { error } = await sb.auth.resetPasswordForEmail(email);
  if (error) mostrarErroLogin(traduzirErro(error.message));
  else mostrarErroLogin("Link de recuperação enviado para " + email, "success");
}

function traduzirErro(msg) {
  if (msg.includes("Invalid login")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("User already registered")) return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be")) return "Senha muito fraca. Use pelo menos 6 caracteres.";
  return msg;
}

function mostrarErroLogin(msg, tipo = "erro") {
  const el = document.getElementById("loginErro");
  if (!el) return;
  el.textContent = msg;
  el.className = "login-msg " + (tipo === "success" ? "login-ok" : "login-erro");
  el.style.display = "block";
}

function limparErroLogin() {
  const el = document.getElementById("loginErro");
  if (el) el.style.display = "none";
}

function mostrarLoadingLogin(show) {
  const btn = document.getElementById("btnEntrar");
  if (btn) btn.disabled = show;
  if (btn) btn.textContent = show ? "Entrando..." : "Entrar";
}

function alternarCadastro() {
  const area = document.getElementById("areaLogin");
  const area2 = document.getElementById("areaCadastro");
  if (!area || !area2) return;
  const loginVisivel = area.style.display !== "none";
  area.style.display  = loginVisivel ? "none"  : "flex";
  area2.style.display = loginVisivel ? "flex"  : "none";
  limparErroLogin();
}

// ─── SINCRONIZAÇÃO SUPABASE ──────────────────────────────────

async function carregarDadosNuvem() {
  if (!usuarioAtual) return;
  const uid = usuarioAtual.id;

  try {
    // Perfil
    const { data: perfil, error: ePerfil } = await sb.from("perfis").select("*").eq("id", uid).single();
    if (ePerfil) console.warn("Perfil:", ePerfil.message);
    if (perfil) {
      const p = { altura: perfil.altura, idade: perfil.idade, sexo: perfil.sexo };
      localStorage.setItem("perfil", JSON.stringify(p));
      if (perfil.nivel_atividade) localStorage.setItem("_nivelAtividade", perfil.nivel_atividade);
      if (perfil.objetivo)        localStorage.setItem("_objetivo", perfil.objetivo);
    }

    // Registros diários — MERGE: a versão mais recente de cada data vence
    const { data: registros, error: eReg } = await sb.from("registros_diarios").select("*").eq("user_id", uid);
    if (eReg) console.warn("Registros:", eReg.message);
    if (registros && registros.length > 0) {
      const dadosLocais = JSON.parse(localStorage.getItem("dados") || "[]");
      const mapaLocal = {};
      dadosLocais.forEach(r => { mapaLocal[r.data] = r; });

      registros.forEach(r => {
        const local = mapaLocal[r.data];
        // Só sobrescreve local se a nuvem for mais recente ou local não tiver o dado
        if (!local) {
          mapaLocal[r.data] = {
            data: r.data, peso: r.peso, glicose: r.glicose,
            ps: r.ps, pd: r.pd, imc: r.imc,
            nivelAtividade: r.nivel_atividade, objetivo: r.objetivo,
            energiaDia: r.energia_dia, proteinaDia: r.proteina_dia
          };
        }
      });

      const listaMerge = Object.values(mapaLocal);
      localStorage.setItem("dados", JSON.stringify(listaMerge));
    }

    // Refeições — MERGE por data+refeicao
    const { data: refeicoes, error: eRef } = await sb.from("refeicoes").select("*").eq("user_id", uid);
    if (eRef) console.warn("Refeições:", eRef.message);
    if (refeicoes && refeicoes.length > 0) {
      const bancoLocal = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}");
      refeicoes.forEach(r => {
        if (!bancoLocal[r.data]) bancoLocal[r.data] = {};
        // Só sobrescreve se local estiver vazio para essa data+refeição
        if (!bancoLocal[r.data][r.refeicao] || bancoLocal[r.data][r.refeicao].length === 0) {
          bancoLocal[r.data][r.refeicao] = r.itens || [];
        }
      });
      localStorage.setItem("refeicoesPorData", JSON.stringify(bancoLocal));
    }

    // Alimentos personalizados — só adiciona, nunca remove locais
    const { data: alimentos, error: eAlim } = await sb.from("alimentos_personalizados").select("*").eq("user_id", uid);
    if (eAlim) console.warn("Alimentos:", eAlim.message);
    if (alimentos && alimentos.length > 0) {
      const locais = JSON.parse(localStorage.getItem("alimentos") || "[]");
      const nomesLocais = new Set(locais.map(a => a.nome));
      alimentos.forEach(a => { if (!nomesLocais.has(a.nome)) locais.push(a); });
      localStorage.setItem("alimentos", JSON.stringify(locais));
    }

    console.log("Dados sincronizados com a nuvem.");
  } catch (e) {
    console.warn("Erro ao carregar nuvem:", e.message);
  }
}

async function sincronizarRegistroDiario(registro) {
  if (!usuarioAtual) return;
  const payload = {
    user_id:         usuarioAtual.id,
    data:            registro.data,
    peso:            registro.peso,
    glicose:         registro.glicose || null,
    ps:              registro.ps || null,
    pd:              registro.pd || null,
    imc:             registro.imc,
    nivel_atividade: registro.nivelAtividade,
    objetivo:        registro.objetivo,
    energia_dia:     registro.energiaDia  ?? null,
    proteina_dia:    registro.proteinaDia ?? null,
    updated_at:      new Date().toISOString()
  };
  const { error } = await sb.from("registros_diarios").upsert(payload, { onConflict: "user_id,data" });
  if (error) {
    console.error("Erro ao salvar registro diário:", error.message);
    // Tenta sem as colunas novas caso não existam ainda no banco
    if (error.message && error.message.includes("column")) {
      const { energia_dia, proteina_dia, ...payloadBasico } = payload;
      const { error: e2 } = await sb.from("registros_diarios").upsert(payloadBasico, { onConflict: "user_id,data" });
      if (e2) console.error("Erro no fallback:", e2.message);
    }
  }
}

async function sincronizarPerfil(perfil, nivelAtividade, objetivo) {
  if (!usuarioAtual) return;
  await sb.from("perfis").upsert({
    id:              usuarioAtual.id,
    altura:          perfil.altura || null,
    idade:           perfil.idade  || null,
    sexo:            perfil.sexo   || null,
    nivel_atividade: nivelAtividade || null,
    objetivo:        objetivo       || null,
    updated_at:      new Date().toISOString()
  }, { onConflict: "id" });
}

async function sincronizarRefeicao(data, nomeRefeicao, itens) {
  if (!usuarioAtual) return;
  await sb.from("refeicoes").upsert({
    user_id:     usuarioAtual.id,
    data:        data,
    refeicao:    nomeRefeicao,
    itens:       itens,
    updated_at:  new Date().toISOString()
  }, { onConflict: "user_id,data,refeicao" });
}

async function sincronizarAlimentosPersonalizados() {
  if (!usuarioAtual) return;
  const lista = JSON.parse(localStorage.getItem("alimentos") || "[]");
  if (!lista.length) return;
  const rows = lista.map(a => ({
    user_id:  usuarioAtual.id,
    nome:     a.nome,
    proteina: a.proteina,
    carbo:    a.carbo,
    gordura:  a.gordura,
    calorias: a.calorias,
    fonte:    "PERSONALIZADO"
  }));
  await sb.from("alimentos_personalizados").upsert(rows, { onConflict: "user_id,nome" });
}
