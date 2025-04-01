#include "sha256.h"
#include "picosha2.h"

std::string sha256(const std::string &input) {
    return picosha2::hash256_hex_string(input);
}

void sha256(const uint8_t *data, size_t len, uint8_t *hash) {
    std::vector<uint8_t> inputVec(data, data + len);
    picosha2::hash256(inputVec.begin(), inputVec.end(), hash, hash + 32);
}