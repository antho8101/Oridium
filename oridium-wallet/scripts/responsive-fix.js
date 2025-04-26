function adjustLayout() {
    const app = document.querySelector('.app-container'); // Remplace avec ta vraie classe principale !
    if (app) {
      app.style.height = window.innerHeight + 'px';
    }
  }
  
  // Ajuste immédiatement au chargement
  adjustLayout();
  
  // Et réajuste si la fenêtre est redimensionnée
  window.addEventListener('resize', adjustLayout);
  