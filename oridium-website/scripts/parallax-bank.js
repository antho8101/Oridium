window.addEventListener("scroll", () => {
    const section = document.querySelector(".bank-hero-section");
    if (!section) return;
  
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
  
    const maxTranslate = 100;               // ← démarrage plus bas
    const start = windowHeight - 200;
    const end = windowHeight / 2 + 100;
  
    let ratio = 1 - (rect.top - end) / (start - end);
    ratio = Math.min(Math.max(ratio, 0), 1);
  
    const translateY = maxTranslate - ratio * maxTranslate;
    section.style.transform = `translateY(${translateY}px)`;
  
    console.log(`[SCROLL] top: ${rect.top.toFixed(2)} | ratio: ${ratio.toFixed(2)} | translateY: ${translateY.toFixed(2)}px`);
  });
  