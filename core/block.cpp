#include "block.h"
#include <sstream>
#include <iostream>
#include <chrono>

// Constructeur complet
Block::Block(int idx, long time, const std::string& data, const std::string& prevHash)
    : index(idx), timestamp(time), data(data), previousHash(prevHash) {
    hash = calculateHash();
}

// ✅ Nouveau constructeur simplifié pour la Genesis Block
Block::Block(int idx, const std::string& data)
    : index(idx), data(data) {
    // Génère un timestamp automatique
    timestamp = static_cast<long>(std::chrono::system_clock::now().time_since_epoch().count());
    previousHash = "0";
    hash = calculateHash();
}

std::string Block::calculateHash() const {
    std::stringstream ss;
    ss << index << timestamp << data << previousHash;
    return std::to_string(std::hash<std::string>{}(ss.str()));
}