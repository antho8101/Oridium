#ifndef BLOCK_H
#define BLOCK_H

#include <string>

class Block {
public:
    int index;
    long timestamp;
    std::string data;
    std::string previousHash;
    std::string hash;

    Block(int idx, long time, const std::string& data, const std::string& prevHash);
    Block(int idx, const std::string& data); // ✅ Nouveau constructeur

    std::string calculateHash() const;
};

#endif // BLOCK_H