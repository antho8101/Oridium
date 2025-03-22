#include "blockchain.h"
#include <iostream>

Blockchain::Blockchain() {
    chain.emplace_back(0, "Genesis Block");
}

void Blockchain::addBlock(const std::string& data) {
    const Block& prev = chain.back();
    chain.emplace_back(prev.index + 1, data);
}

void Blockchain::printChain() const {
    for (const auto& block : chain) {
        std::cout << "Index: " << block.index << "\n";
        std::cout << "Data: " << block.data << "\n";
        std::cout << "Hash: " << block.hash << "\n\n";
    }
}