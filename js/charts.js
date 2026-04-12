let graficoPainel = null;
let graficoNutricao = null;
let tipoGraficoAtual = "peso";
let periodoGraficoAtual = Number(localStorage.getItem("periodoGrafico") || 7);

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

function forwardFill(dados, campo) {
  let ultimo = null;
  return dados.map(d => {
    const v = Number(d[campo] || 0);
    if (v > 0) ultimo = v;
    return { ...d, [campo]: ultimo !== null ? ultimo : 0 };
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

  let anotacoes = {};

  if (tipoGraficoAtual === "peso") {
    const df = forwardFill(dados, "peso");
    datasets = [{ label: "Peso (kg)", data: df.map(d => Number(d.peso || 0)), tension: 0.3, borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.15)", fill: true }];
  }
  if (tipoGraficoAtual === "imc") {
    const df = forwardFill(dados, "imc");
    datasets = [{ label: "IMC", data: df.map(d => Number(d.imc || 0)), tension: 0.3, borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.15)", fill: true }];
    anotacoes = {
      linha185: { type:"line", yMin:18.5, yMax:18.5, borderColor:"#facc15", borderWidth:1, borderDash:[4,4], label:{ content:"Abaixo peso", display:true, color:"#facc15", font:{size:10} } },
      linha25:  { type:"line", yMin:25,   yMax:25,   borderColor:"#f97316", borderWidth:1, borderDash:[4,4], label:{ content:"Sobrepeso", display:true, color:"#f97316", font:{size:10} } },
      linha30:  { type:"line", yMin:30,   yMax:30,   borderColor:"#ef4444", borderWidth:1, borderDash:[4,4], label:{ content:"Obesidade", display:true, color:"#ef4444", font:{size:10} } }
    };
  }
  if (tipoGraficoAtual === "glicose") {
    const df = forwardFill(dados, "glicose");
    datasets = [{ label: "Glicose (mg/dL)", data: df.map(d => Number(d.glicose || 0)), tension: 0.3, borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", fill: true }];
    anotacoes = {
      linha100: { type:"line", yMin:100, yMax:100, borderColor:"#eab308", borderWidth:2, borderDash:[6,3], label:{ content:"Atenção (100)", display:true, color:"#eab308", font:{size:10} } },
      linha126: { type:"line", yMin:126, yMax:126, borderColor:"#ef4444", borderWidth:2, borderDash:[6,3], label:{ content:"Alerta (126)", display:true, color:"#ef4444", font:{size:10} } }
    };
  }
  if (tipoGraficoAtual === "pressao") {
    const dps = forwardFill(dados, "ps");
    const dpd = forwardFill(dados, "pd");
    datasets = [
      { label: "Sistólica",  data: dps.map(d => Number(d.ps || 0)), tension: 0.3, borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)",  fill: false },
      { label: "Diastólica", data: dpd.map(d => Number(d.pd || 0)), tension: 0.3, borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.1)", fill: false }
    ];
    anotacoes = {
      linha120: { type:"line", yMin:120, yMax:120, borderColor:"#eab308", borderWidth:1, borderDash:[4,4], label:{ content:"Sist. atenção (120)", display:true, color:"#eab308", font:{size:10} } },
      linha140: { type:"line", yMin:140, yMax:140, borderColor:"#ef4444", borderWidth:1, borderDash:[4,4], label:{ content:"Sist. alerta (140)",  display:true, color:"#ef4444", font:{size:10} } },
      linha80:  { type:"line", yMin:80,  yMax:80,  borderColor:"#fb923c", borderWidth:1, borderDash:[4,4], label:{ content:"Diast. atenção (80)", display:true, color:"#fb923c", font:{size:10} } },
      linha90:  { type:"line", yMin:90,  yMax:90,  borderColor:"#dc2626", borderWidth:1, borderDash:[4,4], label:{ content:"Diast. alerta (90)",  display:true, color:"#dc2626", font:{size:10} } }
    };
  }

  if (graficoPainel) graficoPainel.destroy();

  graficoPainel = new Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#e5e7eb" } },
        annotation: { annotations: anotacoes }
      },
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
  const data = (document.getElementById("dataRegistro")?.value) || hojeISO();
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
