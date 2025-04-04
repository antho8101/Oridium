import { getGlobalDifficulty } from "./utils/difficulty.js";

window.addEventListener("DOMContentLoaded", loadMiner);

let worker = null;
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

  worker = new Worker("/scripts/miner-worker.js");

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

// Auto-load
loadMiner();
window.toggleMining = toggleMining;