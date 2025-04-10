# build-wasm.ps1

Write-Host "Setting up Emscripten environment..."
Set-Location E:\Oridium\emsdk
.\emsdk_env.ps1

Write-Host "Building Oridium WebAssembly module..."

em++ `
  "E:\Oridium\core\blockchain.cpp" `
  "E:\Oridium\core\block.cpp" `
  "E:\Oridium\core\Transaction.cpp" `
  "E:\Oridium\core\storage.cpp" `
  "E:\Oridium\core\sha256.cpp" `
  -I "E:\Oridium\external" `
  -o "E:\Oridium\oridium-wallet\wasm\blockchain.js" `
  -std=c++17 `
  -s EXPORTED_FUNCTIONS='["_init_blockchain","_initialize_blockchain","_mine_reward","_get_balance"]' `
  -s EXPORTED_RUNTIME_METHODS='["FS","IDBFS","cwrap","UTF8ToString","stringToUTF8","lengthBytesUTF8","malloc","free"]' `
  --no-entry `
  -s FORCE_FILESYSTEM=1 `
  -s MODULARIZE=1 `
  -s EXPORT_ES6=1 `
  -s ALLOW_MEMORY_GROWTH=1 `
  -O3



Write-Host "✅ WASM build complete! Check blockchain.js and blockchain.wasm."
