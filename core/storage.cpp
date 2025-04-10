// Oridium Project - (c) 2025 Oridium - MIT License
#include "storage.h"
#include "blockchain.h"
#include "block.h"
#include <fstream>
#include <nlohmann/json.hpp>
#include <iostream>
#include <filesystem>

using json = nlohmann::json;
namespace fs = std::filesystem;

bool Storage::saveBlockchain(const Blockchain& blockchain, const std::string& filename) {
    fs::create_directories("/data/"); // ✅ Make sure the 'data' folder exists

    json j_chain = json::array();
    const auto& chainData = blockchain.getChain();

    for (const auto& block : chainData) {
        json j_block;
        j_block["index"] = block.index;
        j_block["timestamp"] = block.timestamp;
        j_block["previousHash"] = block.previousHash;
        j_block["hash"] = block.hash;
        j_block["nonce"] = block.nonce;

        json j_txs = json::array();
        for (const auto& tx : block.transactions) {
            json j_tx;
            j_tx["sender"] = tx.sender;
            j_tx["receiver"] = tx.receiver;
            j_tx["amount"] = tx.amount;
            j_tx["signature"] = tx.signature;
            j_txs.push_back(j_tx);
        }
        j_block["transactions"] = j_txs;
        j_chain.push_back(j_block);
    }

    std::ofstream file("/data/" + filename); // ✅ Ne pas ajouter "data/" ici
if (!file.is_open()) {
    std::cerr << "❌ Error: Cannot open " << filename << " for writing.\n";
    return false;
}

    file << j_chain.dump(4);
    file.close();
    std::cout << "✅ Blockchain saved to data/" << filename << "\n";
    return true;
}

bool Storage::loadBlockchain(Blockchain& blockchain, const std::string& filename) {
    std::ifstream file("/data/" + filename); // ✅ idem
if (!file.is_open()) {
    std::cerr << "❌ Error: File " << filename << " not found.\n";
    return false;
}

    json j_chain;
    try {
        file >> j_chain;
    } catch (const std::exception& e) {
        std::cerr << "❌ Error parsing JSON: " << e.what() << "\n";
        return false;
    }
    file.close();

    if (!j_chain.is_array()) {
        std::cerr << "❌ Invalid JSON format: expected array\n";
        return false;
    }

    blockchain.clearChain();

    for (const auto& j_block : j_chain) {
        // Vérifie tous les champs nécessaires
        if (!j_block.contains("index") || !j_block.contains("timestamp") || !j_block.contains("previousHash")
            || !j_block.contains("hash") || !j_block.contains("nonce") || !j_block.contains("transactions")) {
            std::cerr << "❌ Incomplete block data found\n";
            return false;
        }

        if (!j_block["transactions"].is_array()) {
            std::cerr << "❌ Invalid transactions format\n";
            return false;
        }

        std::vector<Transaction> transactions;
        for (const auto& j_tx : j_block["transactions"]) {
            if (!j_tx.contains("sender") || !j_tx.contains("receiver") || !j_tx.contains("amount") || !j_tx.contains("signature")) {
                std::cerr << "❌ Invalid transaction in block\n";
                return false;
            }

            Transaction tx(
                j_tx["sender"].get<std::string>(),
                j_tx["receiver"].get<std::string>(),
                j_tx["amount"].get<double>()
            );
            tx.signature = j_tx["signature"].get<std::string>();
            transactions.push_back(tx);
        }

        Block block(
            j_block["index"].get<int>(),
            j_block["timestamp"].get<int64_t>(),
            transactions,
            j_block["previousHash"].get<std::string>()
        );
        block.hash = j_block["hash"].get<std::string>();
        block.nonce = j_block["nonce"].get<int>();

        blockchain.addBlock(block);  // Utilisation de addBlock ici
    }

    std::cout << "✅ Blockchain loaded from data/" << filename << "\n";
    return true;
}
