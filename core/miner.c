#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten/emscripten.h>

#define SHA256_BLOCK_SIZE 32

// 🧪 Dummy SHA-256 (à remplacer par ta vraie implémentation si besoin)
void sha256(const uint8_t *data, size_t len, uint8_t *out) {
    for (size_t i = 0; i < 32; ++i) {
        out[i] = (uint8_t)(i + len); // simple pseudo-hash
    }
}

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
int mine(const uint8_t *input, size_t length, uint32_t difficulty, uint32_t *nonceOut, uint8_t *hashOut) {
    if (!input || !nonceOut || !hashOut) {
        EM_ASM({ console.error("❌ NULL pointer passed to mine()"); });
        return -1;
    }

    if (length == 0 || length > 512) {
        EM_ASM({ console.error("❌ Invalid input length:", $0); }, length);
        return -2;
    }

    uint8_t *buffer = (uint8_t *)malloc(length + 4);
    if (!buffer) {
        EM_ASM({ console.error("❌ malloc failed in WASM"); });
        return -3;
    }

    memcpy(buffer, input, length);
    uint32_t nonce = 0;
    uint8_t hash[SHA256_BLOCK_SIZE];

    while (1) {
        memcpy(buffer + length, &nonce, 4);
        sha256(buffer, length + 4, hash);

        int valid = 1;
        for (uint32_t i = 0; i < difficulty; i++) {
            if (hash[i] != 0x00) {
                valid = 0;
                break;
            }
        }

        if (valid) {
            *nonceOut = nonce;
            memcpy(hashOut, hash, SHA256_BLOCK_SIZE);
            free(buffer);
            return 1;
        }

        if (nonce == 0xFFFFFFFF) {
            free(buffer);
            return 0;
        }

        nonce++;
    }
}

#ifdef __cplusplus
}
#endif

int main() { return 0; }
