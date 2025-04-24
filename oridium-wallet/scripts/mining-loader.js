import { getGlobalDifficulty } from "./utils/difficulty.js";
import { getConnectedWalletAddress } from './wallet-session.js';
import { getBalance } from './orid-network.js';
import { getOridPriceUSD } from "./orid-pricing.js";
import { showOridAlert } from "./orid-alert.js";

let worker = null;
let runtimeSeconds = 0;
let oridiumEarned = 0;
let blockCounter = 0;
let miningActive = false;
let runtimeInterval = null;
let pendingBlocks = [];
let lastSentHash = "0";
let batchTimeout = null; // ⏳ envoi dynamique

window.addEventListener("DOMContentLoaded", async () => {
  const toggleBtn = document.getElementById("mining-toggle");
  if (toggleBtn) toggleBtn.addEventListener("click", toggleMining);

  const address = getConnectedWalletAddress();
  if (address) {
    window.walletAddress = address;
    updateBalance();       // 🔄 premier update immédiat
    startBalancePolling(); // ⏱ ensuite boucle passive
  }
});

function updateBalance() {
  const address = window.walletAddress;
  if (!address) return;

  const lowerAddress = address.toLowerCase();

  getBalance(address).then(balance => {
    // 💰 Mise à jour affichage
    document.querySelectorAll('.balance-amount').forEach(el => {
      if (el.closest('.wallet-balance')) {
        el.textContent = `${balance.toFixed(4)} ORID`;
      } else {
        el.textContent = balance.toFixed(4);
      }
    });

    const usdElement = document.querySelector('.orid-value-usd');
    if (usdElement) {
      const valueInUSD = balance * getOridPriceUSD();
      usdElement.textContent = `$${valueInUSD.toFixed(2)}`;
    }

    // 🔍 Détection de réception d'ORID
    fetch("https://oridium-production.up.railway.app/blockchain")
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(chain => {
        const lastTs = parseInt(localStorage.getItem("orid_last_alert_ts") || "0");

        for (const block of chain) {
          if (block.timestamp <= lastTs) continue;

          // 🔒 Si une seule tx du bloc a été envoyée par moi, on skip tout le bloc
          const iAmSender = block.transactions.some(tx =>
            tx.sender?.toLowerCase() === lowerAddress
          );
          if (iAmSender) continue;

          // ✅ On détecte une vraie réception extérieure
          for (const tx of block.transactions) {
            const isValid = (
              tx.receiver?.toLowerCase() === lowerAddress &&
              tx.sender?.toLowerCase() !== "system"
            );

            if (isValid) {
              const pseudo = localStorage.getItem(`orid_wallet_${tx.sender}_pseudo`) || "Someone";
              showOridAlert(pseudo, tx.amount, tx.receiver);
              localStorage.setItem("orid_last_alert_ts", block.timestamp.toString());
              break; // une seule alerte par bloc
            }
          }
        }
      })
      .catch(() => {
        // silence
      });

  }).catch(err => {
    console.error("❌ Failed to update balance:", err);
  });
}


function toggleMining() {
  const playIcon = document.getElementById("icon-play");
  const pauseIcon = document.getElementById("icon-pause");
  const statusText = document.getElementById("mining-status");

  const walletAddress = getConnectedWalletAddress();
  if (!walletAddress) {
    alert("Please connect your wallet to start mining.");
    return;
  }
  window.walletAddress = walletAddress;

  if (miningActive) {
    stopMining();
    if (playIcon) playIcon.style.display = "inline";
    if (pauseIcon) pauseIcon.style.display = "none";
    if (statusText) statusText.textContent = "Mining is paused ⏸️";
  } else {
    startMining();
    if (playIcon) playIcon.style.display = "none";
    if (pauseIcon) pauseIcon.style.display = "inline";
    if (statusText) statusText.textContent = "Mining in progress ⛏️";
  }
}

