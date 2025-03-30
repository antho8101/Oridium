// Génère une paire de clés aléatoires
export function generateKeyPair() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const privateKey = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    const publicKey = "0x" + privateKey.slice(0, 40); // placeholder
    return { privateKey, publicKey };
  }
  
  // Génère une paire de clés depuis un "seed" (mot secret)
  export async function generateKeyPairFromSeed(seed) {
    const encoder = new TextEncoder();
    const data = encoder.encode(seed);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
    const privateKey = hex.slice(0, 64);
    const publicKey = "0x" + hex.slice(64, 104); // encore un placeholder, à remplacer plus tard si besoin
  
    return { privateKey, publicKey };
  }
  
  // Chiffre la clé privée avec un mot de passe
  export async function encryptPrivateKey(privateKey, password) {
    const enc = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
  
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
  
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      enc.encode(privateKey)
    );
  
    return {
      encrypted: arrayBufferToHex(encrypted),
      iv: arrayBufferToHex(iv)
    };
  }
  
  // Convertit un ArrayBuffer en hexadécimal
  function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }  