import { getGlobalDifficulty } from "./utils/difficulty.js";

let worker = null;
let workerReady = false;
let runtimeSeconds = 0;
let oridiumEarned = 0;
let blockCounter = 0;
let miningActive = false;
let runtimeInterval = null;

export async function loadMiner() {
  console.log("⏳ Loading miner worker...");
  const toggleBtn = document.getElementById("mining-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleMining);
    console.log("💡 Ready to mine!");
  }
}

function toggleMining() {
  const playIcon = document.getElementById("icon-play");
  const pauseIcon = document.getElementById("icon-pause");
  const statusText = document.getElementById("mining-status");

  if (miningActive) {
    // Stop
    stopMining();
    if (playIcon) playIcon.style.display = "inline";
    if (pauseIcon) pauseIcon.style.display = "none";
    if (statusText) statusText.textContent = "Mining is paused ⏸️";
  } else {
    // Start
    if (playIcon) playIcon.style.display = "none";
    if (pauseIcon) pauseIcon.style.display = "inline";
    if (statusText) statusText.textContent = "Mining in progress ⛏️";
    startMining();
  }
}

function startMining() {
  miningActive = true;
  workerReady = false;

  const difficulty = getGlobalDifficulty();
  const inputStr = `Oridium block #${blockCounter++}`;

  worker = new Worker("/oridium-wallet/scripts/miner-worker.js");

  worker.onmessage = (e) => {
    if (e.data.type === "ready") {
      console.log("✅ Worker ready, launching mining...");
      workerReady = true;
      worker.postMessage({ type: "start", input: inputStr, difficulty });
    }

    if (e.data.type === "result" && e.data.data) {
      const { nonce, hash } = e.data.data;
      console.log("✅ Mined:", { nonce, hash });

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

      // Relancer le prochain bloc
      const nextInput = `Oridium block #${blockCounter++}`;
      worker.postMessage({ type: "start", input: nextInput, difficulty });
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
    if (workerReady) {
      worker.postMessage({ type: "stop" });
    } else {
      console.log("⏳ Worker not ready yet, skipping stop message");
    }
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

// Auto-load
loadMiner();
window.toggleMining = toggleMining;