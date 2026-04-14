let refeicaoAtual = null;
let _editandoItemIdx = null;

const alimentosBase = [
  { nome: "Arroz", proteina: 2.5, carbo: 28, gordura: 0.3, calorias: 130, fonte: "BASE", tipo: "cereal" },
  { nome: "Frango", proteina: 31, carbo: 0, gordura: 3.6, calorias: 165, fonte: "BASE", tipo: "frango" },
  { nome: "Ovo", proteina: 13, carbo: 1, gordura: 11, calorias: 155, fonte: "BASE", tipo: "ovo" },
  { nome: "Carne bovina", proteina: 26, carbo: 0, gordura: 15, calorias: 250, fonte: "BASE", tipo: "carne" },
  { nome: "Banana", proteina: 1, carbo: 23, gordura: 0.3, calorias: 96, fonte: "BASE", tipo: "fruta" }
];

const MEDIDAS_POR_TIPO = {
  cereal: [
    { l: "1 colher de sopa", g: 25 },
    { l: "1 escumadeira", g: 80 },
    { l: "1 xícara", g: 160 },
    { l: "1 prato raso", g: 250 }
  ],
  pao: [
    { l: "1 fatia", g: 25 },
    { l: "1 unidade", g: 50 }
  ],
  carne: [
    { l: "1 bife pequeno", g: 80 },
    { l: "1 bife médio", g: 120 },
    { l: "1 bife grande", g: 180 }
  ],
  frango: [
    { l: "1 filé pequeno", g: 80 },
    { l: "1 filé médio", g: 120 },
    { l: "1 filé grande", g: 180 },
    { l: "1 colher de sopa desfiado", g: 20 }
  ],
  peixe: [
    { l: "1 filé pequeno", g: 100 },
    { l: "1 filé médio", g: 150 },
    { l: "1 filé grande", g: 200 }
  ],
  embutido: [
    { l: "1 fatia fina", g: 15 },
    { l: "1 fatia média", g: 25 },
    { l: "1 fatia grossa", g: 40 }
  ],
  ovo: [
    { l: "1 unidade pequeno", g: 45 },
    { l: "1 unidade médio", g: 55 },
    { l: "1 unidade grande", g: 65 }
  ],
  leite: [
    { l: "1 copo (200ml)", g: 200 },
    { l: "1 xícara (240ml)", g: 240 }
  ],
  queijo: [
    { l: "1 fatia fina (1cm)", g: 25 },
    { l: "1 fatia grossa (2cm)", g: 50 }
  ],
  fruta: [
    { l: "1 unidade pequena", g: 80 },
    { l: "1 unidade média", g: 100 },
    { l: "1 unidade grande", g: 130 }
  ],
  legume: [
    { l: "1 folha", g: 20 },
    { l: "1 xícara picada", g: 50 }
  ],
  tuberculo: [
    { l: "1 unidade pequena", g: 80 },
    { l: "1 unidade média", g: 130 }
  ],
  oleo: [
    { l: "1 colher de chá", g: 5 },
    { l: "1 colher de sopa", g: 13 }
  ],
  suplemento: [
    { l: "1 scoop padrão", g: 30 }
  ],
  bebida: [
    { l: "1 copo (200ml)", g: 200 },
    { l: "1 xícara", g: 240 }
  ],
  doce: [
    { l: "1 porção", g: 50 }
  ],
  tempero: [
    { l: "1 pitada", g: 1 },
    { l: "1 colher de chá", g: 5 }
  ],
  outro: [
    { l: "1 colher de chá", g: 5 },
    { l: "1 colher de sopa", g: 15 },
    { l: "1 xícara", g: 100 },
    { l: "1 unidade", g: 100 }
  ]
};

