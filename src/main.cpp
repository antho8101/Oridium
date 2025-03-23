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

    std::vector<Transaction> mempool;
    auto lastMineTime = std::chrono::steady_clock::now();

    while (true) {
        std::cout << "\n✏️ Enter transaction (sender receiver amount), 'mine', or 'balance <address>':\n> ";
        std::string input;
        std::getline(std::cin, input);

        // ✅ Balance check
        if (input.rfind("balance ", 0) == 0) {
            std::string address = input.substr(8);
            double balance = oridiumChain.getBalance(address);
            std::cout << "💰 Balance of " << address << ": " << balance << "\n";
            continue;
        }

        if (input == "mine") {
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