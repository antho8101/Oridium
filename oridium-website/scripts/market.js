import {
    getCurrentWallet,
    updateWalletUI,
    connectWallet
  } from '../../oridium-wallet/scripts/wallet-bridge.js';
  
  document.addEventListener("DOMContentLoaded", async () => {
    // ✅ Attendre la fin de la synchro du cookie
    if (window.oridWalletSynced) {
      await window.oridWalletSynced;
    }
  
    updateWalletUI(); // maintenant qu’on a tout mis à jour
  
    // Gestion du clic sur le bouton d'achat
    document.getElementById("buy-orid-btn")?.addEventListener("click", async () => {
      const wallet = getCurrentWallet();
      if (!wallet) {
        connectWallet();
        return;
      }
  
      const amountInput = document.getElementById("orid-amount-input");
      if (!amountInput) return;
  
      const amount = parseFloat(amountInput.value);
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid ORID amount.");
        return;
      }
  
      try {
        const res = await fetch("https://oridium-production.up.railway.app/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, amount })
        });
  
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          alert("Error generating payment link");
        }
      } catch (err) {
        console.error("❌ Payment error:", err);
        alert("Something went wrong.");
      }
    });
  });  