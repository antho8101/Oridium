// Oridium Project - (c) 2025 Oridium - MIT License
#ifndef TRANSACTION_H
#define TRANSACTION_H

#include <string>

class Transaction {
public:
    std::string sender;
    std::string receiver;
    double amount;
    std::string signature; // Placeholder pour la future signature cryptographique

    Transaction(const std::string& sender, const std::string& receiver, double amount);

    std::string toString() const;
};

#endif // TRANSACTION_H