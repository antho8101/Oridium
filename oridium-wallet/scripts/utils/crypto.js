import * as bip39 from 'https://esm.sh/@scure/bip39';
import { wordlist } from 'https://esm.sh/@scure/bip39/wordlists/english';

import { HDKey } from 'https://esm.sh/ethereum-cryptography@1.2.0/hdkey';
import { keccak256 } from 'https://esm.sh/ethereum-cryptography@1.2.0/keccak';
import { bytesToHex } from 'https://esm.sh/@noble/hashes@1.3.0/utils';
import { getPublicKey } from 'https://esm.sh/@noble/secp256k1@1.7.1';

export async function generateKeyPairFromSeed(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic, wordlist)) {
    throw new Error("Invalid mnemonic");
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive("m/44'/60'/0'/0/0");

  const privateKey = child.privateKey;
  const compressed = getPublicKey(privateKey, true);
  const publicKey = window.nobleSecp256k1.Point.fromHex(compressed).toRawBytes(false);

  const body = publicKey.slice(1);
  const hash = keccak256(body);
  const addressBytes = hash.slice(-20);
  const address = "0x" + bytesToHex(addressBytes);

  return {
    publicKey: address,
    privateKey: bytesToHex(privateKey),
  };
}

export async function encryptPrivateKey(privateKeyHex, password) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: iv,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(privateKeyHex)
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: Array.from(iv).map((b) => b.toString(16).padStart(2, "0")).join(""),
    method: "AES-GCM",
  };
}

export async function decryptPrivateKey(encrypted, password, ivHex) {
  const encoder = new TextEncoder();
  const encryptedBytes = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(ivHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: iv,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedBytes
  );

  return new TextDecoder().decode(decrypted);
}
