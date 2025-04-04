#include <string>
#include <sstream>
#include <cstdlib>
#include <cstring>
#include "sha256.h"

extern "C" {

__attribute__((used)) const char* mine_block(const char* input, int difficulty) {
    std::string prefix(difficulty, '0');
    std::string hash;
    int nonce = 0;

    do {
        nonce++;
        std::stringstream ss;
        ss << input << nonce;
        hash = sha256(ss.str());
    } while (hash.substr(0, difficulty) != prefix);

    std::stringstream final;
    final << nonce << ";" << hash;
    std::string result = final.str();

    char* res_ptr = (char*)malloc(result.size() + 1);
    std::memcpy(res_ptr, result.c_str(), result.size() + 1);
    return res_ptr;
}

__attribute__((used)) void free_result(const char* ptr) {
    free((void*)ptr);
}

}
