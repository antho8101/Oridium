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
            if(e.data.type === 'ready') {
                logStatus("Mining started ⚒️");
                minerWorker.postMessage('start');
            } else if(e.data.type === 'result') {
                let [nonce, hash] = e.data.data.split(";");
                console.log(`Block mined! Nonce: ${nonce}, Hash: ${hash}`);
                minedOridium += 0.0001;
                document.getElementById("oridium-earned").innerText = minedOridium.toFixed(4) + " ORID";
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