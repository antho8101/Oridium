const vaultImg = document.querySelector('.vault-3d-img');

window.addEventListener('scroll', () => {
  const rect = vaultImg.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  if (rect.top < windowHeight && rect.bottom > 0) {
    const scrollRatio = 1 - rect.top / windowHeight;
    const angle = Math.max(0, 70 - (scrollRatio * 100));
    vaultImg.style.transform = `rotateX(${angle}deg)`;
  }
});