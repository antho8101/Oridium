let ready = false;
let minerModule = null;

importScripts("/oridium-wallet/public/mining.js");

createMinerModule().then((Module) => {
  minerModule = Module;
  ready = true;
  console.log("✅ WASM runtime initialized (worker)");
  postMessage({ type: "ready" });
});

onmessage = function (e) {
  console.log("👂 Message received in worker:", e.data);

  if (!ready) {
    console.warn("⏳ Worker not ready yet, ignoring message");
    return;
  }

  if (e.data.type === "start") {
    const { input, difficulty } = e.data;
    const encoder = new TextEncoder();
    const inputBytes = encoder.encode(input);

    const inputPtr = minerModule._malloc(inputBytes.length + 4);
    const noncePtr = minerModule._malloc(4);
    const hashPtr = minerModule._malloc(32);

    minerModule.HEAPU8.set(inputBytes, inputPtr);

    const result = minerModule._mine(inputPtr, inputBytes.length, difficulty, noncePtr, hashPtr);

    if (result === 1) {
      const nonce = new DataView(minerModule.HEAPU8.buffer, noncePtr, 4).getUint32(0, true);
      const hashBytes = new Uint8Array(minerModule.HEAPU8.buffer, hashPtr, 32);
      const hashHex = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");

      postMessage({
        type: "result",
        data: { nonce: nonce.toString(), hash: hashHex }
      });
    } else {
      postMessage({
        type: "result",
        error: true
      });
    }

    minerModule._free(inputPtr);
    minerModule._free(noncePtr);
    minerModule._free(hashPtr);
  }

  if (e.data.type === "stop") {
    console.log("🛑 Stopping mining worker...");
    close();
  }
};