let miningRunning = false;
let miningInterval;
let minedOridium = 0.00;
let miningTime = 0;

function startMining() {
    if (!miningRunning) {
        console.log("Mining started...");
        miningRunning = true;
        miningInterval = setInterval(updateMiningStats, 1000); // Mise à jour toutes les secondes
        Module._mine(); // Appel de la fonction du module WebAssembly pour démarrer le minage
        document.getElementById("mining-status").innerText = "Mining is running..."; // Mise à jour du texte à l'écran
        document.getElementById("icon-play").style.display = "none"; // Changer l'icône play
        document.getElementById("icon-pause").style.display = "inline-block"; // Afficher l'icône pause
    }
}

function stopMining() {
    if (miningRunning) {
        console.log("Mining stopped.");
        miningRunning = false;
        clearInterval(miningInterval); // Arrêter l'intervalle
        document.getElementById("mining-status").innerText = "Mining is paused...";
        document.getElementById("icon-play").style.display = "inline-block"; // Afficher l'icône play
        document.getElementById("icon-pause").style.display = "none"; // Cacher l'icône pause
    }
}

function updateMiningStats() {
    miningTime++;
    minedOridium += 0.0001; // Augmenter la quantité d'Oridium miné (c'est un exemple)

    // Mettre à jour les éléments de l'interface avec le temps et l'Oridium miné
    document.getElementById("runtime").innerText = formatTime(miningTime);
    document.getElementById("oridium-earned").innerText = minedOridium.toFixed(4) + " ORID";
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

document.getElementById("mining-toggle").addEventListener("click", function() {
    if (miningRunning) {
        stopMining();
    } else {
        startMining();
    }
});