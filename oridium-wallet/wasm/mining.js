let wasmInstance = null;

export async function loadMiner() {
  const response = await fetch("mining.wasm");
  const bytes = await response.arrayBuffer();

  const { instance } = await WebAssembly.instantiate(bytes, {});
  wasmInstance = instance;
  console.log("✅ WASM miner loaded");
}

export function mine(inputStr, difficulty) {
  if (!wasmInstance) throw new Error("WASM miner not loaded.");

  const encoder = new TextEncoder();
  const input = encoder.encode(inputStr);

  const memory = new Uint8Array(wasmInstance.exports.memory.buffer);

  const inputPtr = 0;
  const noncePtr = 1024;
  const hashPtr = 1032;

  memory.set(input, inputPtr);

  const result = wasmInstance.exports.mine(inputPtr, input.length, difficulty, noncePtr, hashPtr);

  if (result === 1) {
    const nonceView = new DataView(memory.buffer, noncePtr, 8);
    const nonce = nonceView.getBigUint64(0, true);

    const hashBytes = memory.slice(hashPtr, hashPtr + 32);
    const hashHex = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");

    return { nonce: nonce.toString(), hash: hashHex };
  } else {
    return null;
  }
}