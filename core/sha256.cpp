#include "sha256.h"
#include "picosha2.h"

std::string sha256(const std::string &input) {
    return picosha2::hash256_hex_string(input);
}