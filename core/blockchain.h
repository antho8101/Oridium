#ifndef BLOCKCHAIN_H
#define BLOCKCHAIN_H

#include "block.h"
#include <vector>

class Blockchain {
public:
    Blockchain();

    void addBlock(const std::vector<std::string>& transactions);
    void printChain() const;
    bool isChainValid() const;

private:
    std::vector<Block> chain;
    const int difficulty = 2;  // ✅ Difficulté de la Proof of Work
};

#endif // BLOCKCHAIN_H