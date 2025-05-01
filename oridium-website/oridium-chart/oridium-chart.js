document.addEventListener("DOMContentLoaded", function () {
  if (typeof ApexCharts === "undefined") {
    console.error("❌ ApexCharts is not defined. Make sure apexcharts.min.js is loaded before this script.");
    return;
  }

  const rawData = generateData();
  const defaultRange = "7d";
  let currentFilteredData = filterDataByRange(rawData, defaultRange);

  const chart = new ApexCharts(document.querySelector("#chart"), getChartOptions(currentFilteredData));
  chart.render();

  document.querySelectorAll(".oridium-chart-toolbar .chart-btn").forEach(btn => {
    if (btn.dataset.range === defaultRange) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

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
});

function getChartOptions(data) {
  return {
    chart: {
      type: 'area',
      height: "100%",
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
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
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