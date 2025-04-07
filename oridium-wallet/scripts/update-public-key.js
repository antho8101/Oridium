document.addEventListener("DOMContentLoaded", () => {
    window.displayPublicKey = function (address) {
      const container = document.querySelector(".public-key-info .key-display");
      const span = container.querySelector(".keycode");
      const copyIcon = container.querySelector(".copy-icon");
  
      if (!span || !copyIcon) return;
  
      if (address) {
        span.textContent = address;
        copyIcon.style.opacity = "1";
        copyIcon.style.pointerEvents = "auto";
        copyIcon.style.cursor = "pointer";
  
        copyIcon.onclick = () => {
          navigator.clipboard.writeText(address).then(() => {
            const original = span.textContent;
            span.textContent = "Copied!";
            span.classList.add("copied");
  
            setTimeout(() => {
              span.textContent = address;
              span.classList.remove("copied");
            }, 1500);
          });
        };
      } else {
        span.textContent = "Connect your wallet to see your public key";
        copyIcon.style.opacity = "0.3";
        copyIcon.style.pointerEvents = "none";
        copyIcon.style.cursor = "default";
        copyIcon.onclick = null;
      }
    };
  
    // Affichage par défaut
    window.displayPublicKey(null);
  });  