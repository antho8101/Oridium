// orid-network.js

const API_BASE = "https://oridium-production.up.railway.app";

// 🔁 Récupère la blockchain complète
export async function getBlockchain() {
  try {
    const res = await fetch(`${API_BASE}/blockchain`);
    return await res.json();
  } catch (err) {
    console.error("❌ Failed to fetch blockchain:", err);
    return [];
  }
}

// 💰 Récupère le solde d'une adresse
export async function getBalance(address) {
  try {
    const res = await fetch(`${API_BASE}/balance/${address}`);
    const data = await res.json();
    return data.balance || 0;
  } catch (err) {
    console.error("❌ Failed to fetch balance:", err);
    return 0;
  }
}

// ➕ Soumet un bloc miné
export async function submitBlock(block) {
  try {
    const res = await fetch(`${API_BASE}/add-block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(block),
    });

    const result = await res.json();
    if (result.success) {
      console.log("✅ Block submitted to server");
    } else {
      console.warn("⚠️ Server responded but block was not accepted");
    }
  } catch (err) {
    console.error("❌ Failed to submit block:", err);
  }
}

export async function registerWallet(address) {
  try {
    const res = await fetch(`${API_BASE}/register-wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const data = await res.json();
    console.log("✅ Wallet registered:", data);
  } catch (err) {
    console.error("❌ Failed to register wallet:", err);
  }
}

if (typeof window !== "undefined") {
  window.registerWallet = registerWallet;
  window.getBlockchain = getBlockchain;
  window.getBalance = getBalance;
  window.submitBlock = submitBlock;
  console.log("🟢 Fonctions exposées globalement à window ✅");
}
