// Oridium Project - (c) 2025 Tony - MIT License
#ifndef BLOCKCHAIN_H
#define BLOCKCHAIN_H

#include "Block.h"
#include "Transaction.h"
#include <vector>
#include <iostream>

class Blockchain {
public:
    Blockchain();

    // Ajoute un bloc construit depuis des transactions
    void addBlock(const std::vector<Transaction>& transactions);

    // Ajoute un bloc déjà construit (utile pour le chargement depuis un fichier)
    void addBlock(const Block& block);

    void printChain() const;
    bool isChainValid() const;

    // Getter sécurisé pour accéder à la blockchain (lecture seule)
    const std::vector<Block>& getChain() const { return chain; }

    // Reset sécurisé de la blockchain
    void clearChain() { chain.clear(); }

private:
    std::vector<Block> chain;
    const int difficulty = 2;  // Difficulté de la Proof of Work
};

#endif // BLOCKCHAIN_H