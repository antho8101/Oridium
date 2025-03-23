// Oridium Project - (c) 2025 Oridium - MIT License
#include "blockchain.h"
#include "transaction.h"
#include "storage.h"
#include <iostream>
#include <windows.h>
#include <thread>
#include <chrono>
#include <filesystem>
#include <vector>
#include <sstream>

int main() {
    SetConsoleOutputCP(CP_UTF8);
    SetDllDirectoryA("E:\\Oridium\\external\\openssl\\");
    std::cout << "🚀 Oridium Node started.\n";

    Blockchain oridiumChain;
    const std::string blockchainFile = "blockchain.json";

    if (std::filesystem::exists("data/" + blockchainFile)) {
        std::cout << "📂 Loading blockchain...\n";
        if (Storage::loadBlockchain(oridiumChain, blockchainFile)) {
            std::cout << "✅ Blockchain loaded.\n";
        } else {
            std::cerr << "❌ Failed to load blockchain.\n";
            return 1;
        }
    } else {
        std::cout << "📄 No blockchain found. Creating genesis block...\n";
        std::filesystem::create_directories("./data");
        oridiumChain.addBlock({ Transaction("System", "Genesis", 0.0) });
    }

    // ✅ Mempool dynamique
    std::vector<Transaction> mempool;
    auto lastMineTime = std::chrono::steady_clock::now();

    while (true) {
        std::cout << "\n✏️ Enter transaction (sender receiver amount) or 'mine' to force mining:\n> ";
        std::string input;
        std::getline(std::cin, input);

        if (input == "mine") {
            // Minage forcé par l'utilisateur
            if (!mempool.empty()) {
                std::cout << "⛏️ Manual mining triggered with " << mempool.size() << " transaction(s).\n";
                oridiumChain.addBlock(mempool);
                mempool.clear();
                lastMineTime = std::chrono::steady_clock::now();
            } else {
                std::cout << "⚠️ Mempool empty, nothing to mine.\n";
            }
            continue;
        }

        std::istringstream iss(input);
        std::string sender, receiver;
        double amount;
        if (iss >> sender >> receiver >> amount) {
            mempool.emplace_back(sender, receiver, amount);
            std::cout << "✅ Transaction added to mempool: " << sender << " -> " << receiver << " : " << amount << "\n";
        } else {
            std::cout << "❌ Invalid format. Example: Alice Bob 50\n";
            continue;
        }

        // ✅ Mining automatique si 3 transactions ou 30 secondes passées
        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - lastMineTime).count();

        if (mempool.size() >= 3 || elapsed >= 30) {
            std::cout << "⛏️ Auto-mining " << mempool.size() << " transaction(s)...\n";
            oridiumChain.addBlock(mempool);
            mempool.clear();
            lastMineTime = std::chrono::steady_clock::now();
        }
    }

    return 0;
}