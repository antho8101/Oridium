// Oridium Project - (c) 2025 Oridium - MIT License
#include "blockchain.h"
#include <iostream>
#include <chrono>

// ✅ Constructor with Genesis Block
Blockchain::Blockchain() {
    std::cout << "✅ Blockchain initialized with Genesis Block\n";
    std::vector<Transaction> genesisTx = { Transaction("System", "Genesis", 0.0) };
    chain.emplace_back(0, genesisTx);
    save();  // ✅ Save after Genesis Block
}

// ✅ Add a new block from a vector of transactions
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

// ✅ Add a block (for JSON deserialization)
void Blockchain::addBlock(const Block& block) {
    chain.push_back(block);
    save();  // ✅ Save after adding
}

// ✅ Add transaction to mempool
void Blockchain::addTransaction(const Transaction& tx) {
    mempool.push_back(tx);
    std::cout << "✅ Transaction added to mempool: " << tx.toString() << "\n";
}

// ✅ Mine all transactions in the mempool
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

// ✅ Print the entire blockchain
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

// ✅ Validate the blockchain
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

// ✅ Get the balance of an address
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

// ✅ Save the blockchain to disk
void Blockchain::save() const {
    Storage::saveBlockchain(*this, "blockchain.json");
}