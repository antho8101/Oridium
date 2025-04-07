#include "blockchain.h"

extern "C" {
    void mine_reward(const char* address) {
        Blockchain blockchain;
        blockchain.loadFromDisk(); // ou adapte si tu as une autre méthode
        blockchain.rewardMiner(std::string(address));
    }

    double get_balance(const char* address) {
        Blockchain blockchain;
        blockchain.loadFromDisk();  // 🧠 ← maintenant c’est valide
        return blockchain.getBalance(std::string(address));
    }
}