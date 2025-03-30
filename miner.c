// miner.c — Standalone SHA-256 Proof-of-Work compatible with WebAssembly

#define __STDC_WANT_LIB_EXT1__ 1

#include <stdint.h>         // pour uint64_t, uint32_t, etc.
#include <stddef.h>         // pour size_t
#include <string.h>         // pour memcpy
#include <emscripten/emscripten.h>  // pour EMSCRIPTEN_KEEPALIVE

// --- SHA-256 core (simple version) ---
#define ROTRIGHT(a,b) (((a) >> (b)) | ((a) << (32-(b))))
#define CH(x,y,z) (((x) & (y)) ^ (~(x) & (z)))
#define MAJ(x,y,z) (((x) & (y)) ^ ((x) & (z)) ^ ((y) & (z)))
#define EP0(x) (ROTRIGHT(x,2) ^ ROTRIGHT(x,13) ^ ROTRIGHT(x,22))
#define EP1(x) (ROTRIGHT(x,6) ^ ROTRIGHT(x,11) ^ ROTRIGHT(x,25))
#define SIG0(x) (ROTRIGHT(x,7) ^ ROTRIGHT(x,18) ^ ((x) >> 3))
#define SIG1(x) (ROTRIGHT(x,17) ^ ROTRIGHT(x,19) ^ ((x) >> 10))

static const uint32_t k[64] = {
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
};

void sha256(const uint8_t *data, size_t len, uint8_t *hash) {
    uint32_t h[8] = {
        0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
        0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19
    };

    uint8_t block[64];
    size_t i, j;

    for (i = 0; i + 64 <= len; i += 64) {
        uint32_t w[64];
        for (j = 0; j < 16; ++j)
            w[j] = (data[i + 4*j] << 24) | (data[i + 4*j+1] << 16) | (data[i + 4*j+2] << 8) | (data[i + 4*j+3]);

        for (j = 16; j < 64; ++j)
            w[j] = SIG1(w[j-2]) + w[j-7] + SIG0(w[j-15]) + w[j-16];

        uint32_t a = h[0], b = h[1], c = h[2], d = h[3];
        uint32_t e = h[4], f = h[5], g = h[6], h0 = h[7];

        for (j = 0; j < 64; ++j) {
            uint32_t t1 = h0 + EP1(e) + CH(e,f,g) + k[j] + w[j];
            uint32_t t2 = EP0(a) + MAJ(a,b,c);
            h0 = g;
            g = f;
            f = e;
            e = d + t1;
            d = c;
            c = b;
            b = a;
            a = t1 + t2;
        }

        h[0] += a; h[1] += b; h[2] += c; h[3] += d;
        h[4] += e; h[5] += f; h[6] += g; h[7] += h0;
    }

    memset(block, 0, 64);
    size_t rem = len - i;
    memcpy(block, data + i, rem);
    block[rem] = 0x80;
    if (rem >= 56) {
        sha256(block, 64, hash);
        memset(block, 0, 64);
    }

    uint64_t bits = len * 8;
    block[63] = bits & 0xFF;
    block[62] = (bits >> 8) & 0xFF;
    block[61] = (bits >> 16) & 0xFF;
    block[60] = (bits >> 24) & 0xFF;
    block[59] = (bits >> 32) & 0xFF;
    block[58] = (bits >> 40) & 0xFF;
    block[57] = (bits >> 48) & 0xFF;
    block[56] = (bits >> 56) & 0xFF;
    sha256(block, 64, hash);
}

// --- Proof-of-Work mining ---
EMSCRIPTEN_KEEPALIVE
int mine(uint8_t *input, size_t length, uint32_t difficulty, uint64_t *nonceOut, uint8_t *hashOut) {
    uint32_t nonce = 0;
    uint8_t buffer[256];
    uint8_t hash[32];

    if (length > 220) return -1;

    memcpy(buffer, input, length);

    while (1) {
        memcpy(buffer + length, &nonce, 4);
        sha256(buffer, length + 4, hash);

        int valid = 1;
        for (int i = 0; i < difficulty; i++) {
            if (hash[i] != 0x00) {
                valid = 0;
                break;
            }
        }

        if (valid) {
            *nonceOut = nonce;
            memcpy(hashOut, hash, 32);
            return 1;
        }

        nonce++;
        if (nonce == 0xFFFFFFFF) return 0;
    }
}