const MEDIDAS_CASEIRAS = {
  // Cereais e grãos cozidos
  "Arroz cozido": [
    { l: "1 colher de sopa", g: 25 },
    { l: "1 escumadeira", g: 80 },
    { l: "1 xícara", g: 160 },
    { l: "1 prato raso", g: 250 }
  ],
  "Arroz": [
    { l: "1 colher de sopa", g: 25 },
    { l: "1 escumadeira", g: 80 },
    { l: "1 xícara", g: 160 },
    { l: "1 prato raso", g: 250 }
  ],
  "Feijão": [
    { l: "1 concha pequena", g: 60 },
    { l: "1 concha média", g: 90 },
    { l: "1 xícara", g: 180 }
  ],
  "Macarrão": [
    { l: "1 colher de sopa", g: 25 },
    { l: "1 xícara", g: 140 },
    { l: "1 prato raso", g: 220 }
  ],

  // Pães
  "Pão de forma": [{ l: "1 fatia", g: 25 }],
  "Pão francês": [
    { l: "1 unidade pequena", g: 50 },
    { l: "1 unidade grande", g: 80 }
  ],
  "Pão": [
    { l: "1 fatia", g: 25 },
    { l: "1 unidade", g: 50 }
  ],
  "Torradas": [{ l: "1 unidade", g: 8 }],
  "Cuscuz": [
    { l: "1 xícara", g: 150 },
    { l: "1 prato", g: 200 }
  ],
  "Tapioca": [
    { l: "1 unidade pequena", g: 40 },
    { l: "1 unidade média", g: 60 },
    { l: "1 unidade grande", g: 80 }
  ],
  "Crepioca": [{ l: "1 unidade", g: 60 }],

  // Carnes
  "Frango": [
    { l: "1 filé pequeno", g: 80 },
    { l: "1 filé médio", g: 120 },
    { l: "1 filé grande", g: 180 },
    { l: "1 colher de sopa desfiado", g: 20 }
  ],
  "Peito de frango": [
    { l: "1 filé pequeno", g: 100 },
    { l: "1 filé médio", g: 150 },
    { l: "1 filé grande", g: 200 }
  ],
  "Carne bovina": [
    { l: "1 bife pequeno", g: 80 },
    { l: "1 bife médio", g: 120 },
    { l: "1 bife grande", g: 180 }
  ],
  "Carne": [
    { l: "1 bife", g: 120 },
    { l: "1 porção", g: 150 }
  ],
  "Almôndega": [
    { l: "1 unidade pequena", g: 30 },
    { l: "1 unidade média", g: 50 },
    { l: "1 unidade grande", g: 80 }
  ],
  "Linguiça": [
    { l: "1 unidade fina", g: 50 },
    { l: "1 unidade grossa", g: 80 }
  ],
  "Salsicha": [{ l: "1 unidade", g: 50 }],
  "Bacon": [
    { l: "1 fatia fina", g: 15 },
    { l: "1 fatia grossa", g: 25 }
  ],
  "Presunto": [
    { l: "1 fatia fina", g: 15 },
    { l: "1 fatia média", g: 25 },
    { l: "1 fatia grossa", g: 40 }
  ],
  "Mortadela": [
    { l: "1 fatia fina", g: 15 },
    { l: "1 fatia média", g: 25 }
  ],
  "Apresuntado": [{ l: "1 fatia", g: 20 }],
  "Peito de peru": [{ l: "1 fatia", g: 20 }],
  "Salame": [
    { l: "1 fatia fina", g: 10 },
    { l: "1 fatia grossa", g: 20 }
  ],
  "Atum": [
    { l: "1 lata pequena (120g)", g: 120 },
    { l: "1 colher de sopa", g: 20 }
  ],
  "Sardinha": [{ l: "1 lata", g: 150 }],

  // Peixes
  "Salmão": [
    { l: "1 filé pequeno", g: 100 },
    { l: "1 filé médio", g: 150 },
    { l: "1 filé grande", g: 200 }
  ],
  "Tilápia": [{ l: "1 filé", g: 120 }],
  "Merluza": [{ l: "1 filé", g: 100 }],
  "Bacalhau": [
    { l: "1 posta pequena", g: 100 },
    { l: "1 posta média", g: 150 }
  ],
  "Camarão": [
    { l: "1 colher de sopa", g: 25 },
    { l: "1 porção", g: 100 }
  ],

  // Ovos
  "Ovo": [
    { l: "1 unidade pequeno", g: 45 },
    { l: "1 unidade médio", g: 55 },
    { l: "1 unidade grande", g: 65 }
  ],
  "Clara de ovo": [{ l: "1 unidade", g: 35 }],
  "Gema de ovo": [{ l: "1 unidade", g: 20 }],

  // Laticínios
  "Leite": [
    { l: "1 copo (200ml)", g: 200 },
    { l: "1 xícara (240ml)", g: 240 }
  ],
  "Queijo minas": [
    { l: "1 fatia fina (1cm)", g: 25 },
    { l: "1 fatia grossa (2cm)", g: 50 }
  ],
  "Queijo": [
    { l: "1 fatia", g: 30 },
    { l: "1 porção (50g)", g: 50 }
  ],
  "Queijo cottage": [
    { l: "1 colher de sopa", g: 20 },
    { l: "1 xícara", g: 200 }
  ],
  "Queijo ricota": [
    { l: "1 colher de sopa", g: 25 },
    { l: "1 xícara", g: 250 }
  ],
  "Queijo parmesão": [
    { l: "1 colher de sopa ralado", g: 10 },
    { l: "1 xícara ralado", g: 100 }
  ],
  "Queijo mussarela": [{ l: "1 fatia", g: 20 }],
  "Requeijão": [
    { l: "1 colher de sopa", g: 20 },
    { l: "1 colher de sobremesa", g: 15 }
  ],
  "Iogurte": [
    { l: "1 pote pequeno", g: 100 },
    { l: "1 pote grande", g: 170 }
  ],
  "Coalhada": [{ l: "1 colher de sopa", g: 20 }],

  // Frutas
  "Banana": [
    { l: "1 unidade pequena", g: 80 },
    { l: "1 unidade média", g: 100 },
    { l: "1 unidade grande", g: 130 }
  ],
  "Maçã": [
    { l: "1 unidade pequena", g: 100 },
    { l: "1 unidade média", g: 140 }
  ],
  "Mamão": [
    { l: "1 fatia média", g: 150 },
    { l: "1 xícara picado", g: 145 }
  ],
  "Laranja": [
    { l: "1 unidade pequena", g: 100 },
    { l: "1 unidade média", g: 140 }
  ],
  "Pera": [{ l: "1 unidade", g: 130 }],
  "Melancia": [
    { l: "1 fatia média", g: 300 },
    { l: "1 xícara picada", g: 150 }
  ],
  "Melão": [{ l: "1 fatia", g: 150 }],
  "Uva": [
    { l: "1 cacho pequeno", g: 100 },
    { l: "10 unidades", g: 80 }
  ],
  "Morango": [
    { l: "1 unidade", g: 12 },
    { l: "1 xícara", g: 150 }
  ],
  "Abacaxi": [{ l: "1 fatia grossa", g: 100 }],
  "Kiwi": [{ l: "1 unidade", g: 75 }],
  "Pêssego": [{ l: "1 unidade", g: 100 }],
  "Ameixa": [{ l: "1 unidade", g: 30 }],
  "Manga": [
    { l: "1 unidade pequena", g: 200 },
    { l: "1 unidade média", g: 300 }
  ],
  "Maracujá": [{ l: "1 unidade", g: 50 }],
  "Limão": [{ l: "1 unidade", g: 50 }],
  "Abacate": [
    { l: "1/2 unidade", g: 100 },
    { l: "1 unidade", g: 200 }
  ],

  // Legumes e verduras
  "Alface": [
    { l: "1 folha grande", g: 15 },
    { l: "1 xícara picada", g: 50 }
  ],
  "Tomate": [
    { l: "1 unidade pequena", g: 80 },
    { l: "1 unidade média", g: 120 }
  ],
  "Cenoura": [
    { l: "1 unidade pequena", g: 50 },
    { l: "1 unidade média", g: 80 }
  ],
  "Beterraba": [{ l: "1 unidade pequena", g: 80 }],
  "Brócolis": [
    { l: "1 florete", g: 20 },
    { l: "1 xícara", g: 90 }
  ],
  "Couve-flor": [{ l: "1 xícara", g: 100 }],
  "Espinafre": [{ l: "1 xícara", g: 30 }],
  "Repolho": [{ l: "1 xícara picado", g: 70 }],
  "Pepino": [{ l: "1 unidade", g: 150 }],
  "Abobrinha": [{ l: "1 unidade pequena", g: 100 }],
  "Berinjela": [{ l: "1 unidade", g: 200 }],
  "Chuchu": [{ l: "1 unidade", g: 150 }],
  "Vagem": [{ l: "10 unidades", g: 50 }],
  "Milho": [
    { l: "1 espiga pequena", g: 100 },
    { l: "1 espiga média", g: 150 }
  ],
  "Ervilha": [
    { l: "1 colher de sopa", g: 20 },
    { l: "1 xícara", g: 160 }
  ],
  "Acelga": [{ l: "1 folha", g: 20 }],
  "Rúcula": [{ l: "1 xícara", g: 20 }],
  "Agrião": [{ l: "1 xícara", g: 30 }],
  "Couve": [{ l: "1 folha", g: 25 }],

  // Tubérculos
  "Batata": [
    { l: "1 unidade pequena", g: 80 },
    { l: "1 unidade média", g: 130 },
    { l: "1 colher de sopa amassada", g: 30 }
  ],
  "Batata doce": [
    { l: "1 unidade pequena", g: 80 },
    { l: "1 unidade média", g: 130 }
  ],
  "Mandioca": [{ l: "1 pedaço", g: 100 }],
  "Inhame": [{ l: "1 pedaço", g: 100 }],
  "Cará": [{ l: "1 pedaço", g: 80 }],

  // Óleos e gorduras
  "Azeite": [
    { l: "1 colher de chá", g: 5 },
    { l: "1 colher de sopa", g: 13 }
  ],
  "Óleo": [
    { l: "1 colher de chá", g: 5 },
    { l: "1 colher de sopa", g: 13 }
  ],
  "Manteiga": [
    { l: "1 ponta de faca", g: 5 },
    { l: "1 colher de chá", g: 8 },
    { l: "1 colher de sopa", g: 15 }
  ],
  "Margarina": [
    { l: "1 colher de chá", g: 5 },
    { l: "1 colher de sopa", g: 15 }
  ],
  "Creme de leite": [{ l: "1 colher de sopa", g: 20 }],
  "Leite de coco": [{ l: "1 colher de sopa", g: 15 }],

  // Cereais e farinhas
  "Aveia": [
    { l: "1 colher de sopa", g: 15 },
    { l: "4 colheres de sopa", g: 60 },
    { l: "1 xícara", g: 90 }
  ],
  "Granola": [
    { l: "1 colher de sopa", g: 15 },
    { l: "4 colheres de sopa", g: 60 }
  ],
  "Farinha de trigo": [
    { l: "1 colher de sopa", g: 10 },
    { l: "1 xícara", g: 120 }
  ],
  "Farinha de mandioca": [
    { l: "1 colher de sopa", g: 12 },
    { l: "1 xícara", g: 150 }
  ],
  "Fubá": [
    { l: "1 colher de sopa", g: 15 },
    { l: "1 xícara", g: 150 }
  ],
  "Polenta": [{ l: "1 colher de sopa", g: 20 }],

  // Suplementos
  "Whey": [{ l: "1 scoop padrão", g: 30 }],
  "Caseína": [{ l: "1 scoop", g: 30 }],
  "Albumina": [{ l: "1 colher de sopa", g: 10 }],
  "BCAA": [{ l: "1 scoop", g: 10 }],
  "Creatina": [{ l: "1 colher de chá", g: 5 }],
  "Glutamina": [{ l: "1 colher de chá", g: 5 }],

  // Bebidas
  "Café": [{ l: "1 xícara (50ml)", g: 50 }],
  "Chá": [{ l: "1 xícara", g: 200 }],
  "Suco de laranja": [{ l: "1 copo (200ml)", g: 200 }],
  "Refrigerante": [
    { l: "1 copo (200ml)", g: 200 },
    { l: "1 lata (350ml)", g: 350 }
  ],
  "Cerveja": [
    { l: "1 lata (350ml)", g: 350 },
    { l: "1 garrafa (600ml)", g: 600 }
  ],
  "Vinho": [{ l: "1 taça (150ml)", g: 150 }],
  "Água de coco": [{ l: "1 copo (200ml)", g: 200 }],

  // Doces e sobremesas
  "Açúcar": [
    { l: "1 colher de chá", g: 5 },
    { l: "1 colher de sopa", g: 15 }
  ],
  "Mel": [
    { l: "1 colher de chá", g: 7 },
    { l: "1 colher de sopa", g: 20 }
  ],
  "Chocolate": [
    { l: "1 quadradinho", g: 5 },
    { l: "1 barra pequena", g: 25 }
  ],
  "Gelatina": [{ l: "1 xícara", g: 200 }],
  "Pudim": [{ l: "1 fatia", g: 100 }],
  "Mousse": [{ l: "1 porção", g: 100 }],
  "Bolo": [
    { l: "1 fatia fina", g: 60 },
    { l: "1 fatia média", g: 100 }
  ],
  "Brigadeiro": [{ l: "1 unidade", g: 30 }],
  "Beijinho": [{ l: "1 unidade", g: 30 }],

  // Miscelânea
  "Mostarda": [{ l: "1 colher de chá", g: 5 }],
  "Ketchup": [{ l: "1 colher de sopa", g: 15 }],
  "Maionese": [{ l: "1 colher de sopa", g: 15 }],
  "Molho de tomate": [{ l: "1 colher de sopa", g: 15 }],
  "Molho shoyu": [{ l: "1 colher de sopa", g: 15 }],
  "Vinagre": [{ l: "1 colher de sopa", g: 15 }],
  "Sal": [
    { l: "1 pitada", g: 1 },
    { l: "1 colher de chá", g: 6 }
  ],
  "Pimenta": [{ l: "1 pitada", g: 1 }],
  "Orégano": [{ l: "1 colher de chá", g: 2 }],
  "Manjericão": [{ l: "1 folha", g: 1 }],
  "Salsa": [{ l: "1 colher de sopa picada", g: 5 }],
  "Cebolinha": [{ l: "1 colher de sopa picada", g: 5 }],
  "Alho": [
    { l: "1 dente", g: 3 },
    { l: "1 colher de sopa picado", g: 10 }
  ],
  "Cebola": [
    { l: "1 unidade pequena", g: 80 },
    { l: "1 colher de sopa picada", g: 15 }
  ],
  "Tomate seco": [{ l: "1 unidade", g: 10 }],
  "Azeitona": [{ l: "1 unidade", g: 5 }],
  "Palmito": [{ l: "1 unidade", g: 30 }],
  "Milho verde": [
    { l: "1 colher de sopa", g: 20 },
    { l: "1 xícara", g: 160 }
  ],
  "Ervilha em conserva": [{ l: "1 colher de sopa", g: 20 }],
  "Seleta de legumes": [{ l: "1 colher de sopa", g: 20 }],

  // Padrão para alimentos não listados
  _default: [
    { l: "1 colher de chá", g: 5 },
    { l: "1 colher de sopa", g: 15 },
    { l: "1 colher de servir", g: 30 },
    { l: "1 xícara", g: 100 },
    { l: "1 unidade", g: 100 },
    { l: "1 porção (50g)", g: 50 },
    { l: "1 porção (100g)", g: 100 }
  ]
};

