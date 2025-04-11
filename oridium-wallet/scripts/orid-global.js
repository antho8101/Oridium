import {
    registerWallet,
    getBalance,
    submitBlock,
    getBlockchain
  } from "./orid-network.js";
  
  window.registerWallet = registerWallet;
  window.getBalance = getBalance;
  window.submitBlock = submitBlock;
  window.getBlockchain = getBlockchain;
  
  console.log("✅ Fonctions exposées globalement");  