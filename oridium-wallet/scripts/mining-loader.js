import { getGlobalDifficulty } from "./utils/difficulty.js";
import { getConnectedWalletAddress } from './wallet-session.js';
import { getBalance } from './orid-network.js';
import { getOridPriceUSD } from "./orid-pricing.js";

let worker = null;
let runtimeSeconds = 0;
let oridiumEarned = 0;
let blockCounter = 0;
let miningActive = false;
let runtimeInterval = null;
let pendingBlocks = []; // 🆕 stockage local

window.addEventListener("DOMContentLoaded", async () => {
  const toggleBtn = document.getElementById("mining-toggle");
  if (toggleBtn) toggleBtn.addEventListener("click", toggleMining);

  const address = getConnectedWalletAddress();
  if (address) {
    window.walletAddress = address;
    updateBalance();
  }
});

function updateBalance() {
  const address = window.walletAddress;
  if (!address) return;

  getBalance(address).then(balance => {
    const elements = document.querySelectorAll('.balance-amount');
    elements.forEach(el => {
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
          transactions: [
            { sender: "System", receiver: address, amount: 0.0001 }
          ],
          previousHash: "0",
          hash,
          nonce
        };

        pendingBlocks.push(block); // 🆕 ajoute au batch
        updateBalance();
      }

      oridiumEarned += 0.0001;
      document.getElementById("oridium-earned").textContent = `${oridiumEarned.toFixed(4)} ORID`;

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

  // 🆕 batching toutes les 5 secondes
  setInterval(() => {
    if (pendingBlocks.length > 0) {
      const blocksToSend = [...pendingBlocks];
      pendingBlocks = [];

      fetch("https://oridium-production.up.railway.app/batch-add-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: blocksToSend })
      }).then(res => res.json())
        .then(result => {
          if (!result.success) {
            console.warn("🛑 Batch failed, requeuing blocks");
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
  }, 5000);
}

function stopMining() {
  miningActive = false;
  if (worker) {
    worker.postMessage({ type: "stop" });
    worker.terminate();
    worker = null;
  }
  clearInterval(runtimeInterval);
  runtimeInterval = null;
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

  if (!modal || !countdown || !closeBtn) {
    console.error("❌ Network busy modal elements not found");
    return;
  }

  stopMining();

  const playIcon = document.getElementById("icon-play");
  const pauseIcon = document.getElementById("icon-pause");
  const statusText = document.getElementById("mining-status");

  if (playIcon) playIcon.style.display = "inline";
  if (pauseIcon) pauseIcon.style.display = "none";
  if (statusText) statusText.textContent = "Mining is paused ⏸️";

  modal.classList.remove("hidden");
  modal.classList.remove("no-blur");

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

    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("no-blur");
    }, 300);
  }, { once: true });
}

window.toggleMining = toggleMining;
window.showNetworkBusyModal = showNetworkBusyModal;