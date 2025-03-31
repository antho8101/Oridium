import createMinerModule from "/oridium-wallet/public/mining.mjs";

let miner;
let miningInterval = null;
let runtimeSeconds = 0;
let oridiumEarned = 0;

export async function loadMiner() {
  miner = await createMinerModule();
  window.miner = miner; // Expose pour debug

  console.log("✅ WASM miner loaded");

  const toggleBtn = document.getElementById("mining-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleMining);
    console.log("💡 Ready to mine!");
  }
}

export async function mine(inputStr, difficulty) {
  if (!miner) {
    console.error("❌ WASM miner is not loaded");
    return null;
  }

  const encoder = new TextEncoder();
  const input = encoder.encode(inputStr);
  console.log("🔍 Encoded input string:", inputStr);
  console.log("🔍 input.length =", input.length);

  if (input.length > 220) {
    console.error("❌ Input too long for mining buffer. Max: 220");
    return null;
  }

  const inputPtr = miner._malloc(input.length + 4);
  const noncePtr = miner._malloc(4);
  const hashPtr = miner._malloc(32);

  console.log("📦 Memory allocation:");
  console.log("   👉 inputPtr =", inputPtr);
  console.log("   👉 noncePtr =", noncePtr);
  console.log("   👉 hashPtr =", hashPtr);

  if (!inputPtr || !noncePtr || !hashPtr) {
    console.error("🚨 One or more malloc failed");
    return null;
  }

  try {
    console.log("🧠 Copying input to WASM memory...");
    miner.HEAPU8.set(input, inputPtr);

    console.log("⚙️ Calling miner._mine(...)");
    const result = miner._mine(inputPtr, input.length, difficulty, noncePtr, hashPtr);

    console.log("✅ miner._mine returned:", result);

    if (result === 1) {
      const nonce = new DataView(miner.HEAPU8.buffer, noncePtr, 4).getUint32(0, true);
      const hashBytes = new Uint8Array(miner.HEAPU8.buffer, hashPtr, 32);
      const hashHex = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");

      console.log("🎉 Valid hash found!");
      console.log("   ⛏️ Nonce:", nonce);
      console.log("   🔐 Hash:", hashHex);

      return { nonce: nonce.toString(), hash: hashHex };
    } else {
      console.warn("⚠️ No valid hash found for current difficulty.");
      return null;
    }
  } catch (err) {
    console.error("💥 Error during mining execution:", err);
    return null;
  } finally {
    console.log("🧹 Freeing allocated memory...");
    miner._free(inputPtr);
    miner._free(noncePtr);
    miner._free(hashPtr);
  }
}

function toggleMining() {
  const playIcon = document.getElementById("icon-play");
  const pauseIcon = document.getElementById("icon-pause");
  const statusText = document.getElementById("mining-status");

  const isRunning = miningInterval !== null;

  if (isRunning) {
    clearInterval(miningInterval);
    miningInterval = null;
    runtimeSeconds = 0;

    if (playIcon) playIcon.style.display = "inline";
    if (pauseIcon) pauseIcon.style.display = "none";
    if (statusText) statusText.textContent = "Mining is paused ⏸️";
  } else {
    if (playIcon) playIcon.style.display = "none";
    if (pauseIcon) pauseIcon.style.display = "inline";
    if (statusText) statusText.textContent = "Mining in progress ⛏️";

    miningInterval = setInterval(async () => {
      runtimeSeconds++;
      document.getElementById("runtime").textContent = formatRuntime(runtimeSeconds);

      try {
        const result = await mine("Oridium test block", 1);
        if (result) {
          oridiumEarned += 0.0001;
          document.getElementById("oridium-earned").textContent = `${oridiumEarned.toFixed(4)} ORID`;
          console.log("✅ Mined:", result);
        }
      } catch (err) {
        console.error("💥 Mining error:", err);
      }
    }, 1000);
  }
}

function formatRuntime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Charger le miner au démarrage
loadMiner();

// Exposer pour debug depuis la console
window.loadMiner = loadMiner;
window.mine = mine;
window.toggleMining = toggleMining;