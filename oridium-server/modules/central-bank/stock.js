// modules/central-bank/stock.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Support __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STOCK_FILE = path.join(__dirname, "../../data/stock.json");

export function getStock() {
  const raw = fs.readFileSync(STOCK_FILE);
  return JSON.parse(raw);
}

export function saveStock(stock) {
  fs.writeFileSync(STOCK_FILE, JSON.stringify(stock, null, 2));
}

export function withdraw(amount) {
  const stock = getStock();
  if (stock.available < amount) {
    throw new Error("Not enough stock available.");
  }
  stock.available -= amount;
  saveStock(stock);
  return stock;
}

export function add(amount) {
  const stock = getStock();
  stock.available += amount;
  saveStock(stock);
  return stock;
}

export function resetStock(newQuota) {
  const stock = {
    available: newQuota,
    maxWeeklyQuota: newQuota,
    generatedAt: new Date().toISOString()
  };
  saveStock(stock);
  return stock;
}