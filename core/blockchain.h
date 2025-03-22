#pragma once
#include "block.h"
#include <vector>

class Blockchain {
public:
    Blockchain();

    void addBlock(const std::string& data);
    void printChain() const;

private:
    std::vector<Block> chain;
};