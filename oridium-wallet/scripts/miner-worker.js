console.log("✅ Miner Worker started");
postMessage({ type: '💣 worker loaded at all?' });

let ready = false;
let wasmModule = null;

// ⚙️ Préparation des options de configuration Emscripten
const config = {
  locateFile: function (path) {
    return new URL("mining.wasm", self.location).toString();
  }
};

// ✅ Import le script généré par Emscripten
importScripts("/scripts/wasm/mining.js");

createModule({
  locateFile(path) {
    return new URL("mining.wasm", self.location).toString();
  }
}).then((module) => {
  wasmModule = module;
  ready = true;
  console.log("🧠 WASM miner module ready");
  postMessage({ type: "ready" });
}).catch((err) => {
  console.error("❌ Failed to initialize miner module:", err);
});

onmessage = function (e) {
  if (e.data.type === "stop") {
    console.log("🛑 Mining stopped by main thread");
    close();
    return;
  }

  if (e.data.type === "start") {
    if (ready && wasmModule) {
      mineNow(e.data);
    } else {
      console.warn("⏳ Miner not ready yet");
    }
  }
};

function mineNow(data) {
  const { input, difficulty } = data;
  console.log("🧮 Starting mining with difficulty:", difficulty);

  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(input);

  const inputPtr = wasmModule._malloc(inputBytes.length + 4);
  const noncePtr = wasmModule._malloc(4);
  const hashPtr = wasmModule._malloc(32);

  wasmModule.HEAPU8.set(inputBytes, inputPtr);

  let result = 0;
  let attempts = 0;
  const maxAttempts = 10000000;

  while (result !== 1 && attempts < maxAttempts) {
    result = wasmModule._mine(inputPtr, inputBytes.length, difficulty, noncePtr, hashPtr);
    attempts++;
    if (attempts % 10000 === 0) {
      console.log(`⛏️ Still mining… attempts: ${attempts}`);
    }
  }

  if (result === 1) {
    const nonce = new DataView(wasmModule.HEAPU8.buffer, noncePtr, 4).getUint32(0, true);
    const hashBytes = new Uint8Array(wasmModule.HEAPU8.buffer, hashPtr, 32);
    const hashHex = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");

    postMessage({
      type: "result",
      data: { nonce: nonce.toString(), hash: hashHex }
    });
  } else {
    postMessage({ type: "result", error: true });
  }

  wasmModule._free(inputPtr);
  wasmModule._free(noncePtr);
  wasmModule._free(hashPtr);
}
