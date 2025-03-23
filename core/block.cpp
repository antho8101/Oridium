// Oridium Project - (c) 2025 Tony - MIT License
#include "Block.h"
#include "util.h"
#include <sstream>
#include <iostream>

// Constructor complet avec timestamp
Block::Block(int idx, int64_t time, const std::vector<Transaction>& txs, const std::string& prevHash)
    : index(idx), timestamp(time), transactions(txs), previousHash(prevHash), nonce(0) {
    hash = calculateHash();
}

// Constructor Genesis Block sans timestamp
Block::Block(int idx, const std::vector<Transaction>& txs)
    : index(idx), timestamp(0), transactions(txs), previousHash("0"), nonce(0) {
    hash = calculateHash();
}

std::string Block::calculateHash() const {
    std::stringstream ss;
    ss << index << timestamp;

    // Concatène toutes les transactions sous forme texte
    for (const auto& tx : transactions) {
        ss << tx.toString();
    }

    ss << previousHash << nonce;
    return sha256(ss.str());
}

void Block::mineBlock(int difficulty) {
    std::string target(difficulty, '0');
    do {
        nonce++;
        hash = calculateHash();
    } while (hash.substr(0, difficulty) != target);

    std::cout << "✅ Bloc " << index << " miné avec succès. Hash : " << hash << "\n";
}