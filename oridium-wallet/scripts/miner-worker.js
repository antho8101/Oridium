console.log("✅ Miner Worker started 🚀");

postMessage({ type: "💣 worker loaded at all?" });

let ready = false;
let wasmModule = null;

importScripts("wasm/miner.js");

createMiner({
  locateFile(path) {
    return "wasm/miner.wasm";
  }
}).then((module) => {
  wasmModule = module;
  ready = true;
  postMessage({ type: "ready" });
}).catch((err) => {
  console.error("❌ Failed to initialize miner module:", err);
});

onmessage = function (e) {
  if (e.data.type === "stop") {
    close();
    return;
  }

  if (e.data.type === "start") {
    if (ready && wasmModule) {
      mineNow(e.data);
    } else {
      console.warn("⏳ Miner not ready yet ❌");
    }
  }
};

function mineNow(data) {
  const { input, difficulty } = data;  
  const inputPtr = wasmModule._malloc(input.length + 1);
  wasmModule.stringToUTF8(input, inputPtr, input.length + 1);
  const res_ptr = wasmModule._mine_block(inputPtr, difficulty);
  wasmModule._free(inputPtr);

  const resultStr = wasmModule.UTF8ToString(res_ptr);
  wasmModule._free_result(res_ptr);

  const [nonce, hash] = resultStr.split(";");

  postMessage({
    type: "result",
    data: { nonce, hash }
  });
}