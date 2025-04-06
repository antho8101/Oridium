#include "blockchain.h"

static Blockchain blockchainInstance;

extern "C" {
    void mine_reward(const char* walletAddress) {
        blockchainInstance.rewardMiner(std::string(walletAddress));
    }
}
