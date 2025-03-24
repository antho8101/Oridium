# 💎 Oridium - The Digital Gold of Tomorrow

Oridium is a **modern, high-performance blockchain** designed as a rare and precious digital asset — inspired by Bitcoin's principles but optimized for the future. Built with **C++20 and Qt5**, it provides a solid foundation for decentralized applications, digital payments, and secure peer-to-peer transactions.

## 🌟 Project Highlights
- **Language:** C++20  
- **Graphical Wallet:** Qt5 + HTML/CSS/JS Frontend  
- **Cross-platform:** Windows (Visual Studio 2022) - Linux support coming  
- **Package Manager:** vcpkg  
- **Build System:** CMake 3.21+  

## 🔥 Key Features
✅ Fully decentralized blockchain protocol  
✅ Integrated **Graphical Wallet (Web & Qt GUI)**  
✅ Advanced cryptographic algorithms  
✅ ZeroMQ support for scalable messaging  
✅ SQLite3 for efficient data management  
✅ Libevent for high-performance networking  
✅ Modular architecture — future-proof design  

---

## 🪙 Oridium Wallet (Web Version)
The **Oridium Wallet** allows you to:
- View your $ORID balance
- Track transactions
- Manage private/public keys (local JSON storage)
- **Mine $ORID directly from your browser (WASM)** *(coming soon)*
- Real-time price chart and market value

Built for **simplicity and performance**, the wallet runs **fully local** — no server required.

---

## 🛠 Build Instructions (Windows / Visual Studio 2022)

### 💾 Dependencies (via vcpkg)
- BerkeleyDB
- Boost
- libevent
- ZeroMQ
- SQLite3
- QRencode
- Qt5

### ✅ Requirements
- Visual Studio 2022
- CMake 3.21+
- vcpkg
- Python 3.10+
- Git

### 💻 Build Commands
```bash
git clone https://github.com/antho8101/Oridium.git
cd Oridium
cmake --preset vs2022
cmake --build out/build/vs2022 --config Release
```

### 📜 License
Oridium is an open-source project released under the MIT license. See the LICENSE file for details.

### 🤝 Contributing
We welcome community contributions!
Feel free to fork the project, open pull requests, or suggest improvements.

- Fork the repo

- Open pull requests

- Suggest improvements

---

🚀 Project Status: Early Development Phase 🚧
🌐 Official Website: (Coming Soon)