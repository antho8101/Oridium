let miningRunning = false;
let miningInterval;
let minedOridium = 0.0000;
let miningTime = 0;
let minerWorker;

function startMining() {
    if (!miningRunning) {
        miningRunning = true;
        miningInterval = setInterval(updateMiningStats, 1000);
        logStatus("Initializing mining worker ⚙️");
        toggleIcons(true);

        minerWorker = new Worker('scripts/miner-worker.js');

        minerWorker.onmessage = function(e) {
            if (e.data.type === 'ready') {
                logStatus("Mining started ⚒️");
                const pseudo = localStorage.getItem("orid_wallet_pseudo") || "Anonymous";
                minerWorker.postMessage({ type: 'start', pseudo });
            } else if (e.data.type === 'result') {
                let [nonce, hash] = e.data.data.split(";");
                const pseudo = localStorage.getItem("orid_wallet_pseudo") || "Anonymous";
                const address = localStorage.getItem("orid_wallet_address") || "unknown";

                const minedBlock = {
                    timestamp: Date.now(),
                    hash,
                    nonce: parseInt(nonce),
                    transactions: [{
                        sender: "System",
                        receiver: address,
                        amount: 0.0001,
                        pseudo
                    }]
                };

                // 🪪 Logging du bloc miné
                console.log(`📦 Block ready to send:
  👤 Sender: System
  🎯 Receiver: ${address}
  💰 Amount: 0.0001 ORID
  🧾 Pseudo: ${pseudo}
  🔐 Nonce: ${nonce}
  🧱 Hash: ${hash}
`);

                // 💾 Envoi du bloc au serveur
                fetch("https://oridium-production.up.railway.app/add-block", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(minedBlock)
                }).then(res => res.json())
                  .then(res => console.log("✅ Block sent:", res))
                  .catch(err => console.error("❌ Failed to send block:", err));

                minedOridium += 0.0001;
                document.getElementById("oridium-earned").textContent = oridiumEarned.toFixed(4);
                logStatus("One Oridium Mined ! 🚀");
            }
        };
    }
}

function stopMining() {
    if (miningRunning) {
        miningRunning = false;
        clearInterval(miningInterval);
        logStatus("Mining paused ⏸️");
        toggleIcons(false);
        minerWorker.postMessage('stop');
        minerWorker.terminate();
    }
}

function updateMiningStats() {
    miningTime++;
    document.getElementById("runtime").innerText = formatTime(miningTime);
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function logStatus(message) {
    document.getElementById("mining-status").innerText = message;
}

function toggleIcons(isMining) {
    document.getElementById("icon-play").style.display = isMining ? "none" : "inline-block";
    document.getElementById("icon-pause").style.display = isMining ? "inline-block" : "none";
}

document.getElementById("mining-toggle").addEventListener("click", function () {
    miningRunning ? stopMining() : startMining();
});