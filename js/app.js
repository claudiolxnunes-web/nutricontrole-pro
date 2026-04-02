function el(id) {
  return document.getElementById(id);
}

// Retorna data de hoje no fuso de Brasilia (AAAA-MM-DD)
// sv-SE produz formato ISO nativamente via Intl — sem ajuste manual de UTC
function hojeISO() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

function formatarData(dataISO) {
  if (!dataISO) return "-";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function trocarTela(telaId, botao) {
  document.querySelectorAll(".tela").forEach(t => {
    t.style.display = "none";
  });

  const alvo = el(telaId);
  if (alvo) alvo.style.display = "block";

  document.querySelectorAll(".tab").forEach(t => {
    t.classList.remove("active");
  });

  if (botao) botao.classList.add("active");

  if (telaId === "glicemia") renderizarTabelaHistorico();
  if (telaId === "painel") {
    if (typeof renderizarGraficoPainel === "function") renderizarGraficoPainel();
    if (typeof renderizarGraficoNutricao === "function") renderizarGraficoNutricao();
    if (typeof atualizarKPIs === "function") atualizarKPIs();
  }
  if (telaId === "diario") {
    if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
    if (typeof atualizarKPIs === "function") atualizarKPIs();
  }
}

function calcularIMC(p, a) {
  if (!p || !a) return 0;
  return p / ((a / 100) * (a / 100));
}

function classificarIMC(i) {
  if (!i || i <= 0) return "-";
  if (i < 18.5) return "Abaixo do peso";
  if (i < 25) return "Normal";
  if (i < 30) return "Sobrepeso";
  if (i < 35) return "Obesidade grau I";
  if (i < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

function atualizarResumo(imc) {
  const imcEl = el("imc");
  const classEl = el("classificacao");

  if (!imc || imc <= 0) {
    if (imcEl) imcEl.innerText = "-";
    if (classEl) classEl.innerText = "-";
    return;
  }

  if (imcEl) imcEl.innerText = imc.toFixed(2);
  if (classEl) classEl.innerText = classificarIMC(imc);
}

// --- Perfil permanente (altura, idade, sexo) ---

function salvarPerfil() {
  const perfil = {
    altura: el("altura")?.value || "",
    idade:  el("idade")?.value  || "",
    sexo:   el("sexo")?.value   || ""
  };
  localStorage.setItem("perfil", JSON.stringify(perfil));
}

function carregarPerfil() {
  const perfil = JSON.parse(localStorage.getItem("perfil") || "{}");
  if (el("altura") && perfil.altura) el("altura").value = perfil.altura;
  if (el("idade")  && perfil.idade)  el("idade").value  = perfil.idade;
  if (el("sexo")   && perfil.sexo)   el("sexo").value   = perfil.sexo;
}

// --- Metas ---

function atualizarMetas() {
  const peso   = parseFloat(el("peso")?.value   || 0);
  const altura = parseFloat(el("altura")?.value  || 0);
  const idade  = parseFloat(el("idade")?.value   || 0);
  const sexo   = el("sexo")?.value || "";
  const nivelAtividade = el("nivelAtividade")?.value || "sedentario";
  const objetivo       = el("objetivo")?.value       || "manter";

  const multiplicadores = {
    sedentario: 1.2,
    leve:       1.375,
    moderado:   1.55,
    alto:       1.725,
    muito_alto: 1.9
  };

  const ajusteObjetivo = {
    perder_gordura: -600,
    manter:          0,
    ganhar_massa:  250
  };

  const proteinaPorKg = {
    perder_gordura: 1.4,
    manter:         1.2,
    ganhar_massa:   1.6
  };

  const metaProtManual = localStorage.getItem("metaProteinaManual");
  const metaKcalManual = localStorage.getItem("metaEnergiaManual");

  let metaProt = 0;
  let metaKcal = 0;

  if (peso > 0) {
    let bmr;

    if (altura > 0 && idade > 0 && sexo) {
      // Mifflin-St Jeor (1990) — validada pela ADA
      // Masculino: 10×peso + 6.25×altura(cm) − 5×idade + 5
      // Feminino:  10×peso + 6.25×altura(cm) − 5×idade − 161
      bmr = sexo === "masculino"
        ? 10 * peso + 6.25 * altura - 5 * idade + 5
        : 10 * peso + 6.25 * altura - 5 * idade - 161;
    } else {
      bmr = peso * 20;
    }

    const tdee     = bmr * (multiplicadores[nivelAtividade] || 1.2);
    const ajustado = tdee + (ajusteObjetivo[objetivo] || 0);
    const piso     = sexo === "masculino" ? 1500 : 1200;
    metaKcal = Math.round(Math.max(ajustado, piso));
    metaProt = Math.round(peso * (proteinaPorKg[objetivo] || 1.2));
  }

  if (metaProtManual && Number(metaProtManual) > 0) metaProt = Number(metaProtManual);
  if (metaKcalManual && Number(metaKcalManual) > 0) metaKcal = Number(metaKcalManual);

  localStorage.setItem("metaProteinaCalculada", metaProt);
  localStorage.setItem("metaEnergiaCalculada",  metaKcal);

  if (el("metaProteinaTexto")) el("metaProteinaTexto").innerText = `${metaProt} g`;
  if (el("metaEnergiaTexto"))  el("metaEnergiaTexto").innerText  = `${metaKcal} kcal`;

  if (typeof atualizarKPIs === "function") atualizarKPIs();
}

// --- Histórico ---

function renderizarTabelaHistorico() {
  const tbody = document.querySelector("#tabelaHistorico tbody");
  if (!tbody) return;

  const dados = JSON.parse(localStorage.getItem("dados") || "[]");
  dados.sort((a, b) => b.data.localeCompare(a.data));

  tbody.innerHTML = "";

  if (!dados.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  dados.forEach(item => {
    const tr = document.createElement("tr");
    const pressao = item.ps && item.pd ? `${item.ps}/${item.pd}` : "-";
    const imc = item.imc ? Number(item.imc).toFixed(2) : "-";
    tr.innerHTML = `
      <td>${formatarData(item.data)}</td>
      <td>${item.peso ? Number(item.peso).toFixed(1) + " kg" : "-"}</td>
      <td>${imc}</td>
      <td>${item.glicose ? item.glicose + " mg/dL" : "-"}</td>
      <td>${pressao}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Salvar / Carregar ---

function salvar() {
  const campoData = el("dataRegistro");
  let data = campoData?.value || "";

  if (!data) {
    data = hojeISO();
    if (campoData) campoData.value = data;
  }

  const peso   = parseFloat(el("peso")?.value || 0);
  const altura = parseFloat(el("altura")?.value || 0);
  const glicose = el("glicose")?.value || "";
  const ps      = el("ps")?.value || "";
  const pd      = el("pd")?.value || "";
  const nivelAtividade = el("nivelAtividade")?.value || "sedentario";
  const objetivo       = el("objetivo")?.value       || "manter";

  const imc = calcularIMC(peso, altura);

  // Calcula consumo de energia e proteína do dia a partir das refeições.
  // INVARIANTE: em meals.js > confirmarAlimento(), os campos "calorias" e "proteina"
  // são armazenados já multiplicados pela quantidade informada pelo usuário
  // (valor_tabela * quantidade / 100). Portanto a soma abaixo NÃO divide novamente.
  // Se meals.js mudar para armazenar valores brutos por 100 g, ajustar aqui.
  const bancoDia = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}")[data] || {};
  let totalKcal = 0, totalProt = 0;
  Object.values(bancoDia).forEach(lista => lista.forEach(item => {
    totalKcal += Number(item.calorias || 0);
    totalProt  += Number(item.proteina || 0);
  }));
  const energiaDia = parseFloat(totalKcal.toFixed(1));
  const proteinaDia = parseFloat(totalProt.toFixed(1));

  const registro = { data, peso, altura, glicose, ps, pd, nivelAtividade, objetivo, imc, energiaDia, proteinaDia };

  const dados = JSON.parse(localStorage.getItem("dados") || "[]");
  const idx = dados.findIndex(item => item.data === data);

  if (idx >= 0) {
    dados[idx] = registro;
  } else {
    dados.push(registro);
  }

  localStorage.setItem("dados", JSON.stringify(dados));

  salvarPerfil();
  if (typeof sincronizarRegistroDiario === "function") sincronizarRegistroDiario(registro);
  if (typeof sincronizarPerfil === "function") {
    const perfil = JSON.parse(localStorage.getItem("perfil") || "{}");
    sincronizarPerfil(perfil, registro.nivelAtividade, registro.objetivo);
  }
  atualizarResumo(imc);
  atualizarMetas();

  if (typeof renderizarGraficoPainel === "function") renderizarGraficoPainel();

  alert("Dados do dia salvos com sucesso.");
}

function atualizarSpanData(iso) {
  const span = document.getElementById("dataFormatada");
  if (span) span.textContent = formatarData(iso);
}
function carregar() {
  const campoData = el("dataRegistro");
  const hoje = hojeISO();

  if (campoData && !campoData.value) {
    campoData.value = hoje;
     atualizarSpanData(campoData?.value || hoje); 
  }

  carregarPerfil();

  const dados = JSON.parse(localStorage.getItem("dados") || "[]");
  const dataAtual = campoData?.value || hoje;
  const registro = dados.find(item => item.data === dataAtual);

  if (registro) {
    if (el("peso"))           el("peso").value           = registro.peso   || "";
    if (el("glicose"))        el("glicose").value        = registro.glicose || "";
    if (el("ps"))             el("ps").value             = registro.ps || "";
    if (el("pd"))             el("pd").value             = registro.pd || "";
    if (el("nivelAtividade")) el("nivelAtividade").value = registro.nivelAtividade || "sedentario";
    if (el("objetivo"))       el("objetivo").value       = registro.objetivo || "manter";
    // Se o registro histórico contiver altura (dados legados), prevalece sobre o perfil
    if (registro.altura && el("altura")) el("altura").value = registro.altura;

    atualizarResumo(Number(registro.imc || 0));
  } else {
    if (el("peso")) el("peso").value = "";
    if (el("glicose")) el("glicose").value = "";
    if (el("ps")) el("ps").value = "";
    if (el("pd")) el("pd").value = "";
    atualizarResumo(0);
  }

  atualizarMetas();

  if (typeof atualizarKPIs === "function") atualizarKPIs();
  if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
}

function salvarMetasManuais() {
  const metaProt = el("metaProteinaManual")?.value || "";
  const metaKcal = el("metaEnergiaManual")?.value  || "";

  localStorage.setItem("metaProteinaManual", metaProt);
  localStorage.setItem("metaEnergiaManual",  metaKcal);

  atualizarMetas();
  alert("Metas salvas.");
}

document.addEventListener("DOMContentLoaded", function () {
  const metaProtManual = localStorage.getItem("metaProteinaManual");
  const metaKcalManual = localStorage.getItem("metaEnergiaManual");
  if (el("metaProteinaManual") && metaProtManual) el("metaProteinaManual").value = metaProtManual;
  if (el("metaEnergiaManual")  && metaKcalManual) el("metaEnergiaManual").value  = metaKcalManual;

  // Campos do dia — atualizam IMC e metas em tempo real
  ["peso", "nivelAtividade", "objetivo"].forEach(id => {
    const campo = el(id);
    if (!campo) return;
    const atualizar = () => {
      const peso   = parseFloat(el("peso")?.value   || 0);
      const altura = parseFloat(el("altura")?.value  || 0);
      atualizarResumo(calcularIMC(peso, altura));
      atualizarMetas();
    };
    campo.addEventListener("input",  atualizar);
    campo.addEventListener("change", atualizar);
  });

  // Campos de perfil — salvam automaticamente ao sair do campo
  ["altura", "idade", "sexo"].forEach(id => {
    const campo = el(id);
    if (!campo) return;
    const atualizarPerfil = () => {
      salvarPerfil();
      const peso   = parseFloat(el("peso")?.value   || 0);
      const altura = parseFloat(el("altura")?.value  || 0);
      atualizarResumo(calcularIMC(peso, altura));
      atualizarMetas();
    };
    campo.addEventListener("change", atualizarPerfil);
    campo.addEventListener("blur",   atualizarPerfil);
  });

  const campoData = el("dataRegistro");
  if (campoData) campoData.addEventListener("change", carregar);
  // carregar() e renderizações iniciais são chamados por mostrarApp() em auth.js
  // para garantir que os dados da nuvem já estejam no localStorage antes
});
