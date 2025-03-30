![image](https://github.com/user-attachments/assets/f96c89c1-9980-4be0-abc0-42891f0881eb)

# 💎 Oridium — The Digital Gold of Tomorrow

🚧 **Status:** Early Development • `███████-------` 40% Complete  
📅 **Launch target:** Q3 2025

Oridium is a **modern, high-performance blockchain** inspired by Bitcoin’s fundamentals, but redesigned with a **modular architecture**, modern cryptography, and real-world usability in mind.

🛠 Built with **C++20**, **Qt5**, **WebAssembly**, and a local-first wallet powered by HTML/CSS/JS.  

📖 [Read our White Paper (v1 - March 2025)](https://ac-global-business.notion.site/Oridium-Whitepaper-1c12085e713e803aaaa8f832f0366dfb?pvs=4)

---

## 📚 Table of Contents
- [🌟 Project Highlights](#-project-highlights)
- [🔥 Key Features](#-key-features)
- [🪙 Oridium Wallet (Web)](#-oridium-wallet-web-version)
- [🛠 Build Instructions](#-build-instructions-windows--visual-studio-2022)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)
- [💬 Community & Support](#-community--support)

---

## 🌟 Project Highlights

| 🔧 Stack          | Details                                |
|------------------|----------------------------------------|
| Language         | C++20                                  |
| UI Framework     | Qt5 + HTML/CSS/JS Web Wallet           |
| Platform         | Windows (Linux in progress)            |
| Build System     | CMake 3.21+                             |
| Package Manager  | vcpkg                                  |
| Wallet Modules   | WebAssembly mining, JSON key storage   |

---

## 🔥 Key Features

✅ Lightweight & decentralized  
✅ Local wallet – no server required  
✅ Keypair generation with optional password encryption  
✅ Secure storage via downloadable encrypted JSON  
✅ Web mining (WASM-based, in progress)  
✅ Live Oridium price chart  

---

## 🪙 Oridium Wallet (Web Version)

The **Oridium Wallet** is a minimalistic web-based wallet to:
- 🔐 Generate a seed-based wallet (JSON format)
- 🧠 Restore wallet using your secret phrase
- 💼 Send/Receive funds via your public key
- 🧪 [Coming soon] Web mining via WASM

Runs 100% locally — works offline and requires **no backend**.

---

## 🛠 Build Instructions (Windows / Visual Studio 2022)

### 📦 Dependencies (via `vcpkg`)
- Boost
- BerkeleyDB
- ZeroMQ
- SQLite3
- Libevent
- QRencode
- Qt5

### ✅ Requirements
- Visual Studio 2022
- CMake ≥ 3.21
- vcpkg
- Python ≥ 3.10
- Git

### 🧱 Build Commands
```bash
git clone https://github.com/antho8101/Oridium.git
cd Oridium
cmake --preset vs2022
cmake --build out/build/vs2022 --config Release
```

### 📜 License
This project is open source under the [MIT License](./LICENSE).
Feel free to use, modify, and redistribute with attribution.

### 🤝 Contributing
We welcome pull requests and ideas from the community!

🔗 Read our [Contributing Guide](./CONTRIBUTING.md)
📜 See our [Code of Conduct](./CODE_OF_CONDUCT.md)

---

🌐 Official Website: (Coming Soon)

📱 [Live Wallet Preview - Coming Soon]

<p align="center">
  <img src="https://img.shields.io/badge/C%2B%2B-20-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/CMake-Build-green?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=flat-square" />
</p>
