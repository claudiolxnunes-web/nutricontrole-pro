let refeicaoAtual = null;

const alimentosBase = [
  { nome: "Arroz", proteina: 2.5, carbo: 28, gordura: 0.3, calorias: 130, fonte: "BASE" },
  { nome: "Frango", proteina: 31, carbo: 0, gordura: 3.6, calorias: 165, fonte: "BASE" },
  { nome: "Ovo", proteina: 13, carbo: 1, gordura: 11, calorias: 155, fonte: "BASE" },
  { nome: "Carne bovina", proteina: 26, carbo: 0, gordura: 15, calorias: 250, fonte: "BASE" },
  { nome: "Banana", proteina: 1, carbo: 23, gordura: 0.3, calorias: 96, fonte: "BASE" }
];

function obterDataAtualRegistro() {
  const campo = document.getElementById("dataRegistro");
  return campo && campo.value ? campo.value : new Date().toISOString().split("T")[0];
}

function normalizarNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  const texto = String(valor).replace(",", ".").trim();
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : 0;
}

function obterFonteAtiva() {
  return localStorage.getItem("fonteAtivaAlimentos") || "todos";
}

function definirFonteAtiva() {
  const select = document.getElementById("fonteAlimentos");
  if (!select) return;

  localStorage.setItem("fonteAtivaAlimentos", select.value);
  atualizarListaAlimentos();
}

function trocarRefeicao(tipo, botao) {
  refeicaoAtual = tipo;

  document.querySelectorAll(".meal-tab").forEach(t => {
    t.classList.remove("active");
  });

  if (botao) botao.classList.add("active");

  if (typeof renderizarRefeicaoAtual === "function") {
    renderizarRefeicaoAtual();
  }
}

function renderizarRefeicaoAtual() {
  const alvo = document.getElementById("refeicaoContent");
  if (!alvo) return;

  const data = obterDataAtualRegistro();
  const banco = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}");
  const itens = banco[data]?.[refeicaoAtual] || [];

  alvo.innerHTML = `
    <div class="meal-box">
      <div class="field">
        <label for="buscaAlimento">Buscar alimento</label>
        <input id="buscaAlimento" type="text" placeholder="Digite..." oninput="filtrarAlimentos()">
      </div>

      <div class="field">
        <label for="selectAlimento">Alimentos</label>
        <select id="selectAlimento" size="8"></select>
      </div>

      <div class="field">
        <label for="quantidadeAlimento">Quantidade (g)</label>
        <input id="quantidadeAlimento" type="number" value="100">
      </div>

      <div class="action-row">
        <button onclick="confirmarAlimento()">Adicionar</button>
        <button onclick="mostrarCadastro()">Novo alimento</button>
      </div>

      <div id="cadastroAlimento" style="display:none; margin-top:15px;">
        <h3>Novo alimento</h3>
        <input id="novoNome" placeholder="Nome"><br><br>
        <input id="novoProt" placeholder="Proteína"><br><br>
        <input id="novoCarb" placeholder="Carbo"><br><br>
        <input id="novoGord" placeholder="Gordura"><br><br>
        <input id="novoCal" placeholder="Calorias"><br><br>
        <button onclick="salvarNovoAlimento()">Salvar alimento</button>
      </div>

      <div id="listaItensRefeicao" style="margin-top:20px;">
        ${
          itens.length
            ? `
              <h3>Itens da refeição</h3>
              <ul>
                ${itens.map(item => `
                  <li>${item.nome} - ${item.quantidade}g - ${item.proteina.toFixed(1)}g prot - ${item.calorias.toFixed(0)} kcal</li>
                `).join("")}
              </ul>
            `
            : "<p>Nenhum alimento adicionado nesta refeição.</p>"
        }
      </div>
    </div>
  `;

  atualizarListaAlimentos();
}

function mapearObjetoAlimento(obj, nomeArquivo = "") {
  const nomeArquivoLower = (nomeArquivo || "").toLowerCase();

  let fonte = "PERSONALIZADO";
  if (nomeArquivoLower.includes("taco")) fonte = "TACO";
  if (nomeArquivoLower.includes("tbca")) fonte = "TBCA";
  if (obj.fonte) fonte = String(obj.fonte).toUpperCase();

  const nome =
    obj.nome ||
    obj.Nome ||
    obj.alimento ||
    obj.Alimento ||
    obj.descricao ||
    obj.Descricao ||
    obj["Descrição"] ||
    "";

  return {
    nome: String(nome).trim(),
    proteina: normalizarNumero(
      obj.proteina ||
      obj.Proteina ||
      obj["Proteína"] ||
      obj["Proteina (g)"] ||
      obj["Proteína (g)"]
    ),
    carbo: normalizarNumero(
      obj.carbo ||
      obj.carboidrato ||
      obj.Carboidrato ||
      obj["Carboidrato (g)"] ||
      obj["Carboidratos (g)"]
    ),
    gordura: normalizarNumero(
      obj.gordura ||
      obj.Gordura ||
      obj.Lipidos ||
      obj["Lipídios"] ||
      obj["Lipidos (g)"] ||
      obj["Lipídios (g)"]
    ),
    calorias: normalizarNumero(
      obj.calorias ||
      obj.Calorias ||
      obj.energia ||
      obj.Energia ||
      obj["Energia (kcal)"] ||
      obj.kcal
    ),
    fonte
  };
}

