import { getGlobalDifficulty } from "./utils/difficulty.js";
import { getConnectedWalletAddress } from './wallet-session.js';
import { getBalance } from './orid-network.js';
import { getOridPriceUSD } from "./orid-pricing.js";
import { showOridAlert } from "./orid-alert.js";

let worker = null;
let runtimeSeconds = 0;
let oridiumEarned = 0;
let blockCounter = 0;
let miningActive = false;
let runtimeInterval = null;
let pendingBlocks = [];
let lastSentHash = localStorage.getItem("orid_last_sent_hash") || "0";
let batchTimeout = null;
let pollingInterval = null;

window.addEventListener("DOMContentLoaded", async () => {
  const toggleBtn = document.getElementById("mining-toggle");
  if (toggleBtn) toggleBtn.addEventListener("click", toggleMining);

  const address = getConnectedWalletAddress();
  if (address) {
    window.walletAddress = address;
    updateBalance();
    startBalancePolling();
  }
});

function updateBalance() {
  const address = window.walletAddress;
  if (!address) return;

  const lowerAddress = address.toLowerCase();

  getBalance(address).then(balance => {
    const numericBalance = Number(balance) || 0; // 🔐 Sécurisation

    document.querySelectorAll('.balance-amount').forEach(el => {
      el.textContent = `${numericBalance.toFixed(4)}`;
    });

    const usdElement = document.querySelector('.orid-value-usd');
    if (usdElement) {
      const valueInUSD = numericBalance * getOridPriceUSD();
      usdElement.textContent = `$${valueInUSD.toFixed(2)}`;
    }

    fetch("https://api.getoridium.com/blockchain")
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(chain => {
        const lastTs = parseInt(localStorage.getItem("orid_last_alert_ts") || "0");
        const lastAlertedHash = localStorage.getItem("orid_last_alert_hash");

        for (const block of chain) {
          if (block.timestamp <= lastTs || block.hash === lastAlertedHash) continue;

          const hasIncoming = block.transactions.some(tx =>
            tx.receiver?.toLowerCase() === lowerAddress &&
            tx.sender?.toLowerCase() !== "system"
          );

          if (!hasIncoming) continue;

          for (const tx of block.transactions) {
            const isValid = (
              tx.receiver?.toLowerCase() === lowerAddress &&
              tx.sender?.toLowerCase() !== "system"
            );

            if (isValid) {
              const pseudo = tx.pseudo || "Someone";
              showOridAlert(pseudo, tx.amount, tx.receiver);
              localStorage.setItem("orid_last_alert_ts", block.timestamp.toString());
              localStorage.setItem("orid_last_alert_hash", block.hash);
              break;
            }
          }
        }
      })
      .catch(() => {});
  }).catch(err => {
    console.error("❌ Failed to update balance:", err);
  });
}

function startBalancePolling() {
  if (pollingInterval) return;
  pollingInterval = setInterval(() => {
    if (!miningActive && window.walletAddress) {
      updateBalance();
    }
  }, 10000);
}

export function stopBalancePolling() {
  clearInterval(pollingInterval);
  pollingInterval = null;
}

async function resetLastHashIfServerIsEmpty() {
  try {
    const res = await fetch("https://api.getoridium.com/blockchain");
    const chain = await res.json();
    if (Array.isArray(chain) && chain.length === 0) {
      console.warn("⚠️ Server blockchain empty. Resetting local lastSentHash to 0");
      lastSentHash = "0";
      localStorage.setItem("orid_last_sent_hash", "0");
    }
  } catch (err) {
    console.error("❌ Could not verify blockchain state:", err);
  }
}

