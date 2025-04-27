export function finishLoading() {
    const loader = document.getElementById('loader');
    const app = document.getElementById('app');
  
    if (loader && app) {
      loader.style.display = 'none';
      app.style.display = 'flex';
    }
  }  