function startMining() {
  miningActive = true;
  runtimeSeconds = 0;
  blockCounter = 0;
  oridiumEarned = 0;

  try {
    worker = new Worker("./scripts/miner-worker.js");
  } catch (e) {
    return;
  }

  worker.onmessage = async (e) => {
    if (e.data.type === "ready") {
      const inputStr = `Oridium block #${blockCounter++}`;
      const difficulty = getGlobalDifficulty();
      worker.postMessage({ type: "start", input: inputStr, difficulty });
    }

    if (e.data.type === "result") {
      if (e.data.error) return;

      const { nonce, hash } = e.data.data;
      const address = getConnectedWalletAddress();
      if (address) {
        const block = {
          index: blockCounter,
          timestamp: Date.now(),
          transactions: [{ sender: "System", receiver: address, amount: 0.0001 }],
          previousHash: lastSentHash || "0",
          hash,
          nonce: Number(nonce)
        };
        pendingBlocks.push(block);
      }

      const statusText = document.getElementById("mining-status");
      if (statusText) {
        statusText.textContent = "One ORID mined! 🚀";
        setTimeout(() => {
          if (miningActive) statusText.textContent = "Mining in progress ⛏️";
        }, 2000);
      }

      const nextInput = `Oridium block #${blockCounter++}`;
      const nextDifficulty = getGlobalDifficulty();
      worker.postMessage({ type: "start", input: nextInput, difficulty: nextDifficulty });
    }
  };

  runtimeInterval = setInterval(() => {
    runtimeSeconds++;
    document.getElementById("runtime").textContent = formatRuntime(runtimeSeconds);
  }, 1000);

  dynamicBatchLoop(); // ⬅️ démarre l’envoi dynamique
  
}

function getDynamicInterval() {
  const count = pendingBlocks.length;
  if (count > 10) return 3000;
  if (count > 5) return 5000;
  if (count > 2) return 7000;
  return 10000;
}

function dynamicBatchLoop() {
  if (!miningActive) return;

  if (pendingBlocks.length > 0) {
    const blocksToSend = [...pendingBlocks];
    pendingBlocks = [];

    for (let i = 0; i < blocksToSend.length; i++) {
      blocksToSend[i].previousHash = i === 0 ? lastSentHash : blocksToSend[i - 1].hash;
    }

    const cleaned = blocksToSend.map((b, i) => ({
      ...b,
      index: blockCounter - blocksToSend.length + i
    }));

    console.log("🚀 Sending batch of", cleaned.length, "blocks:", cleaned);

    fetch("https://oridium-production.up.railway.app/batch-add-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleaned)
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        const myAddress = getConnectedWalletAddress();
    
        const accepted = cleaned.length;
        oridiumEarned += accepted * 0.0001;
        document.getElementById("oridium-earned").textContent = `${oridiumEarned.toFixed(4)} ORID`;
    
        updateBalance();
    
        // ✅ Enregistrement du dernier hash accepté par le serveur
        lastSentHash = cleaned[cleaned.length - 1].hash;
        localStorage.setItem("orid_last_sent_hash", lastSentHash);
      } else {
        pendingBlocks.push(...blocksToSend);
        stopMining();
        showNetworkBusyModal(10);
      }
    }).catch(err => {
        console.error("❌ Batch send failed:", err);
        pendingBlocks.push(...blocksToSend);
        stopMining();
        showNetworkBusyModal(10);
      });
  }

  batchTimeout = setTimeout(dynamicBatchLoop, getDynamicInterval());
}

function stopMining() {
  miningActive = false;
  if (worker) {
    worker.postMessage({ type: "stop" });
    worker.terminate();
    worker = null;
  }
  clearInterval(runtimeInterval);
  clearTimeout(batchTimeout);
  runtimeInterval = null;
  batchTimeout = null;
  runtimeSeconds = 0;
}

function formatRuntime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function showNetworkBusyModal(seconds = 10) {
  const modal = document.getElementById("network-busy-modal");
  const countdown = document.getElementById("network-countdown");
  const closeBtn = document.getElementById("close-network-busy");

  if (!modal || !countdown || !closeBtn) return;

  stopMining();

  document.getElementById("icon-play").style.display = "inline";
  document.getElementById("icon-pause").style.display = "none";
  document.getElementById("mining-status").textContent = "Mining is paused ⏸️";

  modal.classList.remove("hidden", "no-blur");
  const content = modal.querySelector(".modal-content");
  content.classList.remove("fade-out");
  content.classList.add("fade-in");

  let remaining = seconds;
  countdown.textContent = `${remaining}s`;
  closeBtn.disabled = true;

  const interval = setInterval(() => {
    remaining--;
    countdown.textContent = `${remaining}s`;
    if (remaining <= 0) {
      clearInterval(interval);
      closeBtn.disabled = false;
    }
  }, 1000);

  closeBtn.addEventListener("click", () => {
    modal.classList.add("no-blur");
    content.classList.remove("fade-in");
    content.classList.add("fade-out");
    setTimeout(() => modal.classList.add("hidden"), 300);
  }, { once: true });
}

function startBalancePolling() {
  setInterval(() => {
    if (window.walletAddress) {
      updateBalance();
    }
  }, 10000); // toutes les 10s
}

window.toggleMining = toggleMining;
window.showNetworkBusyModal = showNetworkBusyModal;