function obterTodosAlimentosSemFiltro() {
  const importados = JSON.parse(localStorage.getItem("alimentosImportados") || "[]");
  const personalizados = JSON.parse(localStorage.getItem("alimentos") || "[]");
  return [...alimentosBase, ...importados, ...personalizados];
}

function obterTodosAlimentos() {
  const todos = obterTodosAlimentosSemFiltro();
  const fonte = obterFonteAtiva();

  if (fonte === "todos") return todos;
  return todos.filter(item => (item.fonte || "PERSONALIZADO") === fonte);
}

function atualizarListaAlimentos(lista = null) {
  const select = document.getElementById("selectAlimento");
  if (!select) return;

  select.innerHTML = "";
  const alimentos = lista || obterTodosAlimentos();

  alimentos.forEach((a, i) => {
    const option = document.createElement("option");
    option.value = String(i);
    option.text = '${a.nome} | Prot ${Number(a.proteina || 0).toFixed(1)}g | Kcal ${Number(a.calorias || 0).toFixed(0)} | ${a.fonte || "PERSONALIZADO"}';
    select.appendChild(option);
  });
}

function filtrarAlimentos() {
  const termo = document.getElementById("buscaAlimento")?.value?.toLowerCase() || "";
  const filtrados = obterTodosAlimentos().filter(a =>
    String(a.nome || "").toLowerCase().includes(termo)
  );

  atualizarListaAlimentos(filtrados);
}

function abrirModal(refeicao) {
  refeicaoAtual = refeicao;
  atualizarListaAlimentos();

  const modal = document.getElementById("modalAlimento");
  if (modal) modal.style.display = "block";
}

function fecharModal() {
  const modal = document.getElementById("modalAlimento");
  if (modal) modal.style.display = "none";
}

function confirmarAlimento() {
  const select = document.getElementById("selectAlimento");
  if (!select || select.selectedIndex < 0) {
    alert("Selecione um alimento.");
    return;
  }

  const nomeSelecionado = select.options[select.selectedIndex].text.split(" | ")[0];
  const alimento = obterTodosAlimentos().find(a => a.nome === nomeSelecionado);

  if (!alimento) {
    alert("Alimento não encontrado.");
    return;
  }

  const quantidade = Number(document.getElementById("quantidadeAlimento")?.value || 100);
  const fator = quantidade / 100;
  const data = obterDataAtualRegistro();

  const item = {
    nome: alimento.nome,
    quantidade,
    proteina: Number(alimento.proteina || 0) * fator,
    carbo: Number(alimento.carbo || 0) * fator,
    gordura: Number(alimento.gordura || 0) * fator,
    calorias: Number(alimento.calorias || 0) * fator,
    fonte: alimento.fonte || "PERSONALIZADO"
  };

  const banco = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}");

  if (!banco[data]) banco[data] = {};
  if (!banco[data][refeicaoAtual]) banco[data][refeicaoAtual] = [];

  banco[data][refeicaoAtual].push(item);
  localStorage.setItem("refeicoesPorData", JSON.stringify(banco));

  if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
  if (typeof atualizarKPIs === "function") atualizarKPIs();
  if (typeof atualizarPainelNutricional === "function") atualizarPainelNutricional();
  if (typeof renderizarRefeicoesDia === "function") renderizarRefeicoesDia();
  if (typeof renderizarTabelaHistorico === "function") renderizarTabelaHistorico();
}

function mostrarCadastro() {
  const cadastro = document.getElementById("cadastroAlimento");
  if (cadastro) cadastro.style.display = "block";
}

function salvarNovoAlimento() {
  const novo = {
    nome: document.getElementById("novoNome")?.value.trim(),
    proteina: Number(document.getElementById("novoProt")?.value || 0),
    carbo: Number(document.getElementById("novoCarb")?.value || 0),
    gordura: Number(document.getElementById("novoGord")?.value || 0),
    calorias: Number(document.getElementById("novoCal")?.value || 0),
    fonte: "PERSONALIZADO"
  };

  if (!novo.nome) {
    alert("Informe o nome do alimento.");
    return;
  }

  const lista = JSON.parse(localStorage.getItem("alimentos") || "[]");
  lista.push(novo);
  localStorage.setItem("alimentos", JSON.stringify(lista));

  if (document.getElementById("novoNome")) document.getElementById("novoNome").value = "";
  if (document.getElementById("novoProt")) document.getElementById("novoProt").value = "";
  if (document.getElementById("novoCarb")) document.getElementById("novoCarb").value = "";
  if (document.getElementById("novoGord")) document.getElementById("novoGord").value = "";
  if (document.getElementById("novoCal")) document.getElementById("novoCal").value = "";

  atualizarListaAlimentos();
  alert("Alimento salvo.");
}

