// Oridium Project - (c) 2025 Oridium - MIT License
#include "storage.h"
#include "blockchain.h"
#include "Block.h"
#include "util.h"
#include <fstream>
#include <nlohmann/json.hpp>
#include <iostream>
#include <filesystem>

using json = nlohmann::json;
namespace fs = std::filesystem;

bool Storage::saveBlockchain(const Blockchain& blockchain, const std::string& filename) {
    fs::create_directories("data"); // ✅ Assure que le dossier data existe

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

    std::ofstream file("data/" + filename);
    if (!file.is_open()) {
        std::cerr << "❌ Erreur : Impossible d'ouvrir data/" << filename << " en écriture.\n";
        return false;
    }

    file << j_chain.dump(4);
    file.close();
    std::cout << "✅ Blockchain sauvegardée dans data/" << filename << "\n";
    return true;
}

bool Storage::loadBlockchain(Blockchain& blockchain, const std::string& filename) {
    std::ifstream file("data/" + filename);
    if (!file.is_open()) {
        std::cerr << "❌ Erreur : Fichier data/" << filename << " introuvable.\n";
        return false;
    }

    json j_chain;
    file >> j_chain;
    file.close();

    blockchain.clearChain(); // ✅ Reset sécurisé

    for (const auto& j_block : j_chain) {
        std::vector<Transaction> transactions;
        for (const auto& j_tx : j_block["transactions"]) {
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

        blockchain.addBlock(block);
    }

    std::cout << "✅ Blockchain chargée depuis data/" << filename << "\n";
    return true;
}