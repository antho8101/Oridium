@echo off
call ..\emsdk\emsdk_env.bat

emcc extern_api.cpp \
  -I. -std=c++17 \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_mine_reward"]' ^
  -s EXPORTED_RUNTIME_METHODS='["cwrap", "ccall"]' ^
  -o ..\oridium-wallet\wasm\blockchain.js

echo ✅ Compilation terminée !
pause