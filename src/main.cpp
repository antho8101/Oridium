#include "blockchain.h"
#include <iostream>

int main() {
    std::cout << "🚀 Oridium Blockchain starting...\n";

    Blockchain oridiumChain;

    oridiumChain.addBlock({"Alice -> Bob : 50 ORI"});
    oridiumChain.addBlock({"Bob -> Charlie : 25 ORI", "Charlie -> Dave : 10 ORI"});
    oridiumChain.addBlock({"Dave -> Eve : 15 ORI"});

    oridiumChain.printChain();

    if (oridiumChain.isChainValid()) {
        std::cout << "✅ Blockchain is VALID.\n";
    } else {
        std::cout << "❌ Blockchain is INVALID.\n";
    }

    std::cout << "\n🚀 Execution finished. Press any key to exit...\n";
    system("pause");
    return 0;
}