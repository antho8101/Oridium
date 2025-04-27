// scripts/helpers/getBlockchain.js

export async function getBlockchain() {
    const res = await fetch('https://oridium-production.up.railway.app/blockchain');
    if (!res.ok) throw new Error('Failed to fetch blockchain');
    return await res.json();
  }  