import { getConnectedWalletAddress } from "./wallet-session.js";
import { updateTransactionHistory } from "./transaction-history.js";
import { getTransactionsForWallet } from "./helpers/getTransactionsForWallet.js"; // 🆕 import ici

export function showOridAlert(pseudo, amount, receiver = null) {
  const myAddress = getConnectedWalletAddress();
  const noTx = document.getElementById("no-transaction-placeholder");

  // 🛡 Ignore si je suis l’émetteur
  if (pseudo.toLowerCase() === myAddress?.toLowerCase()) {
    console.log("🚫 Alerte bloquée (pseudo == moi)");
    return;
  }

  // ✅ Ignore si ce n’est pas pour moi
  if (receiver && receiver.toLowerCase() !== myAddress?.toLowerCase()) {
    console.log("🚫 Alerte ignorée, ce n’est pas pour moi.");
    return;
  }

  // 🧹 Cache "no transaction yet"
  if (noTx) noTx.style.display = "none";

  // 🧾 Recharge l'historique complet proprement (🆕 plus propre que unshift manuel)
  try {
    const chain = window.blockchain;
    if (chain && myAddress) {
      const myTransactions = getTransactionsForWallet(chain, myAddress);
      window.__oridTransactionList = myTransactions;
      updateTransactionHistory(myTransactions, myAddress);
    }
  } catch (err) {
    console.error("❌ Failed to update transaction history after alert:", err);
  }

  console.log("✅ Alerte légitime reçue, affichage OK");
  console.log("🟡 showOridAlert called with:", { pseudo, amount });

  const wrapper = document.getElementById("orid-alert");
  const fromEl = document.getElementById("orid-alert-from");
  const amountEl = document.getElementById("orid-alert-amount");

  if (!wrapper || !fromEl || !amountEl) {
    console.warn("⚠️ Éléments de l'alerte manquants");
    return;
  }

  fromEl.textContent = `${pseudo} just sent you`;
  amountEl.textContent = `${amount.toFixed(4)} ORID`;

  wrapper.classList.remove("hidden");
  requestAnimationFrame(() => {
    wrapper.classList.add("visible");
    console.log("🎉 Alerte affichée");
  });

  const closeBtn = wrapper.querySelector(".orid-alert-close");
  if (closeBtn) {
    closeBtn.onclick = () => {
      wrapper.classList.remove("visible");
      setTimeout(() => wrapper.classList.add("hidden"), 400);
    };
  }

  setTimeout(() => {
    wrapper.classList.remove("visible");
    setTimeout(() => wrapper.classList.add("hidden"), 400);
  }, 8000);

  const audio = new Audio("assets/audio/alert.mp3");

  audio.play().then(() => {
    console.log("🔊 Son joué avec succès");

    // 🎉 Confettis si montant ≥ 1 ORID
    if (window.__oridConfetti) {
      const intensity = Math.min(300, 100 + Math.floor(amount * 80));
      window.__oridConfetti({
        particleCount: intensity,
        spread: 100,
        origin: { y: 0.6 },
        scalar: 1.2
      });
      console.log(`🎊 Confettis déclenchés pour ${amount} ORID (${intensity} particules)`);
    }
  }).catch(err => {
    console.warn("🔇 Audio not allowed yet. Waiting for user interaction…");
    const allowOnce = () => {
      audio.play().catch(e => console.warn("🔇 Still blocked", e));
      document.removeEventListener("click", allowOnce);
    };
    document.addEventListener("click", allowOnce);
  });
}