// modules/central-bank/ban-control.js

import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data/banned-wallets.json');

// 🔄 Lecture de la liste des wallets bannis
function readBannedWallets() {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error("❌ Failed to read banned-wallets.json:", err);
    return [];
  }
}

// 💾 Sauvegarde de la liste mise à jour
function writeBannedWallets(wallets) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
  } catch (err) {
    console.error("❌ Failed to write banned-wallets.json:", err);
  }
}

// 🚫 Bannir un wallet
export function banWallet(address, reason = "No reason provided") {
  const lower = address.toLowerCase();
  const list = readBannedWallets();

  if (list.some(w => w.address === lower)) return false;

  list.push({
    address: lower,
    reason,
    bannedAt: new Date().toISOString()
  });

  writeBannedWallets(list);
  return true;
}

// ✅ Débannir un wallet
export function unbanWallet(address) {
  const lower = address.toLowerCase();
  const list = readBannedWallets();
  const updated = list.filter(w => w.address !== lower);

  if (updated.length === list.length) return false;

  writeBannedWallets(updated);
  return true;
}

// 🔍 Vérifie si un wallet est banni
export function isWalletBanned(address) {
  const lower = address.toLowerCase();
  return readBannedWallets().some(w => w.address === lower);
}

// 📋 Récupère toute la liste des bannis
export function getBannedWallets() {
  return readBannedWallets();
}