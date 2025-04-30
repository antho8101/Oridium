document.addEventListener("DOMContentLoaded", function () {
    const options = {
      chart: {
        type: 'area',
        height: 450,
        toolbar: { show: false },
        background: 'transparent'
      },
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#dccb92']
      },
      fill: {
        type: "gradient",
        colors: ['#dccb92'], // ← couleur de base
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.25,
          opacityTo: 0,
          stops: [0, 100],
          colorStops: [
            {
              offset: 0,
              color: "#dccb92",
              opacity: 0.4
            },
            {
              offset: 100,
              color: "#dccb92",
              opacity: 0
            }
          ]
        }
      },
      series: [{
        name: "ORID",
        data: generateData()
      }],
      xaxis: {
        type: "datetime",
        labels: {
          style: { colors: '#fff' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#fff' },
          formatter: val => `${val.toFixed(2)} $US`
        }
      },
      tooltip: {
        x: { format: 'dd MMM yyyy HH:mm' }
      },
      grid: {
        borderColor: "#ffffff22"
      }
    };
  
    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  });
  
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