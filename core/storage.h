// Oridium Project - (c) 2025 Oridium - MIT License
#ifndef STORAGE_H
#define STORAGE_H
#include <nlohmann/json.hpp>

#include <string>

// ✅ Forward declaration
class Blockchain;

class Storage {
public:
    static bool saveBlockchain(const Blockchain& blockchain, const std::string& filename);
    static bool loadBlockchain(Blockchain& blockchain, const std::string& filename);
};

#endif // STORAGE_H