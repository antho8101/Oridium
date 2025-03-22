cmake_minimum_required(VERSION 3.22)
project(Oridium VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

include_directories(${PROJECT_SOURCE_DIR}/core)

set(OPENSSL_ROOT_DIR "C:/Program Files/OpenSSL-Win64")
set(OPENSSL_INCLUDE_DIR "${OPENSSL_ROOT_DIR}/include")
set(OPENSSL_LIB_DIR "${OPENSSL_ROOT_DIR}/lib")

include_directories(${OPENSSL_INCLUDE_DIR})
link_directories(${OPENSSL_LIB_DIR})

find_package(OpenSSL REQUIRED)

add_executable(oridium
    src/main.cpp
    src/util.cpp
    core/block.cpp
    core/blockchain.cpp
)

target_link_libraries(oridium OpenSSL::SSL OpenSSL::Crypto)