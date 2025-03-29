#include <iostream>

extern "C" {
    void mine() {
        std::cout << "Mining started..." << std::endl;
        // Logique de minage ici
    }
}