# Contributing to Oridium 🚀

Thank you for your interest in contributing to **Oridium**!  
We welcome pull requests, issues, ideas, and improvements.

---

## 🛠️ Project Setup

To contribute, please make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) *(used for WebAssembly mining)*

### Setting up Emscripten (for mining module)

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

## 📦 Repository Structure

- oridium-wallet/ → Front-end code (HTML/CSS/JS)

- scripts/ → JS logic for mining, wallet creation, encryption

- wasm/ → WebAssembly modules (compiled from C/C++)

- styles/ → Modular CSS by components

## 🧑‍💻 How to Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR-USERNAME/Oridium.git
cd Oridium
```

### 2. Create a Branch

```bash
git checkout -b feature/my-awesome-feature
```

### 3. Make Changes

Update code, fix bugs, or improve the UI.

### 4. Commit

```bash
git add .
git commit -m "✨ Add my awesome feature"
```

### 5. Push & PR

```bash
git push origin feature/my-awesome-feature
```

Then open a pull request on GitHub and describe your changes clearly 🙌

## ✅ Guidelines

- Use clear and concise commit messages.

- Maintain coding style (indentation, naming).

- Avoid pushing to main directly unless you're a core maintainer.

- Test your code before submitting a PR.

## 🧾 Code of Conduct

Be respectful. Be kind. Assume good intentions.
We're building something valuable together. Let's keep it healthy 💗

# 🤝 Questions?

Feel free to open an issue if you’re not sure where to start or have any questions.