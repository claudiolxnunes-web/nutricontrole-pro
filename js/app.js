function el(id) {
  return document.getElementById(id);
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
}

function calcularIMC(p, a) {
  if (!p || !a) return 0;
  return p / (a * a);
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
  const imcEl = document.getElementById("imc");
  const classEl = document.getElementById("classificacao");

  if (!imc || imc <= 0) {
    if (imcEl) imcEl.innerText = "-";
    if (classEl) classEl.innerText = "-";
    return;
  }

  if (imcEl) imcEl.innerText = imc.toFixed(2);
  if (classEl) classEl.innerText = classificarIMC(imc);
}

function salvar() {
  const campoData = document.getElementById("dataRegistro");
  let data = campoData?.value || "";

  if (!data) {
    data = new Date().toISOString().split("T")[0];
    if (campoData) campoData.value = data;
  }

  const peso = parseFloat(document.getElementById("peso")?.value || 0);
  const altura = parseFloat(document.getElementById("altura")?.value || 0);
  const glicose = document.getElementById("glicose")?.value || "";
  const ps = document.getElementById("ps")?.value || "";
  const pd = document.getElementById("pd")?.value || "";
  const nivelAtividade = document.getElementById("nivelAtividade")?.value || "sedentario";
  const objetivo = document.getElementById("objetivo")?.value || "manter";

  const imc = calcularIMC(peso, altura);

  const registro = {
    data,
    peso,
    altura,
    glicose,
    ps,
    pd,
    nivelAtividade,
    objetivo,
    imc
  };

  const dados = JSON.parse(localStorage.getItem("dados") || "[]");
  const idx = dados.findIndex(item => item.data === data);

  if (idx >= 0) {
    dados[idx] = registro;
  } else {
    dados.push(registro);
  }

  localStorage.setItem("dados", JSON.stringify(dados));

  atualizarResumo(imc);

  if (typeof atualizarMetas === "function") {
    atualizarMetas();
  }

  console.log("Registro salvo:", registro);
  alert("Dados do dia salvos com sucesso.");
}

function carregar() {
  const campoData = document.getElementById("dataRegistro");
  let hoje = new Date().toISOString().split("T")[0];

  if (campoData && !campoData.value) {
    campoData.value = hoje;
  }

  const dados = JSON.parse(localStorage.getItem("dados") || "[]");
  const dataAtual = campoData?.value || hoje;
  const registro = dados.find(item => item.data === dataAtual);

  if (registro) {
    if (document.getElementById("peso")) document.getElementById("peso").value = registro.peso || "";
    if (document.getElementById("altura")) document.getElementById("altura").value = registro.altura || "";
    if (document.getElementById("glicose")) document.getElementById("glicose").value = registro.glicose || "";
    if (document.getElementById("ps")) document.getElementById("ps").value = registro.ps || "";
    if (document.getElementById("pd")) document.getElementById("pd").value = registro.pd || "";
    if (document.getElementById("nivelAtividade")) document.getElementById("nivelAtividade").value = registro.nivelAtividade || "sedentario";
    if (document.getElementById("objetivo")) document.getElementById("objetivo").value = registro.objetivo || "manter";

    atualizarResumo(Number(registro.imc || 0));
  } else {
    atualizarResumo(0);
  }

  if (typeof atualizarMetas === "function") {
    atualizarMetas();
  }
}
  alert("Dia salvo com sucesso.");


function salvarMetasManuais() {
  const metaProt = el("metaProteinaManual")?.value || "";
  const metaKcal = el("metaEnergiaManual")?.value || "";

  localStorage.setItem("metaProteinaManual", metaProt);
  localStorage.setItem("metaEnergiaManual", metaKcal);

  alert("Metas salvas.");
}

function carregar() {
  const hoje = new Date().toISOString().split("T")[0];

  if (el("dataRegistro") && !el("dataRegistro").value) {
    el("dataRegistro").value = hoje;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  ["peso", "altura", "nivelAtividade", "objetivo"].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.addEventListener("input", function () {
        const peso = parseFloat(document.getElementById("peso")?.value || 0);
        const altura = parseFloat(document.getElementById("altura")?.value || 0);
        const imc = calcularIMC(peso, altura);
        atualizarResumo(imc);

        if (typeof atualizarMetas === "function") {
          atualizarMetas();
        }
      });

      campo.addEventListener("change", function () {
        const peso = parseFloat(document.getElementById("peso")?.value || 0);
        const altura = parseFloat(document.getElementById("altura")?.value || 0);
        const imc = calcularIMC(peso, altura);
        atualizarResumo(imc);

        if (typeof atualizarMetas === "function") {
          atualizarMetas();
        }
      });
    }
  });

  const campoData = document.getElementById("dataRegistro");
  if (campoData) {
    campoData.addEventListener("change", carregar);
  }

  carregar();
});