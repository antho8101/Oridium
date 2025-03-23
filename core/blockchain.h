// Oridium Project - (c) 2025 Oridium - MIT License
#ifndef BLOCKCHAIN_H
#define BLOCKCHAIN_H

#include "Block.h"
#include "Transaction.h"
#include "storage.h"
#include <vector>
#include <iostream>

class Blockchain {
public:
    Blockchain();

    // Ajoute un bloc construit depuis des transactions
    void addBlock(const std::vector<Transaction>& transactions);

    // Ajoute un bloc déjà construit (utile pour le chargement depuis un fichier)
    void addBlock(const Block& block);

    // ✅ Ajout au mempool
    void addTransaction(const Transaction& tx);

    // ✅ Mine les transactions du mempool
    void minePendingTransactions();

    void printChain() const;
    bool isChainValid() const;

    // Getter sécurisé
    const std::vector<Block>& getChain() const { return chain; }

    // Reset sécurisé
    void clearChain() { chain.clear(); }

private:
    std::vector<Block> chain;
    std::vector<Transaction> mempool;   // ✅ Mempool pour les transactions en attente
    const int difficulty = 2;           // Difficulté de la Proof of Work

    void save() const;  // ✅ Sauvegarde automatique
};

#endif // BLOCKCHAIN_H