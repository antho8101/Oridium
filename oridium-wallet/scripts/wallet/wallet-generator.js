// scripts/wallet/wallet-generator.js

import { ec as EC } from 'elliptic';
import CryptoJS from 'crypto-js';

const ec = new EC('secp256k1');

// 🔐 Génère une paire de clés
export function generateWallet() {
  const key = ec.genKeyPair();
  const privateKey = key.getPrivate('hex');
  const publicKey = key.getPublic('hex'); // clé publique non compressée
  return { privateKey, publicKey };
}

// 🔐 Chiffre la clé privée avec un mot de passe
export function encryptPrivateKey(privateKey, password) {
  return CryptoJS.AES.encrypt(privateKey, password).toString();
}

// 🔓 Déchiffre une clé privée chiffrée
export function decryptPrivateKey(cipherText, password) {
  const bytes = CryptoJS.AES.decrypt(cipherText, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// 💾 Télécharge un fichier
export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
