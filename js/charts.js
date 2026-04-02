let graficoPainel = null;
let graficoNutricao = null;
let tipoGraficoAtual = "peso";
let periodoGraficoAtual = 7;

function formatarDataGrafico(dataISO) {
  if (!dataISO) return "";
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
}

function obterHistoricoOrdenado() {
  const dados = JSON.parse(localStorage.getItem("dados") || "[]");
  return dados.slice().sort((a, b) => a.data.localeCompare(b.data));
}

function filtrarHistoricoPorPeriodo(dados, dias) {
  if (!dias || dias <= 0) return dados;
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - (dias - 1));
  inicio.setHours(0, 0, 0, 0);
  return dados.filter(item => {
    const d = new Date(item.data + "T12:00:00");
    return d >= inicio && d <= hoje;
  });
}

function trocarGrafico(tipo) {
  tipoGraficoAtual = tipo;
  renderizarGraficoPainel();
}

function trocarPeriodoGrafico(dias) {
  periodoGraficoAtual = dias;
  renderizarGraficoPainel();
}

function renderizarGraficoPainel() {
  const canvas = document.getElementById("graficoPainel");
  if (!canvas) return;

  const historicoCompleto = obterHistoricoOrdenado();
  const dados = filtrarHistoricoPorPeriodo(historicoCompleto, periodoGraficoAtual);
  const labels = dados.map(d => formatarDataGrafico(d.data));

  let datasets = [];

  if (tipoGraficoAtual === "peso") {
    datasets = [{ label: "Peso (kg)", data: dados.map(d => Number(d.peso || 0)), tension: 0.3, borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.15)", fill: true }];
  }
  if (tipoGraficoAtual === "imc") {
    datasets = [{ label: "IMC", data: dados.map(d => Number(d.imc || 0)), tension: 0.3, borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.15)", fill: true }];
  }
  if (tipoGraficoAtual === "glicose") {
    datasets = [{ label: "Glicose (mg/dL)", data: dados.map(d => Number(d.glicose || 0)), tension: 0.3, borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", fill: true }];
  }
  if (tipoGraficoAtual === "pressao") {
    datasets = [
      { label: "Sistólica", data: dados.map(d => Number(d.ps || 0)), tension: 0.3, borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", fill: false },
      { label: "Diastólica", data: dados.map(d => Number(d.pd || 0)), tension: 0.3, borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.1)", fill: false }
    ];
  }

  if (graficoPainel) graficoPainel.destroy();

  graficoPainel = new Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#e5e7eb" } } },
      scales: {
        x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.08)" } },
        y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.08)" } }
      }
    }
  });
}

function renderizarGraficoNutricao() {
  const canvas = document.getElementById("graficoNutricao");
  if (!canvas) return;

  // Consumo do dia
  const data = (document.getElementById("dataRegistro")?.value) || (typeof hojeISO === "function" ? hojeISO() : new Date().toISOString().split("T")[0]);
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

  const metaProt    = Number(localStorage.getItem("metaProteinaCalculada") || 0);
  const metaEnergia = Number(localStorage.getItem("metaEnergiaCalculada")  || 0);

  const labels = ["Proteína (g)", "Energia (kcal)"];

  const consumido = [
    parseFloat(totalProteina.toFixed(1)),
    parseFloat(totalCalorias.toFixed(0))
  ];

  const meta = [
    metaProt    > 0 ? metaProt    : null,
    metaEnergia > 0 ? metaEnergia : null
  ];

  if (graficoNutricao) graficoNutricao.destroy();

  graficoNutricao = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Consumido",
          data: consumido,
          backgroundColor: ["rgba(99,102,241,0.75)", "rgba(16,185,129,0.75)"],
          borderColor:      ["rgba(99,102,241,1)",    "rgba(16,185,129,1)"],
          borderRadius: 8,
          borderWidth: 2
        },
        {
          label: "Meta",
          data: meta,
          backgroundColor: ["rgba(99,102,241,0.18)", "rgba(16,185,129,0.18)"],
          borderColor:      ["rgba(99,102,241,0.5)",  "rgba(16,185,129,0.5)"],
          borderRadius: 8,
          borderWidth: 2,
          borderDash: [4, 4]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#e5e7eb", font: { size: 13 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed.y;
              const unidade = ctx.dataIndex === 0 ? "g" : " kcal";
              return ` ${ctx.dataset.label}: ${val}${unidade}`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: "#cbd5e1", font: { size: 13 } }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.08)" }, beginAtZero: true }
      }
    }
  });
}
