#include "block.h"
#include "util.h"
#include <sstream>
#include <iostream>
#include <chrono>

// ✅ Constructeur principal
Block::Block(int idx, int64_t time, const std::vector<std::string>& txs, const std::string& prevHash)
    : index(idx), timestamp(time), transactions(txs), previousHash(prevHash), nonce(0) {
    hash = calculateHash();
}

// ✅ Constructeur Genesis Block
Block::Block(int idx, const std::vector<std::string>& txs)
    : index(idx), transactions(txs), nonce(0) {
    timestamp = static_cast<int64_t>(std::chrono::system_clock::now().time_since_epoch().count());
    previousHash = "0";
    hash = calculateHash();
}

// ✅ Calcul du hash avec SHA256
std::string Block::calculateHash() const {
    std::stringstream ss;
    ss << index << timestamp;
    for (const auto& tx : transactions) {
        ss << tx;
    }
    ss << previousHash << nonce;
    return sha256(ss.str());  // 🔥 Utilisation de la fonction SHA256 d'OpenSSL
}

// ✅ Minage du bloc avec preuve de travail
void Block::mineBlock(int difficulty) {
    std::string target(difficulty, '0');
    std::cout << "🚀 Mining block " << index << "...\n";
    do {
        nonce++;
        hash = calculateHash();
    } while (hash.substr(0, difficulty) != target);

    std::cout << "✅ Block mined: " << hash << "\n";
}