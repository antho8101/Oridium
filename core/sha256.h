#pragma once
#include <cstddef>
#include <cstdint>
#include <string>

#include <string>
#include <cstdint>

std::string sha256(const std::string &input);

// 🔧 Nouvelle déclaration :
void sha256(const uint8_t* data, size_t len, uint8_t* outHash);