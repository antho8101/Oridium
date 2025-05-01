document.addEventListener("DOMContentLoaded", function () {
    const rawData = generateData();
    const defaultRange = "24h";
    let currentFilteredData = filterDataByRange(rawData, defaultRange);
  
    const chart = new ApexCharts(document.querySelector("#chart"), getChartOptions(currentFilteredData));
    chart.render();
  
    // Gérer les boutons de période
    document.querySelectorAll(".oridium-chart-toolbar .chart-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const range = this.dataset.range;
        if (!range) return;
  
        document.querySelectorAll(".oridium-chart-toolbar .chart-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
  
        currentFilteredData = filterDataByRange(rawData, range);
        chart.updateSeries([{ name: "ORID", data: currentFilteredData }]);
      });
    });
  
    // Télécharger le graphique en PNG avec fond foncé
    const downloadBtn = document.getElementById("download-btn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        chart.updateOptions({ chart: { background: '#1c1c1c' } }, false, false);
        setTimeout(() => {
          chart.dataURI().then(({ imgURI }) => {
            const link = document.createElement("a");
            link.href = imgURI;
            link.download = "oridium_chart.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            chart.updateOptions({ chart: { background: 'transparent' } }, false, false);
          });
        }, 300);
      });
    }
  
    // Gérer la modale plein écran
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const modal = document.getElementById("chart-modal");
    const closeModal = document.getElementById("close-modal");
    const fullscreenTarget = document.getElementById("chart-fullscreen");
    let fullscreenChart = null;
  
    if (fullscreenBtn && modal && closeModal && fullscreenTarget) {
      fullscreenBtn.addEventListener("click", () => {
        modal.style.display = "block";
  
        if (!fullscreenChart) {
          fullscreenChart = new ApexCharts(fullscreenTarget, {
            ...getChartOptions(currentFilteredData),
            chart: {
              ...getChartOptions(currentFilteredData).chart,
              height: "100%"
            }
          });
          fullscreenChart.render();
        } else {
          fullscreenChart.updateSeries([{ name: "ORID", data: currentFilteredData }]);
        }
      });
  
      closeModal.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }
  });
  
  function getChartOptions(data) {
    return {
      chart: {
        type: 'area',
        height: 450,
        toolbar: { show: false },
        background: 'transparent'
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#dccb92']
      },
      fill: {
        type: "gradient",
        colors: ['#dccb92'],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.25,
          opacityTo: 0,
          stops: [0, 100],
          colorStops: [
            { offset: 0, color: "#dccb92", opacity: 0.4 },
            { offset: 100, color: "#dccb92", opacity: 0 }
          ]
        }
      },
      series: [{
        name: "ORID",
        data: data
      }],
      xaxis: {
        type: "datetime",
        labels: { style: { colors: '#fff' } }
      },
      yaxis: {
        labels: {
          style: { colors: '#fff' },
          formatter: val => `${val.toFixed(2)} $US`
        }
      },
      tooltip: {
        theme: 'dark',
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const value = series[seriesIndex][dataPointIndex];
          const timestamp = w.globals.initialSeries[seriesIndex].data[dataPointIndex][0];
          const date = new Date(timestamp);
          const formattedDate = date.toLocaleDateString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric'
          });
          return `<div class="custom-tooltip">
                    <strong>${value} $US</strong><br/>
                    <span>${formattedDate}</span>
                  </div>`;
        }
      },
      grid: { borderColor: "#ffffff22" }
    };
  }
  
  function generateData() {
    const now = Date.now();
    const data = [];
    for (let i = 0; i < 90; i++) {
      const timestamp = now - ((89 - i) * 12 * 60 * 60 * 1000);
      const value = 700 + Math.sin(i / 5) * 15 + (Math.random() * 10 - 5);
      data.push([timestamp, Math.round(value)]);
    }
    return data;
  }
  
  function filterDataByRange(data, range) {
    const now = Date.now();
    let cutoff;
  
    switch (range) {
      case '24h': cutoff = now - (24 * 60 * 60 * 1000); break;
      case '7d':  cutoff = now - (7 * 24 * 60 * 60 * 1000); break;
      case '1m':  cutoff = now - (30 * 24 * 60 * 60 * 1000); break;
      case '1y':  cutoff = now - (365 * 24 * 60 * 60 * 1000); break;
      case 'max':
      default:    return data;
    }
  
    return data.filter(point => point[0] >= cutoff);
  }  