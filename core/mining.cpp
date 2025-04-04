#include <sstream>
#include <ctime>
#include <string>
#include <cstring> // pour memcpy
#include <cstdlib> // pour malloc, free
#include "sha256.h"

extern "C" {

// Fonction exportée compatible WebAssembly
__attribute__((used)) const char* mine_block() {
    std::string difficulty_prefix = "0000";
    std::string hash_result;
    int nonce = 0;

    std::time_t timestamp = std::time(nullptr);
    std::string blockData = "Simple Block Data";

    do {
        nonce++;
        std::stringstream ss;
        ss << blockData << nonce << timestamp;
        hash_result = sha256(ss.str());

    } while (hash_result.substr(0, difficulty_prefix.length()) != difficulty_prefix);

    std::stringstream finalResult;
    finalResult << nonce << ";" << hash_result;
    std::string result = finalResult.str();

    // Allouer la mémoire pour retourner la chaîne à JS
    char* output = (char*)malloc(result.size() + 1);
    std::memcpy(output, result.c_str(), result.size() + 1); // copie avec le null terminator

    return output;
}

// Fonction pour libérer la mémoire depuis JS
__attribute__((used)) void free_result(const char* ptr) {
    free((void*)ptr);
}

}