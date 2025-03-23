// Oridium Project - (c) 2025 Oridium - MIT License
#ifndef BLOCK_H
#define BLOCK_H

#include <string>
#include <vector>
#include <cstdint>
#include "Transaction.h"

class Block {
public:
    int index;
    int64_t timestamp;
    std::vector<Transaction> transactions;
    std::string previousHash;
    std::string hash;
    int nonce;

    Block(int idx, int64_t time, const std::vector<Transaction>& txs, const std::string& prevHash);
    Block(int idx, const std::vector<Transaction>& txs); // Constructor for Genesis block

    std::string calculateHash() const;
    void mineBlock(int difficulty);
};

#endif // BLOCK_H