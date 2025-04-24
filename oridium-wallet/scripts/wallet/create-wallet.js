import {
  generateWallet,
  encryptPrivateKey,
  downloadFile
} from './wallet-generator.js';

let savedWallet = null;

document.getElementById('generate-wallet').addEventListener('click', () => {
  const pseudo = document.getElementById('wallet-pseudo').value.trim();
  const seed = document.getElementById('seed-phrase').value.trim();

  if (!seed) {
    document.getElementById('seed-error').classList.remove('hidden');
    return;
  }

  const { privateKey, publicKey } = generateWallet(seed);

  // Stocke tout dans un objet
  savedWallet = {
    pseudo: pseudo || "Anonymous",
    privateKey,
    publicKey,
    createdAt: Date.now()
  };

  // Affiche la clé publique dans l'UI
  document.getElementById('public-key').value = publicKey;

  // Active le bouton de téléchargement
  document.getElementById('download-wallet').disabled = false;
});

document.getElementById('download-wallet').addEventListener('click', () => {
  const password = document.getElementById('wallet-password').value;
  const confirm = document.getElementById('wallet-password-confirm').value;

  if (!savedWallet) return alert("Generate your wallet first.");

  const result = {
    pseudo: savedWallet.pseudo,
    publicKey: savedWallet.publicKey,
    createdAt: savedWallet.createdAt
  };

  if (password && password === confirm) {
    result.encrypted = encryptPrivateKey(savedWallet.privateKey, password);
  } else {
    result.privateKey = savedWallet.privateKey;
  }

  const fileContent = JSON.stringify(result, null, 2);
  downloadFile(fileContent, 'oridium_wallet.json');
});