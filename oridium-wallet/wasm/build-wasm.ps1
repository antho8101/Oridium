# build-wasm.ps1

Write-Host "Setting up Emscripten environment..."
Set-Location E:\Oridium\emsdk
.\emsdk_env.ps1

Write-Host "Building Oridium WebAssembly module..."

emcc `
  E:\Oridium\core\blockchain.cpp `
  E:\Oridium\core\block.cpp `
  E:\Oridium\core\transaction.cpp `
  E:\Oridium\core\storage.cpp `
  E:\Oridium\core\sha256.cpp `
  -I E:\Oridium\external `
  -o E:\Oridium\oridium-wallet\wasm\blockchain.js `
  -s EXPORTED_FUNCTIONS='["_mine_reward","_get_balance"]' `
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' `
  --no-entry `
  -s ALLOW_MEMORY_GROWTH=1 `
  -s MODULARIZE=1 `
  -s EXPORT_ES6=1

Write-Host "✅ WASM build complete! Check blockchain.js and blockchain.wasm."
