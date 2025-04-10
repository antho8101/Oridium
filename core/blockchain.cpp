#include "blockchain.h"
#include "block.h"
#include "storage.h"
#include <iostream>
#include <chrono>
#include <memory>
#include <emscripten.h>

const double MAX_SUPPLY = 21000000.0;
const double MINING_REWARD = 0.0001;

static bool blockchainCreated = false;
static std::unique_ptr<Blockchain> globalBlockchain;

Blockchain::Blockchain() {
    std::cout << "🚧 Blockchain constructor started\n";

    if (blockchainCreated) {
        std::cout << "⚠️ Blockchain already created, skipping reinitialization.\n";
        return;
    }

    loadBlockchainFromDisk();

    if (chain.empty()) {
        std::vector<Transaction> genesisTx = { Transaction("System", "Genesis", 0.0) };
        chain.emplace_back(0, genesisTx);
        std::cout << "✅ Genesis block created\n";
        save();
    }

    EM_ASM({
        FS.syncfs(false, function(err) {
            if (err) console.error("❌ syncfs after blockchain init failed", err);
            else console.log("💾 syncfs after blockchain init complete");
        });
    });

    blockchainCreated = true;
    std::cout << "✅ Blockchain ready\n";
}

void Blockchain::addBlock(const Block& block) {
    std::cout << "✅ Block " << block.index << " added to chain.\n";
    chain.push_back(block);
    save();
}

void Blockchain::loadBlockchainFromDisk() {
    if (Storage::loadBlockchain(*this, "/data/blockchain.json")) {
        if (!chain.empty()) {
            std::cout << "✅ Blockchain loaded from blockchain.json (" << chain.size() << " blocks)\n";
        } else {
            std::cout << "⚠️ Blockchain file found but empty. Creating Genesis block.\n";
        }
    } else {
        std::cout << "📂 No blockchain file found. Creating Genesis block.\n";
    }
}

void Blockchain::addBlock(const std::vector<Transaction>& transactions) {
    const Block& prev = chain.back();
    Block newBlock(
        prev.index + 1,
        static_cast<int64_t>(std::chrono::system_clock::now().time_since_epoch().count()),
        transactions,
        prev.hash
    );

    newBlock.mineBlock(difficulty);
    chain.push_back(newBlock);
    std::cout << "✅ Block " << newBlock.index << " successfully mined. Hash: " << newBlock.hash << "\n";

    save();

    EM_ASM({
        FS.syncfs(false, function(err) {
            if (err) console.error("❌ syncfs after mining failed", err);
            else console.log("💾 syncfs after mining complete");
        });
    });
}

void Blockchain::addTransaction(const Transaction& tx) {
    mempool.push_back(tx);
}

void Blockchain::rewardMiner(const std::string& minerAddress) {
    Transaction reward("System", minerAddress, MINING_REWARD);
    addTransaction(reward);
    minePendingTransactions();
}

void Blockchain::minePendingTransactions() {
    if (mempool.empty()) return;
    addBlock(mempool);
    mempool.clear();
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
    Storage::saveBlockchain(*this, "/data/blockchain.json");

    EM_ASM({
        FS.syncfs(false, function(err) {
          if (err) console.error("❌ syncfs after save failed", err);
          else console.log("💾 syncfs after save complete");
        });
      });      
}


extern "C" {

EMSCRIPTEN_KEEPALIVE
void init_blockchain() {
    std::cout << "🚀 [WASM] init_blockchain called\n";
    // Intentionally left blank — handled in JS.
}

EMSCRIPTEN_KEEPALIVE
void initialize_blockchain() {
    std::cout << "🚀 [WASM] initialize_blockchain called\n";
    if (!globalBlockchain) {
        globalBlockchain = std::make_unique<Blockchain>();
    }
}

EMSCRIPTEN_KEEPALIVE
void mine_reward(const char* address) {
    if (!globalBlockchain) return;
    globalBlockchain->rewardMiner(std::string(address));
}

EMSCRIPTEN_KEEPALIVE
double get_balance(const char* address) {
    if (!globalBlockchain) return 0.0;
    return globalBlockchain->getBalance(std::string(address));
}

} // extern "C"