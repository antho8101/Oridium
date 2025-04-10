import initWasmModule from "../wasm/blockchain.js";
import { injectIDBFS } from "./idbfs.js";

let wasm = null;

export async function initBlockchainWasm() {
  try {
    wasm = await initWasmModule();
    console.log("✅ WASM blockchain loaded");
    console.log("🔎 Exported WASM keys:", Object.keys(wasm));
    console.log("🧪 FS check:", wasm.FS);
    console.log("🧪 IDBFS check:", wasm.FS?.filesystems?.IDBFS);

    // 🔧 Injection manuelle de IDBFS si manquant
    if (!wasm.FS.filesystems?.IDBFS) {
      injectIDBFS(wasm);
      console.log("🔧 IDBFS manually injected");
    }

    // ✅ Créer le dossier /data s’il n’existe pas
    try {
      wasm.FS.mkdir("/data");
    } catch (e) {
      if (!e.message.includes("File exists")) throw e;
    }

    // ✅ Monter IDBFS sur /data
    wasm.FS.mount(wasm.FS.filesystems.IDBFS, {}, "/data");

    // ✅ Sync IDBFS pour charger les fichiers persistants
    wasm.FS.syncfs(true, (err) => {
      if (err) {
        console.error("❌ IDBFS initial sync failed", err);
        return;
      }

      console.log("💾 IDBFS initial sync complete");

      try {
        wasm.FS.stat("/data/blockchain.json");
        console.log("📂 blockchain.json already exists");
        wasm._initialize_blockchain();
        console.log("🚀 Blockchain instance initialized via WASM");
      } catch (statErr) {
        console.log("📄 blockchain.json does not exist, creating...");
        try {
          wasm.FS.writeFile("/data/blockchain.json", "[]");
          console.log("📄 Created empty blockchain.json");

          // 🔁 Resync pour persister le fichier
          wasm.FS.syncfs(false, (err) => {
            if (err) {
              console.error("❌ Failed to persist blockchain.json", err);
            } else {
              console.log("💾 blockchain.json persisted to IDBFS");
              wasm._initialize_blockchain();
              console.log("🚀 Blockchain instance initialized via WASM");
            }
          });
        } catch (writeErr) {
          
        }
      }
    });
  } catch (err) {

  }
}

// 🟩 EXPORTÉ : utilisé dans mining-loader.js et main.js
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

// 🟩 EXPORTÉ : utilisé dans wallet-session.js
export function getWalletBalance(address) {
  if (!wasm) return 0.0;
  const length = wasm.lengthBytesUTF8(address) + 1;
  const ptr = wasm._malloc(length);
  wasm.stringToUTF8(address, ptr, length);
  const balance = wasm._get_balance(ptr);
  wasm._free(ptr);
  return balance;
}
