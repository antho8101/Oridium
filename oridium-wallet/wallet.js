document.getElementById('generateWalletBtn').addEventListener('click', function () {
    generateWallet();
});

document.getElementById('restoreWalletBtn').addEventListener('click', function () {
    document.getElementById('restoreModal').style.display = 'flex';
});

document.getElementById('sendOridiumBtn').addEventListener('click', function () {
    document.getElementById('sendOridiumModal').style.display = 'flex';
});

document.getElementById('closeSendOridiumModal').addEventListener('click', function () {
    document.getElementById('sendOridiumModal').style.display = 'none';
});

document.getElementById('closeWalletModal').addEventListener('click', function () {
    document.getElementById('walletModal').style.display = 'none';
});

// Function to create wallet
function generateWallet() {
    const mnemonic = document.getElementById('mnemonic').value;
    const password = document.getElementById('password').value;
    const isEncryptChecked = document.getElementById('encryptWalletCheckbox').checked;

    // Wallet generation logic
}

// Function to handle sending Oridium
function sendOridium() {
    const recipientAddress = document.getElementById('recipient-address').value;
    const amountToSend = document.getElementById('amount-to-send').value;
    // Logic to send Oridium
}

// Download the wallet (json or encrypted)
function downloadWallet(walletData, isEncrypted) {
    let fileName = isEncrypted ? 'oridium_wallet_encrypted.json' : 'oridium_wallet.json';
    const fileBlob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const fileUrl = URL.createObjectURL(fileBlob);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    a.click();
}