async function toggleMining() {
  const playIcon = document.getElementById("icon-play");
  const pauseIcon = document.getElementById("icon-pause");
  const statusText = document.getElementById("mining-status");

  const walletAddress = getConnectedWalletAddress();
  if (!walletAddress) {
    alert("Please connect your wallet to start mining.");
    return;
  }
  window.walletAddress = walletAddress;

  if (miningActive) {
    stopMining();
    if (playIcon) playIcon.style.display = "inline";
    if (pauseIcon) pauseIcon.style.display = "none";
    if (statusText) statusText.textContent = "Mining is paused ⏸️";
  } else {
    await resetLastHashIfServerIsEmpty();
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

  try {
    worker = new Worker("./scripts/miner-worker.js");
  } catch (e) {
    return;
  }

  worker.onmessage = async (e) => {
    if (e.data.type === "ready") {
      const inputStr = `Oridium block #${blockCounter++}`;
      const difficulty = getGlobalDifficulty();
      worker.postMessage({ type: "start", input: inputStr, difficulty });
    }

    if (e.data.type === "result") {
      if (e.data.error) return;

      const { nonce, hash } = e.data.data;
      const address = getConnectedWalletAddress();
      const pseudo = localStorage.getItem("orid_wallet_pseudo") || "Anonymous";

      if (address) {
        console.log(`🧾 Mining block for ${pseudo} at address ${address}`);

        const block = {
          index: blockCounter,
          timestamp: Date.now(),
          transactions: [{
            sender: "System",
            receiver: address,
            amount: 0.0001,
            pseudo
          }],
          previousHash: lastSentHash || "0",
          hash,
          nonce: Number(nonce)
        };
        pendingBlocks.push(block);
      }

      const statusText = document.getElementById("mining-status");
      if (statusText) {
        statusText.textContent = "One ORID mined! 🚀";
        setTimeout(() => {
          if (miningActive) statusText.textContent = "Mining in progress ⛏️";
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

  dynamicBatchLoop();
}

function getDynamicInterval() {
  const count = pendingBlocks.length;
  if (count > 10) return 3000;
  if (count > 5) return 5000;
  if (count > 2) return 7000;
  return 10000;
}

function dynamicBatchLoop() {
  if (!miningActive) return;

  if (pendingBlocks.length > 0) {
    const blocksToSend = [...pendingBlocks];
    pendingBlocks = [];

    for (let i = 0; i < blocksToSend.length; i++) {
      blocksToSend[i].previousHash = i === 0 ? lastSentHash : blocksToSend[i - 1].hash;
    }

    const cleaned = blocksToSend.map((b, i) => ({
      ...b,
      index: blockCounter - blocksToSend.length + i
    }));

    console.log("🚀 Sending batch of", cleaned.length, "blocks:", cleaned);

    fetch("https://api.getoridium.com/batch-add-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleaned)
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        const accepted = cleaned.length;
        oridiumEarned += accepted * 0.0001;
        document.getElementById("oridium-earned").textContent = oridiumEarned.toFixed(4);

        updateBalance();
        lastSentHash = cleaned[cleaned.length - 1].hash;
        localStorage.setItem("orid_last_sent_hash", lastSentHash);
      } else {
        console.error("❌ Rejected batch:", result);
        pendingBlocks.push(...blocksToSend);
        stopMining();
        showNetworkBusyModal(10);
      }
    }).catch(err => {
      console.error("❌ Batch send failed:", err);
      pendingBlocks.push(...blocksToSend);
      stopMining();
      showNetworkBusyModal(10);
    });
  }

  batchTimeout = setTimeout(dynamicBatchLoop, getDynamicInterval());
}

function stopMining() {
  miningActive = false;
  if (worker) {
    worker.postMessage({ type: "stop" });
    worker.terminate();
    worker = null;
  }
  clearInterval(runtimeInterval);
  clearTimeout(batchTimeout);
  runtimeInterval = null;
  batchTimeout = null;
  runtimeSeconds = 0;
}

function formatRuntime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function showNetworkBusyModal(seconds = 10) {
  const modal = document.getElementById("network-busy-modal");
  const countdown = document.getElementById("network-countdown");
  const closeBtn = document.getElementById("close-network-busy");

  if (!modal || !countdown || !closeBtn) return;

  stopMining();

  document.getElementById("icon-play").style.display = "inline";
  document.getElementById("icon-pause").style.display = "none";
  document.getElementById("mining-status").textContent = "Mining is paused ⏸️";

  modal.classList.remove("hidden", "no-blur");
  const content = modal.querySelector(".modal-content");
  content.classList.remove("fade-out");
  content.classList.add("fade-in");

  let remaining = seconds;
  countdown.textContent = `${remaining}s`;
  closeBtn.disabled = true;

  const interval = setInterval(() => {
    remaining--;
    countdown.textContent = `${remaining}s`;
    if (remaining <= 0) {
      clearInterval(interval);
      closeBtn.disabled = false;
    }
  }, 1000);

  closeBtn.addEventListener("click", () => {
    modal.classList.add("no-blur");
    content.classList.remove("fade-in");
    content.classList.add("fade-out");
    setTimeout(() => modal.classList.add("hidden"), 300);
  }, { once: true });
}

window.toggleMining = toggleMining;
window.showNetworkBusyModal = showNetworkBusyModal;
window.updateBalance = updateBalance;