function importarCSV(texto, nomeArquivo = "") {
  if (typeof texto !== "string") {
    console.error("Conteúdo inválido:", texto);
    return [];
  }

  const linhas = texto
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (linhas.length < 2) return [];

  const separador = linhas[0].includes(";") ? ";" : ",";
  const cabecalhos = linhas[0].split(separador).map(h => h.trim());

  const itens = [];

  for (let i = 1; i < linhas.length; i++) {
    const colunas = linhas[i].split(separador).map(c => c.trim());
    const obj = {};

    cabecalhos.forEach((cab, idx) => {
      obj[cab] = colunas[idx] || "";
    });

    const alimento = mapearObjetoAlimento(obj, nomeArquivo);
    if (alimento.nome) itens.push(alimento);
  }

  return itens;
}

function importarTabelaAlimentos(event) {
  const arquivo = event.target.files && event.target.files[0];
  if (!arquivo) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const conteudo = e.target.result;
      let alimentos = [];

      if (arquivo.name.toLowerCase().endsWith(".csv")) {
        alimentos = importarCSV(conteudo, arquivo.name);
      } else if (arquivo.name.toLowerCase().endsWith(".json")) {
        const json = JSON.parse(conteudo);
        const lista = Array.isArray(json) ? json : (json.alimentos || []);
        alimentos = lista
          .map(item => mapearObjetoAlimento(item, arquivo.name))
          .filter(a => a.nome);
      } else {
        alert("Use CSV ou JSON.");
        return;
      }

      if (!alimentos.length) {
        alert("Nenhum alimento válido encontrado no arquivo.");
        return;
      }

      const existentes = JSON.parse(localStorage.getItem("alimentosImportados") || "[]");
      const mapa = new Map();

      [...existentes, ...alimentos].forEach(item => {
        const chave = '${item.nome}|${item.fonte}';
        mapa.set(chave, item);
      });

      const finalLista = Array.from(mapa.values()).slice(0, 2000);
      localStorage.setItem("alimentosImportados", JSON.stringify(finalLista));

      const status = document.getElementById("statusImportacao");
      if (status) {
        status.innerText = '${alimentos.length} alimentos importados de ${arquivo.name}.';
      }

      const fonteSelect = document.getElementById("fonteAlimentos");
      if (fonteSelect && arquivo.name.toLowerCase().includes("taco")) {
        fonteSelect.value = "TACO";
        localStorage.setItem("fonteAtivaAlimentos", "TACO");
      }

      atualizarListaAlimentos();
      if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
      alert("Importação concluída.");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao importar arquivo.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(arquivo, "utf-8");
}

async function carregarTacoJSON() {
  try {
    const resposta = await fetch("data/tabela_taco.json");
    if (!resposta.ok) throw new Error("Não foi possível carregar tabela_taco.json");

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error("Formato inválido do JSON");
    }

    localStorage.setItem("alimentosImportados", JSON.stringify(dados));
    localStorage.setItem("fonteAtivaAlimentos", "TACO");

    const fonteSelect = document.getElementById("fonteAlimentos");
    if (fonteSelect) fonteSelect.value = "TACO";

    const status = document.getElementById("statusImportacao");
    if (status) {
      status.innerText = '${dados.length} alimentos TACO carregados.';
    }

    atualizarListaAlimentos();
    if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
    alert("Tabela TACO carregada com sucesso.");
  } catch (erro) {
    console.error(erro);
    alert("Erro ao carregar tabela TACO JSON.");
  }
}

function atualizarKPIs() {
  const data = obterDataAtualRegistro();
  const banco = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}");
  const refeicoesDia = banco[data] || {};

  let totalProteina = 0;
  let totalCalorias = 0;

  Object.values(refeicoesDia).forEach(lista => {
    lista.forEach(item => {
      totalProteina += Number(item.proteina || 0);
      totalCalorias += Number(item.calorias || 0);
    });
  });

  const kpiProteinas = document.getElementById("kpiProteinas");
  const kpiCalorias = document.getElementById("kpiCalorias");

  if (kpiProteinas) kpiProteinas.innerText = '${totalProteina.toFixed(0)}g';
  if (kpiCalorias) kpiCalorias.innerText = '${totalCalorias.toFixed(0)}';

  const metaProt = Number(localStorage.getItem("metaProteinaCalculada") || 0);
  const metaEnergia = Number(localStorage.getItem("metaEnergiaCalculada") || 0);

  const barraProt = document.getElementById("barraProteina");
  const barraEnergia = document.getElementById("barraEnergia");

  if (barraProt) {
    const pct = metaProt > 0 ? Math.min((totalProteina / metaProt) * 100, 100) : 0;
    barraProt.style.width = '${pct}%';
  }

  if (barraEnergia) {
    const pct = metaEnergia > 0 ? Math.min((totalCalorias / metaEnergia) * 100, 100) : 0;
    barraEnergia.style.width = '${pct}%';
  }
}

document.addEventListener("DOMContentLoaded", function () {
  refeicaoAtual = "cafe";
  if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
  atualizarKPIs();
});