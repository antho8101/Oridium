// scripts/wallet/create-wallet.js

import {
    generateWallet,
    encryptPrivateKey,
    downloadFile
  } from './wallet-generator.js';
  
  document.getElementById('generate-wallet-btn').addEventListener('click', () => {
    const { privateKey, publicKey } = generateWallet();
  
    // Affiche dans la modale
    document.getElementById('private-key-display').textContent = privateKey;
    document.getElementById('public-key-display').textContent = publicKey;
  
    // Active le bouton "Télécharger"
    document.getElementById('download-key-btn').disabled = false;
  
    // Stocke pour téléchargement
    window.generatedPrivateKey = privateKey;
    window.generatedPublicKey = publicKey;
  });
  
  document.getElementById('download-key-btn').addEventListener('click', () => {
    const password = document.getElementById('encrypt-password').value;
    const privateKey = window.generatedPrivateKey;
    const publicKey = window.generatedPublicKey;
  
    let fileContent = '';
  
    if (password) {
      const encrypted = encryptPrivateKey(privateKey, password);
      fileContent = `ENCRYPTED\n${encrypted}\nPUBLIC:\n${publicKey}`;
    } else {
      fileContent = `PRIVATE:\n${privateKey}\nPUBLIC:\n${publicKey}`;
    }
  
    downloadFile(fileContent, 'oridium_wallet.txt');
  });
  