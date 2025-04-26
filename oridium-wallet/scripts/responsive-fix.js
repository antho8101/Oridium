function triggerResponsiveFix() {
    console.log("🔄 Forcing responsive recalculation...");
  
    // 1. Forcer le layout global à recalculer
    document.body.style.width = "99.9%";
    document.body.style.height = "99.9vh";
  
    setTimeout(() => {
      document.body.style.width = "";
      document.body.style.height = "";
    }, 50);
  
    // 2. Resize proprement le chart
    const container = document.querySelector('.chart-container');
    if (container && window.priceChart) {
      window.priceChart.resize(container.clientWidth, container.clientHeight);
      window.priceChart.timeScale().fitContent();
      console.log('📈 Chart resized:', container.clientWidth, container.clientHeight);
    }
  
    // 3. Bonus : scroll top forcé au resize (évite bugs en hauteur réduite)
    window.scrollTo(0, 0);
  }
  
  // 👉 Démarre au chargement
  window.addEventListener('load', triggerResponsiveFix);
  
  // 👉 Recalcule à chaque resize
  window.addEventListener('resize', triggerResponsiveFix);  