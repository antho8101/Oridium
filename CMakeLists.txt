cmake_minimum_required(VERSION 3.22)
project(Oridium VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

include_directories(
    ${PROJECT_SOURCE_DIR}/include
    ${PROJECT_SOURCE_DIR}/core
)

add_executable(oridium
    src/main.cpp
    src/util.cpp
    core/block.cpp
    core/blockchain.cpp
)