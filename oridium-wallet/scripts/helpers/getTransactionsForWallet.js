export function getTransactionsForWallet(chain, walletAddress) {
    const lowerAddr = walletAddress.toLowerCase();
    const results = [];
  
    for (const block of chain) {
      if (!block.transactions || !Array.isArray(block.transactions)) continue;
  
      for (const tx of block.transactions) {
        const isSender = tx.sender?.toLowerCase() === lowerAddr;
        const isReceiver = tx.receiver?.toLowerCase() === lowerAddr;
  
        if (isSender || isReceiver) {
          results.push({
            ...tx,
            blockTimestamp: block.timestamp,
          });
        }
      }
    }
  
    return results;
  }  