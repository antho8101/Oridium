#define EMSCRIPTEN_KEEPALIVE extern "C" __attribute__((used))

#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten/emscripten.h>
#include "sha256.h"

EMSCRIPTEN_KEEPALIVE
int mine(const uint8_t* input, size_t length, uint32_t difficulty, uint32_t* nonceOut, uint8_t* hashOut) {
    if (length > 512) return -1;

    uint8_t* buffer = (uint8_t*)malloc(length + 4);
    if (!buffer) return -2;

    memcpy(buffer, input, length);
    uint32_t nonce = 0;
    uint8_t hash[32];

    while (1) {
        memcpy(buffer + length, &nonce, 4);
        sha256(buffer, length + 4, hash);

        int valid = 1;
        for (uint32_t i = 0; i < difficulty; ++i) {
            if (hash[i] != 0x00) {
                valid = 0;
                break;
            }
        }

        if (valid) {
            *nonceOut = nonce;
            memcpy(hashOut, hash, 32);
            free(buffer);
            return 1;
        }

        nonce++;
        if (nonce == 0xFFFFFFFF) {
            free(buffer);
            return 0;
        }
    }
}

int main() {
    return 0;
}