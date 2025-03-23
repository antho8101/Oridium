# Oridium Project - (c) 2025 Oridium - MIT License
cmake_minimum_required(VERSION 3.22)
project(Oridium VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# 📂 Répertoires include
include_directories(${PROJECT_SOURCE_DIR}/core)
include_directories(${PROJECT_SOURCE_DIR}/external/json/single_include)
include_directories(${CMAKE_SOURCE_DIR}/external)

# 📍 OpenSSL (Windows - MSVC)
set(OPENSSL_ROOT_DIR "C:/Program Files/OpenSSL-Win64")
set(OPENSSL_INCLUDE_DIR "${OPENSSL_ROOT_DIR}/include")
set(OPENSSL_LIB_DIR "${OPENSSL_ROOT_DIR}/lib")

include_directories(${OPENSSL_INCLUDE_DIR})
link_directories(${OPENSSL_LIB_DIR})

find_package(OpenSSL REQUIRED)

# 📄 Fichiers sources
add_executable(oridium
    src/main.cpp
    core/util.cpp
    core/Transaction.cpp
    core/Block.cpp
    core/Blockchain.cpp
    core/storage.cpp
)

# 📚 Link OpenSSL
target_link_libraries(oridium 
    OpenSSL::SSL
    OpenSSL::Crypto
)

# ✅ Copie automatique des DLL OpenSSL après build (sans te soucier du PATH)
add_custom_command(TARGET oridium POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        "${PROJECT_SOURCE_DIR}/external/openssl/libcrypto-3-x64.dll"
        "$<TARGET_FILE_DIR:oridium>"
)

add_custom_command(TARGET oridium POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        "${PROJECT_SOURCE_DIR}/external/openssl/libssl-3-x64.dll"
        "$<TARGET_FILE_DIR:oridium>"
)