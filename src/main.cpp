// Oridium Project - (c) 2025 Oridium - MIT License
#include "blockchain.h"
#include "transaction.h"
#include "storage.h"   // ✅ Ajout pour la sauvegarde/chargement
#include <iostream>
#include <windows.h>
#include <thread>      // ✅ Pour sleep
#include <chrono>      // ✅ Pour chrono
#include <filesystem>  // ✅ Pour vérifier l'existence du fichier et créer les dossiers

int main() {
    // ✅ Fix UTF-8 pour la console Windows
    SetConsoleOutputCP(CP_UTF8);

    // ✅ Indique à l'exécutable où trouver les DLL OpenSSL
    SetDllDirectoryA("E:\\Oridium\\external\\openssl\\");

    std::cout << "🚀 Le programme démarre bien.\n";

    Blockchain oridiumChain;
    const std::string blockchainFile = "blockchain.json";  // ✅ NE PAS mettre le chemin ici

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

        // ✅ Ajout des blocs avec des objets Transaction
        oridiumChain.addBlock({ Transaction("Alice", "Bob", 50.0) });
        oridiumChain.addBlock({ Transaction("Bob", "Charlie", 25.0), Transaction("Charlie", "Dave", 10.0) });
        oridiumChain.addBlock({ Transaction("Dave", "Eve", 15.0) });

        // ✅ Création du dossier data si nécessaire
        std::filesystem::create_directories("./data");

        // ✅ Sauvegarde initiale
        if (Storage::saveBlockchain(oridiumChain, blockchainFile)) {
            std::cout << "✅ Blockchain initiale sauvegardée avec succès.\n";
        } else {
            std::cerr << "❌ Erreur lors de la sauvegarde initiale.\n";
        }
    }

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
        std::this_thread::sleep_for(std::chrono::seconds(5)); // Pause de 5 secondes
    }

    return 0;
}