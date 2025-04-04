// Oridium Project - (c) 2025 Oridium - MIT License
#include "Block.h"
#include "sha256.h"
#include <sstream>
#include <iostream>

// Full constructor with timestamp
Block::Block(int idx, int64_t time, const std::vector<Transaction>& txs, const std::string& prevHash)
    : index(idx), timestamp(time), transactions(txs), previousHash(prevHash), nonce(0) {
    hash = calculateHash();
}

// Genesis Block constructor without timestamp
Block::Block(int idx, const std::vector<Transaction>& txs)
    : index(idx), timestamp(0), transactions(txs), previousHash("0"), nonce(0) {
    hash = calculateHash();
}

std::string Block::calculateHash() const {
    std::stringstream ss;
    ss << index << timestamp;

    // Concatenate all transactions as text
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

    std::cout << "✅ Block " << index << " successfully mined. Hash: " << hash << "\n";
}