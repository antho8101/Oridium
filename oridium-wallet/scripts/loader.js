window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const app = document.getElementById('app');
  
    if (loader && app) {
      loader.style.display = 'none';   // Masque le loader
      app.style.display = 'flex';      // Affiche l'app en flex
    }
  });  