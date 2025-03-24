#ifndef UTIL_H
#define UTIL_H
#include "util.h"
#include <string>

// 🔒 Fonction de hachage SHA-256 (OpenSSL)
std::string sha256(const std::string& input);

#endif // UTIL_H