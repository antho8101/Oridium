#include "block.h"
#include <sstream>
#include <iostream>
#include <chrono>

Block::Block(int idx, int64_t time, const std::vector<std::string>& txs, const std::string& prevHash)
    : index(idx), timestamp(time), transactions(txs), previousHash(prevHash), nonce(0) {
    hash = calculateHash();
}

Block::Block(int idx, const std::vector<std::string>& txs)
    : index(idx), transactions(txs), nonce(0) {
    timestamp = static_cast<int64_t>(std::chrono::system_clock::now().time_since_epoch().count());
    previousHash = "0";
    hash = calculateHash();
}

std::string Block::calculateHash() const {
    std::stringstream ss;
    ss << index << timestamp;
    for (const auto& tx : transactions) {
        ss << tx;
    }
    ss << previousHash << nonce;
    return std::to_string(std::hash<std::string>{}(ss.str()));
}

// 🔥 Test temporaire sans boucle infinie
void Block::mineBlock(int difficulty) {
    std::cout << "🚀 Mining block " << index << "...\n";
    // On évite la boucle infinie ici
    hash = calculateHash();
    std::cout << "✅ Block mined: " << hash << "\n";
}