import initWasmModule from "../wasm/blockchain.js";
import { injectIDBFS } from "./idbfs.js";

let wasm = null;
let initialized = false;

export async function initBlockchainWasm() {
  if (initialized && wasm) return wasm;

  try {
    wasm = await initWasmModule();

    if (!wasm.FS.filesystems?.IDBFS) {
      injectIDBFS(wasm);
    }

    try {
      wasm.FS.mkdir("/data");
    } catch (e) {
      if (!e.message.includes("File exists")) throw e;
    }

    wasm.FS.mount(wasm.FS.filesystems.IDBFS, {}, "/data");

    wasm.FS.syncfs(true, (err) => {
      if (err) return;

      try {
        wasm.FS.stat("/data/blockchain.json");
        wasm._initialize_blockchain();
      } catch (statErr) {
        try {
          wasm.FS.writeFile("/data/blockchain.json", "[]");

          wasm.FS.syncfs(false, (err) => {
            if (!err) wasm._initialize_blockchain();
          });
        } catch {
          wasm._initialize_blockchain();
        }
      }
    });

    initialized = true;
    return wasm;
  } catch {}
}

export function rewardMinerJS(address) {
  if (!wasm) return;

  const length = wasm.lengthBytesUTF8(address) + 1;
  const malloc = wasm.cwrap("malloc", "number", ["number"]);
  const free = wasm.cwrap("free", null, ["number"]);

  const ptr = malloc(length);
  wasm.stringToUTF8(address, ptr, length);
  wasm._mine_reward(ptr);
  free(ptr);
}

export function getWalletBalance(address) {
  if (!wasm) return 0.0;
  const length = wasm.lengthBytesUTF8(address) + 1;
  const ptr = wasm._malloc(length);
  wasm.stringToUTF8(address, ptr, length);
  const balance = wasm._get_balance(ptr);
  wasm._free(ptr);
  return balance;
}

export function debugBalance(address) {
  const balance = getWalletBalance(address);
  console.log("🧾 Balance from WASM:", balance);
}
