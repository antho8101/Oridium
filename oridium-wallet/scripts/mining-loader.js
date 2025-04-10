import { getGlobalDifficulty } from "./utils/difficulty.js";
import { getConnectedWalletAddress } from './wallet-session.js';
import { initBlockchainWasm, rewardMinerJS, getWalletBalance } from './blockchain-bridge.js';

let worker = null;
let runtimeSeconds = 0;
let oridiumEarned = 0;
let blockCounter = 0;
let miningActive = false;
let runtimeInterval = null;

window.addEventListener("DOMContentLoaded", async () => {
  console.log("⏳ Loading miner worker...");

  // ✅ Initialise le module WebAssembly et la blockchain interne
  await initBlockchainWasm();

  const toggleBtn = document.getElementById("mining-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleMining);
    console.log("💡 Ready to mine!");
  } else {
    console.warn("❌ No toggle button found!");
  }

  const address = getConnectedWalletAddress();
  if (address) {
    window.walletAddress = address;
    updateBalance();
  }
});

window.addEventListener("message", (e) => {
  if (e.data?.type === "orid-balance-updated") {
    const address = getConnectedWalletAddress();
    if (address) {
      console.log("🔄 Refreshing balance after syncfs from WASM");
      window.updateWalletBalanceUI(address);
    }
  }
});

function updateBalance() {
  const address = window.walletAddress;
  if (!address) return;

  try {
    const balance = getWalletBalance(address); // synchronously from WASM
    const el = document.querySelector('.balance-amount');
    if (el && typeof balance === 'number') {
      el.textContent = `${balance.toFixed(4)} ORID`;
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
    console.log("🚀 Miner worker created");
  } catch (e) {
    console.error("❌ Failed to create Worker:", e);
    return;
  }

  worker.onmessage = (e) => {
    console.log("📩 Message from worker:", e.data);

    if (e.data.type === "ready") {
      console.log("✅ Worker ready, launching mining...");
      const inputStr = `Oridium block #${blockCounter++}`;
      const difficulty = getGlobalDifficulty();
      worker.postMessage({ type: "start", input: inputStr, difficulty });
    }

    if (e.data.type === "result") {
      if (e.data.error) {
        console.warn("⚠️ No valid hash found");
        return;
      }

      const { nonce, hash } = e.data.data;
      console.log("✅ Mined:", { nonce, hash });

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
  console.log("🛑 Stopping mining from UI...");
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