function obterMedidasPorTipo(tipo) {
  return MEDIDAS_POR_TIPO[tipo] || MEDIDAS_POR_TIPO.outro;
}

function obterMedidas(nomeAlimento, tipoAlimento) {
  if (tipoAlimento && MEDIDAS_POR_TIPO[tipoAlimento]) {
    return MEDIDAS_POR_TIPO[tipoAlimento];
  }

  if (!nomeAlimento) return MEDIDAS_CASEIRAS._default;

  const chave = Object.keys(MEDIDAS_CASEIRAS).find(
    k => k !== "_default" && nomeAlimento.toLowerCase().includes(k.toLowerCase())
  );

  return MEDIDAS_CASEIRAS[chave] || MEDIDAS_CASEIRAS._default;
}

function popularMedidas(nomeAlimento) {
  const sel = document.getElementById("medidaCaseira");
  const campo = document.getElementById("campaMedidaCaseira");
  if (!sel || !campo) return;

  const alimento = obterTodosAlimentos().find(a => a.nome === nomeAlimento);
  const tipo = alimento?.tipo;

  const medidas = obterMedidas(nomeAlimento, tipo);
  sel.innerHTML =
    '<option value="">— digitar em gramas —</option>' +
    medidas.map(m => `<option value="${m.g}">${m.l} ≈ ${m.g}g</option>`).join("");

  campo.style.display = "block";
}

