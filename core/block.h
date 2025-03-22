#ifndef BLOCK_H
#define BLOCK_H

#include <string>
#include <vector>

class Block {
public:
    int index;
    int64_t timestamp;
    std::vector<std::string> transactions;
    std::string previousHash;
    std::string hash;
    int nonce;

    Block(int idx, int64_t time, const std::vector<std::string>& txs, const std::string& prevHash);
    Block(int idx, const std::vector<std::string>& txs);

    std::string calculateHash() const;
    void mineBlock(int difficulty);
};

#endif // BLOCK_H