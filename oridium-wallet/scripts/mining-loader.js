import { getGlobalDifficulty } from "./utils/difficulty.js";
import { getConnectedWalletAddress } from './wallet-session.js';
import { initBlockchainWasm, rewardMinerJS, getWalletBalance, debugBalance } from './blockchain-bridge.js';

let worker = null;
let runtimeSeconds = 0;
let oridiumEarned = 0;
let blockCounter = 0;
let miningActive = false;
let runtimeInterval = null;

window.addEventListener("DOMContentLoaded", async () => {
  await initBlockchainWasm();

  const toggleBtn = document.getElementById("mining-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleMining);
  }

  const address = getConnectedWalletAddress();
  if (address) {
    window.walletAddress = address;
    updateBalance();
  }

  setTimeout(() => {
    const addr = getConnectedWalletAddress();
    if (addr) {
      debugBalance(addr);
      window.updateWalletBalanceUI(addr);
    }
  }, 500);
});

window.addEventListener("message", (e) => {
  if (e.data?.type === "orid-balance-updated") {
    const address = getConnectedWalletAddress();
    if (address) {
      window.updateWalletBalanceUI(address);
    }
  }
});

function updateBalance() {
  const address = window.walletAddress;
  if (!address) return;

  try {
    const balance = getWalletBalance(address);

    const elements = document.querySelectorAll('.balance-amount');
    elements.forEach(el => {
      // Si c’est dans .wallet-balance, affiche avec ORID
      if (el.closest('.wallet-balance')) {
        el.textContent = `${balance.toFixed(4)} ORID`;
      } else {
        el.textContent = balance.toFixed(4);
      }
    });

    // (facultatif) mettre à jour la valeur $ estimée
    const usdElement = document.querySelector('.orid-value-usd');
    if (usdElement) {
      const valueInUSD = balance * 30000;
      usdElement.textContent = `$${valueInUSD.toLocaleString()}`;
    }

  } catch (err) {
    console.error("❌ Failed to update balance:", err);
  }
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

  worker.onmessage = (e) => {
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
        rewardMinerJS(address);
        setTimeout(() => {
          window.updateWalletBalanceUI(address);
        }, 500);
      }

      oridiumEarned += 0.0001;
      document.getElementById("oridium-earned").textContent = `${oridiumEarned.toFixed(4)} ORID`;

      const statusText = document.getElementById("mining-status");
      if (statusText) {
        statusText.textContent = "One ORID mined! 🚀";
        setTimeout(() => {
          if (miningActive) {
            statusText.textContent = "Mining in progress ⛏️";
          }
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

window.toggleMining = toggleMining;
