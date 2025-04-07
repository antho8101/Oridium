// blockchain-bridge.js
import initBlockchain from "../wasm/blockchain.js";

let wasm = null;

export async function initBlockchainWasm() {
  try {
    wasm = await initBlockchain();
    console.log("✅ WASM blockchain loaded");
  } catch (err) {
    console.error("❌ Failed to load WASM module:", err);
  }
}

export function rewardMinerJS(address) {
  if (!wasm) {
    console.warn("⚠️ WASM not initialized.");
    return;
  }

  const mineReward = wasm.cwrap("mine_reward", null, ["string"]);
  mineReward(address);
}

export function getWalletBalance(address) {
  if (!wasm) {
    console.warn("⚠️ WASM not initialized.");
    return 0.0;
  }

  const getBalance = wasm.cwrap("get_balance", "number", ["string"]);
  return getBalance(address);
}