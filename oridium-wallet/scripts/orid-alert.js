export function showOridAlert(pseudo, amount) {
    console.log("🟡 showOridAlert called with:", { pseudo, amount });
  
    const wrapper = document.getElementById("orid-alert");
    if (!wrapper) {
      console.warn("⚠️ Alerte wrapper introuvable");
      return;
    }
    console.log("✅ Alerte wrapper trouvé");
  
    const fromEl = document.getElementById("orid-alert-from");
    const amountEl = document.getElementById("orid-alert-amount");
  
    if (!fromEl || !amountEl) {
      console.warn("⚠️ Éléments de contenu introuvables");
      return;
    }
  
    fromEl.textContent = `${pseudo} just sent you`;
    amountEl.textContent = `${amount.toFixed(4)} ORID`;
    console.log("📦 Contenu injecté");
  
    // Révèle l'alerte
    wrapper.classList.remove("hidden");
    requestAnimationFrame(() => {
      wrapper.classList.add("visible");
      console.log("🎉 Alerte affichée");
    });
  
    // Bouton de fermeture
    const closeBtn = wrapper.querySelector(".orid-alert-close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        console.log("🧼 Fermeture manuelle");
        wrapper.classList.remove("visible");
        setTimeout(() => wrapper.classList.add("hidden"), 400);
      };
    }
  
    // Fermeture auto
    setTimeout(() => {
      console.log("⏱ Fermeture automatique");
      wrapper.classList.remove("visible");
      setTimeout(() => wrapper.classList.add("hidden"), 400);
    }, 5000);
  
    // Son
    const audio = new Audio("assets/audio/alert.mp3");
    audio.play().then(() => {
      console.log("🔊 Son joué avec succès");
    }).catch((err) => {
      console.warn("🔇 Erreur de lecture audio:", err);
    });
  }  