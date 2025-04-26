function triggerResponsiveFix() {
  console.log("🔄 Forcing responsive recalculation...");

  // 1. Fix temporaire du body (léger et propre)
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

    priceChartElement.style.width = width + "px";
    priceChartElement.style.height = height + "px";

    window.priceChart.resize(width, height);
    window.priceChart.timeScale().fitContent();

    console.log('📈 Chart and container resized:', width, height);
  }

  // 3. Toujours forcer un petit scroll pour recaler
  window.scrollTo(0, 0);
}

// 👉 Corrige tout au load ET au resize
function setupResponsiveFix() {
  triggerResponsiveFix();

  setTimeout(() => {
    triggerResponsiveFix();
    console.log('🛠 Forcing extra recalculation after wallet data');
  }, 300); // Re-trigger après 300ms pour compenser le load wallet
}

// Branche proprement
window.addEventListener('load', setupResponsiveFix);
window.addEventListener('resize', triggerResponsiveFix);