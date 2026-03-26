let graficoPainel = null;
let tipoGraficoAtual = "peso";
let periodoGraficoAtual = 30;

function obterHistoricoOrdenado() {
  const dados = JSON.parse(localStorage.getItem("dados")) || [];
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
  const labels = dados.map(d => d.data);

  let datasets = [];

  if (tipoGraficoAtual === "peso") {
    datasets = [
      {
        label: "Peso",
        data: dados.map(d => Number(d.peso || 0)),
        tension: 0.3
      }
    ];
  }

  if (tipoGraficoAtual === "imc") {
    datasets = [
      {
        label: "IMC",
        data: dados.map(d => Number(d.imc || 0)),
        tension: 0.3
      }
    ];
  }

  if (tipoGraficoAtual === "glicose") {
    datasets = [
      {
        label: "Glicose",
        data: dados.map(d => Number(d.glicose || 0)),
        tension: 0.3
      }
    ];
  }

  if (tipoGraficoAtual === "pressao") {
    datasets = [
      {
        label: "Sistólica",
        data: dados.map(d => Number(d.ps || 0)),
        tension: 0.3
      },
      {
        label: "Diastólica",
        data: dados.map(d => Number(d.pd || 0)),
        tension: 0.3
      }
    ];
  }

  if (graficoPainel) graficoPainel.destroy();

  graficoPainel = new Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#e5e7eb" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#cbd5e1" },
          grid: { color: "rgba(255,255,255,0.08)" }
        },
        y: {
          ticks: { color: "#cbd5e1" },
          grid: { color: "rgba(255,255,255,0.08)" }
        }
      }
    }
  });
}