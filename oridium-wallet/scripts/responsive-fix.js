function triggerResponsiveFix() {
  console.log("🔄 Forcing responsive recalculation...");

  // 1. Fix temporaire du body (très léger)
  document.body.style.width = "99.9%";
  document.body.style.height = "99.9vh";

  setTimeout(() => {
    document.body.style.width = "";
    document.body.style.height = "";
  }, 50);

  // 2. Resize du chart proprement
  const chartContainer = document.querySelector('.chart-container');
  const priceChartElement = document.getElementById('priceChart');

  if (chartContainer && priceChartElement && window.priceChart) {
    const width = chartContainer.clientWidth;
    const height = chartContainer.clientHeight;

    // 🛠️ Ajuste aussi directement l'élément #priceChart
    priceChartElement.style.width = width + "px";
    priceChartElement.style.height = height + "px";

    window.priceChart.resize(width, height);
    window.priceChart.timeScale().fitContent();

    console.log('📈 Chart and container resized:', width, height);
  }

  // 3. Toujours forcer un petit scrollTo pour éviter décalages
  window.scrollTo(0, 0);
}

// 👉 Démarre au chargement
window.addEventListener('load', triggerResponsiveFix);

// 👉 Recalcule à chaque resize
window.addEventListener('resize', triggerResponsiveFix);