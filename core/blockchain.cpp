#include "blockchain.h"
#include <iostream>
#include <chrono>

Blockchain::Blockchain() {
    std::cout << "✅ Initialisation de la blockchain avec le Genesis Block\n";
    chain.emplace_back(0, std::vector<std::string>{"Genesis Block"});
}

void Blockchain::addBlock(const std::vector<std::string>& transactions) {
    std::cout << "✅ Tentative d'ajout d'un bloc avec " << transactions.size() << " transaction(s)\n";

    const Block& prev = chain.back();
    Block newBlock(
        prev.index + 1,
        static_cast<int64_t>(std::chrono::system_clock::now().time_since_epoch().count()),
        transactions,
        prev.hash
    );

    std::cout << "⚙️ Début du minage du bloc " << newBlock.index << " avec une difficulté de " << difficulty << "\n";
    newBlock.mineBlock(difficulty);  // ✅ UN SEUL APPEL ICI

    std::cout << "✅ Bloc " << newBlock.index << " miné avec succès. Hash : " << newBlock.hash << "\n";
    chain.push_back(newBlock);
}

void Blockchain::printChain() const {
    std::cout << "📝 Affichage de la blockchain :\n";
    for (const auto& block : chain) {
        std::cout << "Index: " << block.index << "\n";
        for (const auto& tx : block.transactions) {
            std::cout << "Transaction: " << tx << "\n";
        }
        std::cout << "Hash: " << block.hash << "\n\n";
    }
}

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
