// Oridium Project - (c) 2025 Oridium - MIT License
#ifndef BLOCKCHAIN_H
#define BLOCKCHAIN_H

#include "Block.h"
#include "Transaction.h"
#include "storage.h"
#include <vector>
#include <iostream>
#include <string>

class Blockchain {
public:
    Blockchain();

    void addBlock(const std::vector<Transaction>& transactions);
    void addBlock(const Block& block);
    void addTransaction(const Transaction& tx);
    void minePendingTransactions();
    double getBalance(const std::string& address) const;  // ✅ Nouveau : calcul du solde

    void printChain() const;
    bool isChainValid() const;
    const std::vector<Block>& getChain() const { return chain; }
    void clearChain() { chain.clear(); }

private:
    std::vector<Block> chain;
    std::vector<Transaction> mempool;
    const int difficulty = 2;

    void save() const;
};

#endif // BLOCKCHAIN_H