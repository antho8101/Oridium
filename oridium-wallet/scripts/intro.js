export function playWelcomeIntro() {
    const welcomeScreen = document.getElementById("welcome-overlay");
    const welcomeText = document.getElementById("welcome-text");
  
    if (!welcomeScreen || !welcomeText) {
      console.warn("🔍 Welcome elements not found.");
      return;
    }
  
    // Lancer musique
    const music = new Audio("assets/audio/oridium-intro.mp3");
    music.volume = 0.2;
    music.play().catch((err) => console.warn("🔇 Music play failed:", err));

    // Afficher l'écran
    welcomeScreen.classList.remove("hidden");
  
    // Forcer le reflow pour que l'animation show soit bien prise en compte
    void welcomeText.offsetWidth;
  
    // Animation d'entrée
    welcomeText.classList.add("show");
  
    // Après 3s → animation de sortie
    setTimeout(() => {
      welcomeText.classList.remove("show");
      welcomeText.classList.add("hide");
  
      // Après la fin de l'animation de sortie (1s)
      setTimeout(() => {
        welcomeScreen.classList.add("hidden");
        welcomeText.classList.remove("hide");
      }, 1000);
    }, 5000);
  }  