function aplicarMedidaCaseira() {
  const sel = document.getElementById("medidaCaseira");
  const qtd = document.getElementById("quantidadeAlimento");
  if (!sel || !qtd || !sel.value) return;
  qtd.value = sel.value;
}

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
  document.querySelectorAll(".meal-tab").forEach(t => t.classList.remove("active"));
  if (botao) botao.classList.add("active");
  if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
}

// ─── RENDERIZAR REFEIÇÃO ────────────────────────────────────────────────────

function renderizarRefeicaoAtual() {
  const alvo = document.getElementById("refeicaoContent");
  if (!alvo) return;

  const data = obterDataAtualRegistro();
  const banco = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}");
  const itens = banco[data]?.[refeicaoAtual] || [];

  const listaHTML = itens.length
    ? `<h3>Itens da refeição</h3>
       <ul class="lista-refeicao">
         ${itens.map((item, idx) => `
           <li class="item-refeicao" id="item-refeicao-${idx}">
             <div class="item-info">
               <span class="item-nome">${item.nome}</span>
               <span class="item-detalhe">${item.quantidade}g &bull; ${item.proteina.toFixed(1)}g prot &bull; ${item.calorias.toFixed(0)} kcal</span>
             </div>
             <div class="item-acoes">
               <button class="btn-icone btn-editar" onclick="editarItemRefeicao(${idx})" title="Editar">&#9998;</button>
               <button class="btn-icone btn-excluir" onclick="excluirItemRefeicao(${idx})" title="Excluir">&#128465;</button>
             </div>
           </li>
         `).join("")}
       </ul>`
    : "<p>Nenhum alimento adicionado nesta refeição.</p>";

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

      <div class="field" id="campaMedidaCaseira" style="display:none;">
        <label for="medidaCaseira">Medida caseira</label>
        <select id="medidaCaseira" onchange="aplicarMedidaCaseira()"></select>
      </div>

      <div class="field">
        <label for="quantidadeAlimento">Quantidade (g)</label>
        <input id="quantidadeAlimento" type="number" inputmode="decimal" min="1" step="1" value="100">
      </div>

      <div class="action-row">
        <button id="btnAdicionarAlimento" onclick="confirmarAlimento()">Adicionar</button>
        <button onclick="mostrarCadastro()">Novo alimento</button>
        <button onclick="mostrarGerenciarAlimentos()">Meus alimentos</button>
      </div>

      <div id="cadastroAlimento" style="display:none; margin-top:15px;">
        <h3 id="tituloCadastro">Novo alimento</h3>
        <input type="hidden" id="editandoNomeOriginal">
        <div class="field"><label>Nome</label><input id="novoNome" placeholder="Nome do alimento"></div>
        <div class="field">
          <label>Tipo de alimento</label>
          <select id="novoTipo">
            <option value="outro">Outro / Não sei</option>
            <option value="cereal">Cereal ou Grão (arroz, feijão, macarrão)</option>
            <option value="pao">Pão ou Massa</option>
            <option value="carne">Carne Vermelha (bovina, suína)</option>
            <option value="frango">Frango ou Ave</option>
            <option value="peixe">Peixe ou Fruto do Mar</option>
            <option value="embutido">Embutido (presunto, mortadela, salame)</option>
            <option value="ovo">Ovo</option>
            <option value="leite">Leite ou Iogurte</option>
            <option value="queijo">Queijo</option>
            <option value="fruta">Fruta</option>
            <option value="legume">Legume ou Verdura</option>
            <option value="tuberculo">Tubérculo (batata, mandioca)</option>
            <option value="oleo">Óleo ou Gordura</option>
            <option value="suplemento">Suplemento (whey, creatina)</option>
            <option value="bebida">Bebida</option>
            <option value="doce">Doce ou Sobremesa</option>
            <option value="tempero">Tempero ou Condimento</option>
          </select>
        </div>
        <div class="field"><label>Proteína (g/100g)</label><input id="novoProt" type="number" inputmode="decimal" min="0" step="0.1" placeholder="0"></div>
        <div class="field"><label>Carboidrato (g/100g)</label><input id="novoCarb" type="number" inputmode="decimal" min="0" step="0.1" placeholder="0"></div>
        <div class="field"><label>Gordura (g/100g)</label><input id="novoGord" type="number" inputmode="decimal" min="0" step="0.1" placeholder="0"></div>
        <div class="field"><label>Calorias (kcal/100g)</label><input id="novoCal" type="number" inputmode="decimal" min="0" step="0.1" placeholder="0"></div>
        <div class="action-row">
          <button onclick="salvarNovoAlimento()">Salvar</button>
          <button onclick="fecharCadastro()" style="background:#475569;">Cancelar</button>
        </div>
      </div>

      <div id="gerenciarAlimentos" style="display:none; margin-top:15px;">
        <h3>Meus alimentos personalizados</h3>
        <div id="listaAlimentosPersonalizados"></div>
      </div>

      <div id="listaItensRefeicao" style="margin-top:20px;">${listaHTML}</div>
    </div>
  `;

  _editandoItemIdx = null;
  atualizarListaAlimentos();
}

// ─── EDITAR / EXCLUIR ITENS DA REFEIÇÃO ────────────────────────────────────

function excluirItemRefeicao(idx) {
  if (!confirm("Remover este item da refeição?")) return;

  const data = obterDataAtualRegistro();
  const banco = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}");

  if (banco[data]?.[refeicaoAtual]) {
    banco[data][refeicaoAtual].splice(idx, 1);
    localStorage.setItem("refeicoesPorData", JSON.stringify(banco));
  }

  renderizarRefeicaoAtual();
  if (typeof atualizarKPIs === "function") atualizarKPIs();
  if (typeof renderizarGraficoNutricao === "function") renderizarGraficoNutricao();
}

function editarItemRefeicao(idx) {
  const data = obterDataAtualRegistro();
  const banco = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}");
  const item = banco[data]?.[refeicaoAtual]?.[idx];
  if (!item) return;

  _editandoItemIdx = idx;

  const qtdInput = document.getElementById("quantidadeAlimento");
  if (qtdInput) qtdInput.value = item.quantidade;

  const busca = document.getElementById("buscaAlimento");
  if (busca) {
    busca.value = item.nome;
    filtrarAlimentos();
  }

  const btn = document.getElementById("btnAdicionarAlimento");
  if (btn) btn.textContent = "Atualizar";

  const itemEl = document.getElementById(`item-refeicao-${idx}`);
  if (itemEl) itemEl.classList.add("item-editando");
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
    fonte: alimento.fonte || "PERSONALIZADO",
    tipo: alimento.tipo || "outro"
  };

  const banco = JSON.parse(localStorage.getItem("refeicoesPorData") || "{}");
  if (!banco[data]) banco[data] = {};
  if (!banco[data][refeicaoAtual]) banco[data][refeicaoAtual] = [];

  if (_editandoItemIdx !== null) {
    banco[data][refeicaoAtual][_editandoItemIdx] = item;
  } else {
    banco[data][refeicaoAtual].push(item);
  }

  localStorage.setItem("refeicoesPorData", JSON.stringify(banco));

  if (typeof sincronizarRefeicao === "function") {
    sincronizarRefeicao(data, refeicaoAtual, banco[data][refeicaoAtual]);
  }

  renderizarRefeicaoAtual();
  if (typeof atualizarKPIs === "function") atualizarKPIs();
  if (typeof renderizarGraficoNutricao === "function") renderizarGraficoNutricao();
}

// ─── BANCO DE ALIMENTOS PERSONALIZADOS ─────────────────────────────────────

function mostrarCadastro() {
  const cadastro = document.getElementById("cadastroAlimento");
  const gerenciar = document.getElementById("gerenciarAlimentos");

  if (gerenciar) gerenciar.style.display = "none";

  if (cadastro) {
    cadastro.style.display = "block";
    document.getElementById("tituloCadastro").textContent = "Novo alimento";
    document.getElementById("editandoNomeOriginal").value = "";

    ["novoNome", "novoProt", "novoCarb", "novoGord", "novoCal"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    const novoTipo = document.getElementById("novoTipo");
    if (novoTipo) novoTipo.value = "outro";
  }
}

function fecharCadastro() {
  const cadastro = document.getElementById("cadastroAlimento");
  if (cadastro) cadastro.style.display = "none";
}

function mostrarGerenciarAlimentos() {
  const cadastro = document.getElementById("cadastroAlimento");
  const gerenciar = document.getElementById("gerenciarAlimentos");

  if (cadastro) cadastro.style.display = "none";
  if (!gerenciar) return;

  if (gerenciar.style.display !== "none") {
    gerenciar.style.display = "none";
    return;
  }

  renderizarListaPersonalizados();
  gerenciar.style.display = "block";
}

function renderizarListaPersonalizados() {
  const container = document.getElementById("listaAlimentosPersonalizados");
  if (!container) return;

  const lista = JSON.parse(localStorage.getItem("alimentos") || "[]");

  if (!lista.length) {
    container.innerHTML = "<p>Nenhum alimento personalizado cadastrado.</p>";
    return;
  }

  container.innerHTML = `
    <ul class="lista-refeicao">
      ${lista.map((a, idx) => `
        <li class="item-refeicao">
          <div class="item-info">
            <span class="item-nome">${a.nome}</span>
            <span class="item-detalhe">${a.proteina}g prot &bull; ${a.calorias} kcal &bull; ${a.carbo}g carbo &bull; ${a.gordura}g gord</span>
          </div>
          <div class="item-acoes">
            <button class="btn-icone btn-editar" onclick="editarAlimentoPersonalizado(${idx})" title="Editar">&#9998;</button>
            <button class="btn-icone btn-excluir" onclick="excluirAlimentoPersonalizado(${idx})" title="Excluir">&#128465;</button>
          </div>
        </li>
      `).join("")}
    </ul>
  `;
}

function editarAlimentoPersonalizado(idx) {
  const lista = JSON.parse(localStorage.getItem("alimentos") || "[]");
  const a = lista[idx];
  if (!a) return;

  const gerenciar = document.getElementById("gerenciarAlimentos");
  const cadastro = document.getElementById("cadastroAlimento");

  if (gerenciar) gerenciar.style.display = "none";
  if (cadastro) cadastro.style.display = "block";

  document.getElementById("tituloCadastro").textContent = "Editar alimento";
  document.getElementById("editandoNomeOriginal").value = a.nome;
  document.getElementById("novoNome").value = a.nome;
  document.getElementById("novoProt").value = a.proteina;
  document.getElementById("novoCarb").value = a.carbo;
  document.getElementById("novoGord").value = a.gordura;
  document.getElementById("novoCal").value = a.calorias;

  const novoTipo = document.getElementById("novoTipo");
  if (novoTipo) novoTipo.value = a.tipo || "outro";
}

function excluirAlimentoPersonalizado(idx) {
  if (!confirm("Excluir este alimento do banco?")) return;

  const lista = JSON.parse(localStorage.getItem("alimentos") || "[]");
  lista.splice(idx, 1);

  localStorage.setItem("alimentos", JSON.stringify(lista));
  atualizarListaAlimentos();
  renderizarListaPersonalizados();
}

function salvarNovoAlimento() {
  const nomeOriginal = document.getElementById("editandoNomeOriginal")?.value || "";
  const nome = document.getElementById("novoNome")?.value.trim();
  const proteina = parseFloat(document.getElementById("novoProt")?.value || 0);
  const carbo = parseFloat(document.getElementById("novoCarb")?.value || 0);
  const gordura = parseFloat(document.getElementById("novoGord")?.value || 0);
  const calorias = parseFloat(document.getElementById("novoCal")?.value || 0);
  const tipo = document.getElementById("novoTipo")?.value || "outro";

  if (!nome) {
    alert("Informe o nome do alimento.");
    return;
  }

  if (proteina === 0 && calorias === 0 && carbo === 0 && gordura === 0) {
    if (!confirm("Todos os nutrientes estão zerados. Deseja salvar mesmo assim?")) return;
  }

  const novo = { nome, proteina, carbo, gordura, calorias, fonte: "PERSONALIZADO", tipo };
  const lista = JSON.parse(localStorage.getItem("alimentos") || "[]");

  if (nomeOriginal) {
    const idx = lista.findIndex(a => a.nome === nomeOriginal);
    if (idx >= 0) {
      lista[idx] = novo;
    } else {
      lista.push(novo);
    }
  } else {
    lista.push(novo);
  }

  localStorage.setItem("alimentos", JSON.stringify(lista));

  if (typeof sincronizarAlimentosPersonalizados === "function") {
    sincronizarAlimentosPersonalizados();
  }

  fecharCadastro();
  atualizarListaAlimentos();
  alert(nomeOriginal ? "Alimento atualizado." : "Alimento salvo.");
}

// ─── BUSCA / LISTA ──────────────────────────────────────────────────────────

function mapearObjetoAlimento(obj, nomeArquivo = "") {
  const nomeArquivoLower = (nomeArquivo || "").toLowerCase();

  let fonte = "PERSONALIZADO";
  if (nomeArquivoLower.includes("taco")) fonte = "TACO";
  if (nomeArquivoLower.includes("tbca")) fonte = "TBCA";
  if (obj.fonte) fonte = String(obj.fonte).toUpperCase();

  const nome =
    obj.nome || obj.Nome || obj.alimento || obj.Alimento ||
    obj.descricao || obj.Descricao || obj["Descrição"] || "";

  return {
    nome: String(nome).trim(),
    proteina: normalizarNumero(obj.proteina || obj.Proteina || obj["Proteína"] || obj["Proteina (g)"] || obj["Proteína (g)"]),
    carbo: normalizarNumero(obj.carbo || obj.carboidrato || obj.Carboidrato || obj["Carboidrato (g)"] || obj["Carboidratos (g)"]),
    gordura: normalizarNumero(obj.gordura || obj.Gordura || obj.Lipidos || obj["Lipídios"] || obj["Lipidos (g)"] || obj["Lipídios (g)"]),
    calorias: normalizarNumero(obj.calorias || obj.Calorias || obj.energia || obj.Energia || obj["Energia (kcal)"] || obj.kcal),
    tipo: obj.tipo || obj.Tipo || "outro",
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

    const semNutrientes = !a.proteina && !a.calorias && !a.carbo && !a.gordura;
    option.text = `${semNutrientes ? "⚠ " : ""}${a.nome} | Prot ${Number(a.proteina || 0).toFixed(1)}g | Kcal ${Number(a.calorias || 0).toFixed(0)} | ${a.fonte || "PERSONALIZADO"}`;

    select.appendChild(option);
  });

  if (!select._medidaListenerAdded) {
    select.addEventListener("change", function () {
      const nome = this.options[this.selectedIndex]?.text?.split(" | ")[0] || "";
      popularMedidas(nome);

      const medida = document.getElementById("medidaCaseira");
      if (medida) medida.value = "";
    });

    select._medidaListenerAdded = true;
  }
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

// ─── IMPORTAÇÃO ─────────────────────────────────────────────────────────────

function importarCSV(texto, nomeArquivo = "") {
  if (typeof texto !== "string") return [];

  const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
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
        alimentos = lista.map(item => mapearObjetoAlimento(item, arquivo.name)).filter(a => a.nome);
      } else {
        alert("Use CSV ou JSON.");
        return;
      }

      if (!alimentos.length) {
        alert("Nenhum alimento válido encontrado.");
        return;
      }

      const existentes = JSON.parse(localStorage.getItem("alimentosImportados") || "[]");
      const mapa = new Map();

      [...existentes, ...alimentos].forEach(item => {
        mapa.set(`${item.nome}|${item.fonte}`, item);
      });

      const finalLista = Array.from(mapa.values()).slice(0, 2000);

      localStorage.setItem("alimentosImportados", JSON.stringify(finalLista));
      localStorage.setItem("fonteAtivaAlimentos", "todos");

      const status = document.getElementById("statusImportacao");
      if (status) status.innerText = `${alimentos.length} alimentos importados de ${arquivo.name}.`;

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
    if (!Array.isArray(dados)) throw new Error("Formato inválido do JSON");

    const mapeados = dados.map(item => mapearObjetoAlimento(item, "tabela_taco.json")).filter(a => a.nome);

    localStorage.setItem("alimentosImportados", JSON.stringify(mapeados));
    localStorage.setItem("fonteAtivaAlimentos", "todos");

    const fonteSelect = document.getElementById("fonteAlimentos");
    if (fonteSelect) fonteSelect.value = "TACO";

    const status = document.getElementById("statusImportacao");
    if (status) status.innerText = `${mapeados.length} alimentos TACO carregados.`;

    atualizarListaAlimentos();
    if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();

    alert("Tabela TACO carregada com sucesso.");
  } catch (erro) {
    console.error(erro);
    alert("Erro ao carregar tabela TACO JSON.");
  }
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

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

  if (kpiProteinas) kpiProteinas.innerText = `${totalProteina.toFixed(0)}g`;
  if (kpiCalorias) kpiCalorias.innerText = `${totalCalorias.toFixed(0)}`;

  const metaProt = Number(localStorage.getItem("metaProteinaCalculada") || 0);
  const metaEnergia = Number(localStorage.getItem("metaEnergiaCalculada") || 0);

  const barraProt = document.getElementById("barraProteina");
  const barraEnergia = document.getElementById("barraEnergia");

  if (barraProt) {
    const pct = metaProt > 0 ? Math.min((totalProteina / metaProt) * 100, 100) : 0;
    barraProt.style.width = `${pct}%`;
  }

  if (barraEnergia) {
    const pct = metaEnergia > 0 ? Math.min((totalCalorias / metaEnergia) * 100, 100) : 0;
    barraEnergia.style.width = `${pct}%`;
  }
}

// ─── INICIALIZAÇÃO ───────────────────────────────────────────────────────────

async function inicializarAlimentos() {
  if (localStorage.getItem("fonteAtivaAlimentos") !== "todos") {
    localStorage.setItem("fonteAtivaAlimentos", "todos");
  }

  if (localStorage.getItem("tacoCarregada")) return;

  try {
    const resposta = await fetch("data/tabela_taco.json");
    if (!resposta.ok) throw new Error("Falha ao carregar tabela_taco.json");

    const dados = await resposta.json();
    if (!Array.isArray(dados) || !dados.length) throw new Error("JSON vazio ou inválido");

    const mapeados = dados.map(item => mapearObjetoAlimento(item, "tabela_taco.json")).filter(a => a.nome);

    localStorage.setItem("alimentosImportados", JSON.stringify(mapeados));
    localStorage.setItem("fonteAtivaAlimentos", "todos");
    localStorage.setItem("tacoCarregada", "1");

    atualizarListaAlimentos();
    if (typeof renderizarRefeicaoAtual === "function") renderizarRefeicaoAtual();
  } catch (erro) {
    console.warn("Não foi possível carregar tabela TACO automaticamente:", erro.message);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  refeicaoAtual = "cafe";
  // A inicialização dos alimentos é chamada por mostrarApp() em auth.js
  // após os dados da nuvem serem carregados
});