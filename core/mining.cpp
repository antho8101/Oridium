#include <iostream>
#include <sstream>
#include <ctime>
#include <string>
#include "sha256.h"

extern "C" {
    const char* mine() {
        static std::string result; // static pour rester en mémoire après le retour
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
        result = finalResult.str();

        return result.c_str(); // retourne nonce;hash
    }
}