// Oridium Project - (c) 2025 Oridium - MIT License
#include "blockchain.h"
#include <iostream>
#include <chrono>

// ✅ Constructeur avec Genesis Block
Blockchain::Blockchain() {
    std::cout << "✅ Initialisation de la blockchain avec le Genesis Block\n";
    std::vector<Transaction> genesisTx = { Transaction("System", "Genesis", 0.0) };
    chain.emplace_back(0, genesisTx);
    save();  // ✅ Sauvegarde du Genesis Block
}

// ✅ Ajout d'un nouveau bloc par vector<Transaction>
void Blockchain::addBlock(const std::vector<Transaction>& transactions) {
    std::cout << "✅ Tentative d'ajout d'un bloc avec " << transactions.size() << " transaction(s)\n";

    const Block& prev = chain.back();
    Block newBlock(
        prev.index + 1,
        static_cast<int64_t>(std::chrono::system_clock::now().time_since_epoch().count()),
        transactions,
        prev.hash
    );

    std::cout << "⚙️ Début du minage du bloc " << newBlock.index << " avec une difficulté de " << difficulty << "\n";
    newBlock.mineBlock(difficulty);

    chain.push_back(newBlock);
    save();  // ✅ Sauvegarde après ajout
}

// ✅ Ajout d'un bloc existant (pour la désérialisation JSON)
void Blockchain::addBlock(const Block& block) {
    chain.push_back(block);
    save();  // ✅ Sauvegarde après ajout
}

// ✅ Ajout d'une transaction dans le mempool
void Blockchain::addTransaction(const Transaction& tx) {
    mempool.push_back(tx);
    std::cout << "✅ Transaction ajoutée au mempool : " << tx.toString() << "\n";
}

// ✅ Minage des transactions du mempool
void Blockchain::minePendingTransactions() {
    if (mempool.empty()) {
        std::cout << "⚠️ Aucun transaction à miner.\n";
        return;
    }
    std::cout << "✅ Minage des " << mempool.size() << " transactions du mempool...\n";
    addBlock(mempool);
    mempool.clear();
    std::cout << "✅ Mempool vidé après minage.\n";
}

// ✅ Affichage de la Blockchain
void Blockchain::printChain() const {
    std::cout << "📝 Affichage de la blockchain :\n";
    for (const auto& block : chain) {
        std::cout << "Index: " << block.index << "\n";
        for (const auto& tx : block.transactions) {
            std::cout << "Transaction: " << tx.toString() << "\n";
        }
        std::cout << "Hash: " << block.hash << "\n\n";
    }
}

// ✅ Vérification de la validité de la Blockchain
bool Blockchain::isChainValid() const {
    std::cout << "🛠️ Vérification de la validité de la blockchain...\n";
    for (size_t i = 1; i < chain.size(); ++i) {
        const Block& current = chain[i];
        const Block& previous = chain[i - 1];

        if (current.hash != current.calculateHash()) {
            std::cerr << "❌ Invalid hash at block " << i << std::endl;
            return false;
        }
        if (current.previousHash != previous.hash) {
            std::cerr << "❌ Invalid previous hash at block " << i << std::endl;
            return false;
        }
    }
    std::cout << "✅ Blockchain valide\n";
    return true;
}

// ✅ Sauvegarde automatique de la blockchain sur disque
void Blockchain::save() const {
    Storage::saveBlockchain(*this, "blockchain.json");
}