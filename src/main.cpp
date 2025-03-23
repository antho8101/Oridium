// Oridium Project - (c) 2025 Oridium - MIT License
#include "blockchain.h"
#include "transaction.h"
#include "storage.h"
#include <iostream>
#include <windows.h>
#include <thread>
#include <chrono>
#include <filesystem>

int main() {
    // ✅ Fix UTF-8 pour la console Windows
    SetConsoleOutputCP(CP_UTF8);
    SetDllDirectoryA("E:\\Oridium\\external\\openssl\\");

    std::cout << "🚀 Le programme démarre bien.\n";

    Blockchain oridiumChain;
    const std::string blockchainFile = "blockchain.json";

    // ✅ Chargement si la blockchain existe déjà
    if (std::filesystem::exists("data/" + blockchainFile)) {
        std::cout << "📂 Fichier blockchain détecté. Chargement...\n";
        if (Storage::loadBlockchain(oridiumChain, blockchainFile)) {
            std::cout << "✅ Blockchain chargée avec succès.\n";
        } else {
            std::cerr << "❌ Erreur lors du chargement de la blockchain.\n";
            return 1;
        }
    } else {
        std::cout << "📄 Aucun fichier blockchain trouvé. Création de la blockchain...\n";
        std::filesystem::create_directories("./data");
    }

    // ✅ Ajout de transactions dans le mempool
    oridiumChain.addTransaction(Transaction("Alice", "Bob", 50.0));
    oridiumChain.addTransaction(Transaction("Bob", "Charlie", 25.0));
    oridiumChain.addTransaction(Transaction("Charlie", "Dave", 10.0));
    oridiumChain.addTransaction(Transaction("Dave", "Eve", 15.0));

    // ✅ Minage des transactions en attente
    oridiumChain.minePendingTransactions();

    // ✅ Affichage de la blockchain
    oridiumChain.printChain();

    // ✅ Vérification de la validité
    if (oridiumChain.isChainValid()) {
        std::cout << "✅ Blockchain is VALID.\n";
    } else {
        std::cout << "❌ Blockchain is INVALID.\n";
    }

    std::cout << "\n🚀 Execution finished. Mining loop running... Press CTRL+C to exit.\n";

    // ✅ Boucle infinie avec heartbeat toutes les 5 secondes
    while (true) {
        std::cout << "⛏️ Node is running...\n";
        std::this_thread::sleep_for(std::chrono::seconds(5));
    }

    return 0;
}