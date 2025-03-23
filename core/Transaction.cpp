// Oridium Project - (c) 2025 Tony - MIT License
#include "Transaction.h"

Transaction::Transaction(const std::string& sender, const std::string& receiver, double amount)
    : sender(sender), receiver(receiver), amount(amount), signature("") {}

std::string Transaction::toString() const {
    return sender + " -> " + receiver + " : " + std::to_string(amount) + " [" + signature + "]";
}