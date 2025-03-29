let miningRunning = false;
let miningInterval;
let minedOridium = 0.00;
let miningTime = 0;

function startMining() {
    if (!miningRunning) {
        console.log("Mining started...");
        miningRunning = true;

        miningInterval = setInterval(() => {
            if (typeof Module !== 'undefined' && typeof Module._mine === 'function') {
                const mined = Module._mine(); // Appel réel à la fonction WebAssembly
                if (typeof mined === 'number') {
                    minedOridium += mined;
                } else {
                    console.warn("⚠️ _mine() did not return a number");
                }
            } else {
                console.warn("⚠️ Module or _mine() is not defined yet.");
            }

            miningTime++;
            updateMiningStats();
        }, 1000); // Toutes les secondes

        document.getElementById("mining-status").innerText = "Mining is running...";
        document.getElementById("icon-play").style.display = "none";
        document.getElementById("icon-pause").style.display = "inline-block";
    }
}

function stopMining() {
    if (miningRunning) {
        console.log("Mining stopped.");
        miningRunning = false;
        clearInterval(miningInterval);

        document.getElementById("mining-status").innerText = "Mining is paused...";
        document.getElementById("icon-play").style.display = "inline-block";
        document.getElementById("icon-pause").style.display = "none";
    }
}

function updateMiningStats() {
    document.getElementById("runtime").innerText = formatTime(miningTime);
    document.getElementById("oridium-earned").innerText = minedOridium.toFixed(4) + " ORID";
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

document.getElementById("mining-toggle").addEventListener("click", function () {
    if (miningRunning) {
        stopMining();
    } else {
        startMining();
    }
});