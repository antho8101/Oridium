// Oridium Project - (c) 2025 Tony - MIT License
#include "blockchain.h"
#include "transaction.h"
#include <iostream>
#include <windows.h>
#include <thread>      // ✅ Pour sleep
#include <chrono>      // ✅ Pour chrono

int main() {
    // ✅ Fix UTF-8 pour la console Windows
    SetConsoleOutputCP(CP_UTF8);

    // ✅ Indique à l'exécutable où trouver les DLL OpenSSL
    SetDllDirectoryA("E:\\Oridium\\external\\openssl\\");

    std::cout << "🚀 Le programme démarre bien." << std::endl;

    Blockchain oridiumChain;

    // ✅ Ajout des blocs avec des objets Transaction
    oridiumChain.addBlock({
        Transaction("Alice", "Bob", 50.0)
    });

    oridiumChain.addBlock({
        Transaction("Bob", "Charlie", 25.0),
        Transaction("Charlie", "Dave", 10.0)
    });

    oridiumChain.addBlock({
        Transaction("Dave", "Eve", 15.0)
    });

    oridiumChain.printChain();

    if (oridiumChain.isChainValid()) {
        std::cout << "✅ Blockchain is VALID.\n";
    } else {
        std::cout << "❌ Blockchain is INVALID.\n";
    }

    std::cout << "\n🚀 Execution finished. Mining loop running... Press CTRL+C to exit.\n";

    // ✅ Boucle infinie avec heartbeat toutes les 5 secondes
    while (true) {
        std::cout << "⛏️ Node is running...\n";
        std::this_thread::sleep_for(std::chrono::seconds(5)); // Pause de 5 secondes
    }

    return 0;
}