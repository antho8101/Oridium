import createBlockchainModule from "../wasm/blockchain.js";

let wasmModule = null;

export async function initBlockchainWasm() {
  try {
    wasmModule = await createBlockchainModule(); // createBlockchainModule() est bien une fonction maintenant
    console.log("✅ WASM blockchain loaded");
  } catch (err) {
    console.error("❌ Failed to load WASM module:", err);
  }
}

export function rewardMinerJS(address) {
  if (!wasmModule) {
    console.warn("⚠️ WASM not initialized.");
    return;
  }

  const cReward = wasmModule.cwrap("mine_reward", null, ["string"]);
  cReward(address);
}

export function getWalletBalance(address) {
    if (!wasmModule) {
      console.warn("⚠️ WASM not initialized.");
      return 0.0;
    }
    const cGetBalance = wasmModule.cwrap("get_balance", "number", ["string"]);
    return cGetBalance(address);
  }