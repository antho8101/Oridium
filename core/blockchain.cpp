// Oridium Project - (c) 2025 Oridium - MIT License
#include "blockchain.h"
#include <iostream>
#include <chrono>
#include <filesystem>
#include <emscripten/emscripten.h>
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#pragma message("✅ Compiling blockchain.cpp version avec rewardMiner()")

// ✅ Constructeur avec Genesis Block
Blockchain::Blockchain() {
    if (std::filesystem::exists("blockchain.json")) {
        std::cout << "📦 Existing blockchain found, loading...\n";
        loadFromDisk();
    } else {
        std::cout << "✅ Blockchain initialized with Genesis Block\n";
        std::vector<Transaction> genesisTx = { Transaction("System", "Genesis", 0.0) };
        chain.emplace_back(0, genesisTx);
        save();  // ✅ Save after Genesis Block
    }
}

void Blockchain::loadFromDisk() {
    Blockchain temp;
    if (Storage::loadBlockchain(temp, "blockchain.json")) {
        chain = temp.getChain(); // Copie la chaîne
    } else {
        std::cerr << "❌ Failed to load blockchain from disk.\n";
    }
}

void Blockchain::addBlock(const std::vector<Transaction>& transactions) {
    std::cout << "✅ Attempting to add a block with " << transactions.size() << " transaction(s)\n";

    const Block& prev = chain.back();
    Block newBlock(
        prev.index + 1,
        static_cast<int64_t>(std::chrono::system_clock::now().time_since_epoch().count()),
        transactions,
        prev.hash
    );

    std::cout << "⚙️  Mining block " << newBlock.index << " with difficulty " << difficulty << "...\n";
    newBlock.mineBlock(difficulty);

    chain.push_back(newBlock);
    save();  // ✅ Save after adding block
}

void Blockchain::addBlock(const Block& block) {
    chain.push_back(block);
    save();  // ✅ Save after adding
}

void Blockchain::addTransaction(const Transaction& tx) {
    mempool.push_back(tx);
    std::cout << "✅ Transaction added to mempool: " << tx.toString() << "\n";
}

void Blockchain::rewardMiner(const std::string& minerAddress) {
    Transaction reward("System", minerAddress, 50.0);
    addTransaction(reward);
    minePendingTransactions();
}

void Blockchain::minePendingTransactions() {
    if (mempool.empty()) {
        std::cout << "⚠️  Mempool empty, nothing to mine.\n";
        return;
    }
    std::cout << "✅ Mining " << mempool.size() << " pending transaction(s)...\n";
    addBlock(mempool);
    mempool.clear();
    std::cout << "✅ Mempool cleared after mining.\n";
}

void Blockchain::printChain() const {
    std::cout << "📝 Printing blockchain:\n";
    for (const auto& block : chain) {
        std::cout << "Index: " << block.index << "\n";
        for (const auto& tx : block.transactions) {
            std::cout << "Transaction: " << tx.toString() << "\n";
        }
        std::cout << "Hash: " << block.hash << "\n\n";
    }
}

bool Blockchain::isChainValid() const {
    std::cout << "🛠️  Validating blockchain integrity...\n";
    for (size_t i = 1; i < chain.size(); ++i) {
        const Block& current = chain[i];
        const Block& previous = chain[i - 1];

        if (current.hash != current.calculateHash()) {
            std::cerr << "❌ Invalid hash at block " << i << "\n";
            return false;
        }
        if (current.previousHash != previous.hash) {
            std::cerr << "❌ Invalid previous hash at block " << i << "\n";
            return false;
        }
    }
    std::cout << "✅ Blockchain is valid.\n";
    return true;
}

double Blockchain::getBalance(const std::string& address) const {
    double balance = 0.0;
    for (const auto& block : chain) {
        for (const auto& tx : block.transactions) {
            if (tx.sender == address) balance -= tx.amount;
            if (tx.receiver == address) balance += tx.amount;
        }
    }
    return balance;
}

void Blockchain::save() const {
    Storage::saveBlockchain(*this, "blockchain.json");
}

// ✅ Partie exposée à JavaScript via WebAssembly
extern "C" {

    // Marquer la fonction comme utilisée et gardée par Emscripten
    EMSCRIPTEN_KEEPALIVE
    void mine_reward(const char* address) {
        static Blockchain blockchain;
        blockchain.rewardMiner(std::string(address));
    }
    
    EMSCRIPTEN_KEEPALIVE
    double get_balance(const char* address) {
        static Blockchain blockchain;
        return blockchain.getBalance(std::string(address));
    }
    
    }    