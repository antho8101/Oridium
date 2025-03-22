#include "blockchain.h"

int main() {
    Blockchain blockchain;

    blockchain.addBlock("Transaction 1");
    blockchain.addBlock("Transaction 2");
    blockchain.addBlock("Transaction 3");

    blockchain.printChain();
    return 0;
}