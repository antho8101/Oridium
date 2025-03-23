// Oridium Project - (c) 2025 Tony - MIT License
#ifndef STORAGE_H
#define STORAGE_H

#include "Blockchain.h"
#include "Transaction.h"
#include <string>

class Storage {
public:
    static bool saveBlockchain(const Blockchain& blockchain, const std::string& filename);
    static bool loadBlockchain(Blockchain& blockchain, const std::string& filename);
};

#endif // STORAGE_H