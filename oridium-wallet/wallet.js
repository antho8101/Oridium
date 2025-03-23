document.getElementById('generateWalletBtn').addEventListener('click', function () {
    generateWallet();
});

document.getElementById('downloadWalletBtn').addEventListener('click', function () {
    downloadWallet();
});

function generateWallet() {
    const mnemonic = document.getElementById('mnemonic').value;
    const password = document.getElementById('password').value;

    // Vérification si la phrase mnémotechnique est valide
    if (!ethers.utils.isValidMnemonic(mnemonic)) {
        alert("Invalid mnemonic phrase. Please enter a valid one.");
        return;
    }

    // Crypter la phrase mnémotechnique avec le mot de passe
    const encryptedMnemonic = ethers.utils.entropyToMnemonic(ethers.utils.hashMessage(mnemonic + password));

    // Générer le wallet à partir de la phrase mnémotechnique cryptée
    const wallet = ethers.Wallet.fromMnemonic(encryptedMnemonic);

    // Afficher l'adresse et la clé privée
    document.getElementById('address').textContent = "Address: " + wallet.address;
    document.getElementById('privateKey').textContent = "Private Key: " + wallet.privateKey;

    // Affichage du wallet info
    document.getElementById('walletInfo').style.display = 'block';
}

function downloadWallet() {
    const mnemonic = document.getElementById('mnemonic').value;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    const walletData = {
        mnemonic: mnemonic,
        address: wallet.address,
        privateKey: wallet.privateKey
    };

    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'oridium_wallet.json';
    link.click();
}